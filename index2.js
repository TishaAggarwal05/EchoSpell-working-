const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const cors = require("cors");
const axios = require('axios');


const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const path = require('path');
const engine = require('ejs-mate');
const MongoStore = require("connect-mongo");

const app = express();
const port = 5500;

const User = require('./models/users.js');
const Unplay = require('./models/unplevel.js');
const Chapter = require('./models/chapters.js');
const Level = require('./models/levels.js');
const fetchData = require('./extract.js'); // function for assessment of json data
const fetchDatalvl = require('./extractlvl.js'); // function for lvl assessment of json data
const Phoneme = require('./models/phoneme');



// Set up EJS with ejs-mate
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));


async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
}
main().catch(err => console.log(err));

// Session Middleware (must come before flash)
app.use(session({
    secret: process.env.SESSION_SECRET, // Change this to a strong secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1-day session persistence
}));




// Flash middleware
const flash = require("connect-flash");
app.use(flash());

// Make flash messages available in all views using res.locals
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success");
    res.locals.error_msg = req.flash("error");
    next();
});

app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy for Authentication
passport.use(new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    const user = await User.findOne({ email });
    if (!user) return done(null, false, { message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: "Incorrect password" });
    return done(null, user);
}));

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// Middleware to Check if User is Logged In
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}

app.get('/', (req, res) => {
    res.render('landing');
});

app.get('/login', (req, res) => {
    res.render('login', { messages: { error: req.flash("error") || [] } });
});

app.post('/login', (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash("error", info.message);
            res.render('login', { messages: { error: req.flash("error") || [] } });
        }

        req.login(user, (err) => {
            if (err) return next(err);
            return res.redirect(`/user/profile/${user._id}`); 
        });
    })(req, res, next);
});

app.get('/signup', (req, res) => {
    res.render('signup', { messages: req.flash(), formData: {} });
});
// Handle POST request for user registration
app.post('/signup', async (req, res) => {
    const { username, parent, email, password } = req.body;


    try {
        let existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash("error", "An account with this email already exists. Please log in.");
            return res.render("signup", { messages: { error: req.flash("error") }, formData: req.body });
        }

        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            req.flash("error", "This username is already taken. Try a different one.");
            return res.render("signup", { messages: { error: req.flash("error") }, formData: req.body });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, parent, email, password: hashedPassword });
        await newUser.save();

        req.flash("success", "User registered successfully!");
        return res.redirect(`/realtime/${newUser._id}`);

    } catch (err) {
        console.error("Error during signup:", err);
        req.flash("error", "Something went wrong. Please try again.");
        return res.render('signup', { messages: { error: req.flash("error") }, formData: req.body });
    }
});

// Logout Route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) console.error(err);
        res.redirect("/");
    });
});


app.get('/realtime/:id', async(req, res) => {
    const { id } = req.params;
    
    if(req.query.text){
        const {text,phoneme}= req.query;
        res.render('realtime2',{id,text,phoneme,initial:false})//lvl assessment
    }else{
        const user= await User.findOne({_id:id})
        res.render('realtime2', { id, initial:true,user}); // initial assessment
    }
    
});

app.post('/initassessment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { totalN_best } = req.body;
        console.log("total Nbest", totalN_best);
        await User.findByIdAndUpdate(id, {
            "initialAssessment.date": new Date(),
            "initialAssessment.data": totalN_best
        });
        res.json({ message: "Data saved successfully!", redirect: `/results/${id}` });
    } catch (error) {
        res.status(500).json({ error: "Failed to save data", details: error });
    }
});

app.get("/results/:id", async (req, res) => {
    const { id } = req.params;//userid
    const { lowAccur, avgPhonemeAccuracy } = await fetchData(id);
    console.log("Low Accuracy Data:", lowAccur);
    const userId = new mongoose.Types.ObjectId(id);
    //making of chapters from initially assessed low accuracy data
    for (const arr of lowAccur) {
        const phoneme = arr[0];
        const score = arr[1];
        const newCh = new Chapter({ user_id: userId, phoneme: phoneme, currentAccur: score });
        await newCh.save();
        await User.findByIdAndUpdate(userId, { $push: { chapters: newCh._id } }, { new: true });//adding info of chapter in user collection too
    }
    res.render('confirmation', { id });//will redirect to profile
});

app.get('/user/profile/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Fetching profile for user id:", id);
    const { lowAccur, avgPhonemeAccuracy } = await fetchData(id);
    const user = await User.findOne({ _id: id }).populate('chapters');
    console.log(user);
    res.render('profile', { user, avgPhonemeAccuracy });
});

app.post('/level/:exercise/:id', async (req, res) => {
    try {
        const {exercise, id } = req.params;//userid
        const { totalN_best } = req.body;
        console.log("total Nbest", totalN_best);
        //ispe aye hai toh matlab wo level khel liya hai 
        //pusing played lvl in levels array 
        const user= await User.findById(id).populate('chapters');
        const lvl = await Unplay.findOne({//finding level to be removed from unplay ie lvl played
            user_id: id,
            "ULdata.reply.Speech Exercise":exercise
          });
        console.log("lvl played : ",lvl)
        //add this lvl in Level collection
        const playedlvl = new Level({ chapter_id:lvl.chapter_id ,user_id: id, phoneme: lvl.phoneme,  difficulty: lvl.difficulty, Ldata:lvl.ULdata,Assessment:{ date:new Date(),data:totalN_best} });//left field to fill score and rate
        await playedlvl.save();
        console.log(playedlvl)

        res.json({ message: "Data saved successfully!", redirect: `/lvlresult/${playedlvl.id}?difficulty=${lvl.difficulty}&phoneme=${lvl.phoneme}` });// to save score,rate=> yha se socho aage
    } catch (error) {
        res.status(500).json({ error: "Failed to save data", details: error });
    }
});

async function generLevel(phoneme, difficulty) {
    try {
        const response = await axios.post('https://fbc3-34-27-196-57.ngrok-free.app/chat', {
            user_input: `Generate a Level Name, Fantasy Prompt, and Speech Exercise for targetted phoneme '${phoneme}' and difficulty '${difficulty}'`
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("data:::", response.data);
        if (error || !response.data || !response.data.reply) {
            console.error("Failed to fetch or parse level:", error);
     
          }
  
          // Parse reply string to an object
          const parsedData = {
            ...response.data,
            reply: JSON.parse(response.data.reply)
          };
        return { error: null, data: parsedData};
    } catch (err) {
        console.error("generLevel error:", err.message);
        return { error: err, data: null };
    }
}

async function addunplay (data, chapterDetails,difficulty){
    const newunpl = new Unplay({chapter_id:chapterDetails._id, user_id: chapterDetails.user_id, phoneme: chapterDetails.phoneme,difficulty:difficulty, ULdata:data });
    await newunpl.save();
    console.log(`initial level Created:`, newunpl);
    await Chapter.findByIdAndUpdate(chapterDetails._id, { $push: { unplay: newunpl._id } }, { new: true });
                
}
app.get("/lvlresult/:id", async (req, res) => {
    const { id } = req.params;//id used here is of level 
    const {difficulty, phoneme} = req.query;
    const { score, rate } = await fetchDatalvl(id,phoneme,difficulty);
    console.log("score,rate",score,",",rate);
    
    const updatedLevel = await Level.findByIdAndUpdate(//adding score and rate to played lvl
        id,
        {
            $set: {
                score: Number(score), // ensure it's a number
                rate: rate
            }
        },
        { new: true } // return the updated document
    );
    
    
    //delete this played level from unplay array of chapter document and make new level based on rate of this level
    const level = await Level.findById(id);
    const chapter_id= level.chapter_id;
    const user_id = level.user_id;
    const speechex= level.Ldata;
    const ratee = level.rate;
    const chapp = await Chapter.findById(chapter_id);
    await Chapter.findByIdAndUpdate(chapp._id, { $push: { levels: updatedLevel._id } }, { new: true });
    const unplayToRemove = await Unplay.findOne({
        chapter_id: chapter_id,
        user_id: user_id,
        ULdata: speechex
    });
    
    // Step 2: If found, remove it from the chapter's unplay array
    if (unplayToRemove) {
        const chapter = await Chapter.findByIdAndUpdate(
            chapter_id,
            {
                $pull: {
                    unplay: unplayToRemove._id
                }
            },
            { new: true } // return updated chapter
        );
        console.log("Updated Chapter:", chapter);
    } else {
        console.log("No matching Unplay document found.");
    }
    //creating new level based on rate 
    const chapterDetails = await Chapter.findById(chapter_id).populate('levels').populate('unplay');
    let data = null;

    if (ratee=="L"){
        const { error, data} = await generLevel(chapterDetails.phoneme, "Easy");
  
        await addunplay(data,chapterDetails,"Easy");
    }
    if (ratee=="M"){
        const { error, data} = await generLevel(chapterDetails.phoneme, "Medium");
        await addunplay(data,chapterDetails,"Medium");
    }
    if (ratee=="W"){
        const { error, data} = await generLevel(chapterDetails.phoneme, "Hard"); 
        await addunplay(data,chapterDetails,"Hard");
    }
    const chapterDetailss = await Chapter.findById(chapter_id).populate('levels').populate('unplay');

    console.log("chaptterDetailss(populated): ",chapterDetailss,"chapterDetailss.unplay.length",chapterDetailss.unplay.length)

    res.render('MyPhoneme', { chapterDetailss,encodeURIComponent});

    
});

app.get('/chapter/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username: username }).populate('chapters');
    console.log("USER:::",user);
    res.render('MyChapter', { user })
})
app.get('/chapter/:username/:phoneme', async (req, res) => {
    try {
      const { username, phoneme } = req.params;
  
      // Step 1: Find the user and their chapters
      const user = await User.findOne({ username }).populate('chapters');
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Step 2: Find the matching chapter by phoneme
      const matchingChapter = user.chapters.find(chapter => chapter.phoneme === phoneme);
      if (!matchingChapter) return res.status(404).json({ message: "Chapter not found" });
  
      // Step 3: Load full chapter details
      const chapterDetails = await Chapter.findById(matchingChapter._id)
        .populate('levels')
        .populate('unplay');
  
      // Step 4: If no levels or unplay levels exist, generate 3 easy levels
      if (chapterDetails.levels.length === 0 && chapterDetails.unplay.length === 0) {
        console.log("No levels found — generating new unplay levels...");
  
        for (let i = 0; i < 3; i++) {
          const { error, data: levelData } = await generLevel(chapterDetails.phoneme, "Easy");
  
          if (error || !levelData || !levelData.reply) {
            console.error("Failed to fetch or parse level:", error);
            continue;
          }
  
          // Parse reply string to an object
          const parsedData = {
            ...levelData,
            reply: JSON.parse(levelData.reply)
          };
  
          // Save the parsed level
          await addunplay(parsedData, chapterDetails, "Easy");
        }
      }
  
      // Step 5: Reload chapter after adding levels
      const chapterDetailss = await Chapter.findById(matchingChapter._id)
        .populate('levels')
        .populate('unplay');
  
      console.log("Chapter (with levels):", chapterDetailss);
      res.render('MyPhoneme', { chapterDetailss, encodeURIComponent });
  
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  



app.delete("/User/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Chapter.deleteMany({ user_id: id });
        console.log(`Deleted all chapters for user ${id}`);
        await Level.deleteMany({ user_id: id });
        console.log(`Deleted all levels for user ${id}`);
        const deletedUser = await User.findByIdAndDelete(id);
        console.log("Deleted User:", deletedUser);
        res.status(200).send("User and associated data deleted successfully");
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Error deleting user");
    }
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
