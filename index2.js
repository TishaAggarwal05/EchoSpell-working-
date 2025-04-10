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
app.use(
    cors({
        origin: "http://localhost:5173",  //  Allow only your frontend
        credentials: true,  // Allow sending cookies/sessions
        methods: ["GET", "POST", "PUT", "DELETE"],  // Allowed HTTP methods
        allowedHeaders: ["Content-Type", "Authorization"],  // Allowed headers
    })
);

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

app.get('/user/new', (req, res) => {
    res.render('signup', { messages: req.flash(), formData: {} });
});
// Handle POST request for user registration
app.post('/user/new', async (req, res) => {
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
// app.post('/login', (req, res, next) => {
//     passport.authenticate("local", (err, user, info) => {
//         if (err) return next(err);
//         if (!user) {
//             return res.status(401).json({ success: false, message: info.message || "Invalid credentials" });
//         }

//         req.login(user, (err) => {
//             if (err) return next(err);
//             return res.json({ success: true, userId: user._id, redirect: `/user/profile/${user._id}` }); // Send JSON response
//         });
//     })(req, res, next);
// });




    // Logout Route
    app.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) console.error(err);
            res.redirect("/");
        });
    });




app.get('/', (req, res) => {
    res.render('landing');
});



// Route to create a new level based on score => not used yet
app.post('/level-complete', async (req, res) => {
    try {
        const { user_id, chapter_id, phoneme, score } = req.body;

        // Determine next level difficulty
        let difficulty = "easy";
        if (score > 40 && score < 70) {
            difficulty = "medium";
        } else if (score >= 70) {
            difficulty = "hard";
        }

        // Create a new level entry in Unplay schema
        const newLevel = new Unplay({
            chapter_id,
            user_id,
            phoneme,
            difficulty
        });

        await newLevel.save();

        res.status(200).json({ message: "New level added", level: newLevel });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// USER ROUTES

app.get('/realtime/:id', (req, res) => {
    const { id } = req.params;
    
    if(req.query.text){
        const {text,phoneme}= req.query;
        console.log(req.query)
        // res.send(text)
        res.render('realtime2',{id,text,phoneme,initial:false})
    }else{
        res.render('realtime2', { id, initial:true}); // initial assessment
    }
    
});

app.post('/initassessment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { totalN_best } = req.body;
        console.log("total Nbest", totalN_best);
        const dataEntry = await User.findByIdAndUpdate(id, {
            "initialAssessment.date": new Date(),
            "initialAssessment.data": totalN_best
        }, { new: true });
        res.json({ message: "Data saved successfully!", redirect: `/results/${id}` });
    } catch (error) {
        res.status(500).json({ error: "Failed to save data", details: error });
    }
});

app.get("/results/:id", async (req, res) => {
    const { id } = req.params;
    console.log("ID in index:", id);
    console.log("Type of ID:", typeof id);
    const { lowAccur, avgPhonemeAccuracy } = await fetchData(id);
    console.log("Low Accuracy Data:", lowAccur);
    const userId = new mongoose.Types.ObjectId(id);
    for (const arr of lowAccur) {
        const phoneme = arr[0];
        const score = arr[1];
        const newCh = new Chapter({ user_id: userId, phoneme: phoneme, currentAccur: score });
        await newCh.save();
        console.log(`New Chapter Created:`, newCh);
        await User.findByIdAndUpdate(userId, { $push: { chapters: newCh._id } }, { new: true });
    }
    res.render('confirmation', { id });
});


app.post('/level/:phoneme/:id', async (req, res) => {
    try {
        const {phoneme, id } = req.params;
        const { totalN_best } = req.body;
        console.log("total Nbest", totalN_best);
        //ispe aye hai toh matlab wo level khel liya hai 
        //toh level array mein push karo aur unplay mein se usse pop karo phir assessment ko bhi daalo
        const user= await User.findById(id).populate('chapters');
        const lvl= await Unplay.findOne({user_id:id,phoneme:phoneme});
        
        const ch = user.chapters.find(chap=>{
            
            return chap.phoneme=== phoneme;
        })
        
        console.log("ch variable in /level/phoneme.id:",ch);
        const playedlvl = new Level({ chapter_id:ch._id ,user_id: id, phoneme: phoneme,  difficulty: lvl.difficulty, Ldata:lvl.ULdata,Assessment:{ date:new Date(),data:totalN_best} });//left field to fill score
        
        await playedlvl.save();
        res.json({ message: "Data saved successfully!", redirect: `/results/${phoneme}/${playedlvl.id}` });// to save score,rate=> yha se socho aage
    } catch (error) {
        res.status(500).json({ error: "Failed to save data", details: error });
    }
});

app.get("/results/:phoneme/:id", async (req, res) => {
    const {phoneme, id } = req.params;
    console.log("ID in index:", id);
    console.log("Type of ID:", typeof id);
    const { score, rate } = await fetchDatalvl(id,phoneme);
    console.log("score,rate",score," ",rate);
    
    const updatedLevel = await Level.findByIdAndUpdate(
        id,
        {
            $set: {
                score: Number(score), // ensure it's a number
                rate: rate
            }
        },
        { new: true } // return the updated document
    );

    
});
app.get('/user/profile/:id', async (req, res) => {
    const { id } = req.params;
    console.log("Fetching profile for user id:", id);
    const { lowAccur, avgPhonemeAccuracy } = await fetchData(id);
    const user = await User.findOne({ _id: id }).populate('chapters');
    console.log(user);
    res.render('profile', { user, avgPhonemeAccuracy });
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

app.get('/chapter/:username', async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username: username }).populate('chapters');
    console.log("USER:::",user);
    res.render('MyChapter', { user })
})



// dynamic level generation
// const manageLevel = async (phoneme, difficulty) => {
//     try {
//         const regexPattern = new RegExp(`phoneme\\s+'/\\s*${phoneme}\\s*/'\\s+and\\s+difficulty\\s+'${difficulty}'`, 'i');
//         const result = await Phoneme.aggregate([
//             { $match: { instruction: { $regex: regexPattern } } },
//             { $sample: { size: 1 } }
//         ]);

//         if (result.length === 0) {
//             console.log("qaqaqaqaqqaa");
//             return { error: true, message: "No matching level found" };
//         }

//         console.log("result:::", result[0]);
//         return { error: false, data: result[0] };
//     } catch (error) {
//         console.log("gdgqaqazzzzz", error);
//         return { error: true, message: error.message };
//     }
// };

async function manageLevel(phoneme, difficulty) {
    try {
        const response = await axios.post('https://a09c-34-27-21-76.ngrok-free.app/chat', {
            user_input: `Generate a level for phoneme '${phoneme}' and difficulty '${difficulty}'`
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return { error: null, data: response.data };
    } catch (err) {
        console.error("manageLevel error:", err.message);
        return { error: err, data: null };
    }
}


app.get('/chapter/:username/:phoneme', async (req, res) => {
    try {
        const { username, phoneme } = req.params;
        const user = await User.findOne({ username }).populate('chapters');

        if (!user) return res.status(404).json({ message: "User not found" });

        const matchingChapter = user.chapters.find(chapter => chapter.phoneme === phoneme);
        if (!matchingChapter) return res.status(404).json({ message: "Chapter not found" });

        const chapterDetails = await Chapter.findById(matchingChapter._id).populate('levels').populate('unplay');

        let data = null;

        if (chapterDetails.levels.length === 0 && chapterDetails.unplay.length === 0 ) {
            console.log("hey krishna hey");
            for(let i=0;i<3;i++){

                const { error, data: levelData } = await manageLevel(chapterDetails.phoneme, "Easy");
                if (!error) data = levelData;
                console.log("data:::", data);
                const newunpl = new Unplay({chapter_id:chapterDetails._id, user_id: chapterDetails.user_id, phoneme: chapterDetails.phoneme,difficulty:"Easy", ULdata:data });
                await newunpl.save();
                console.log(`initial level Created:`, newunpl);
                const chapterDetails =await Chapter.findByIdAndUpdate(chapterDetails._id, { $push: { unplay: newunpl._id } }, { new: true });
                
            }

        }
        console.log("chaptterDetails(populated): ",chapterDetails,"chapterDetails.unplay.length",chapterDetails.unplay.length)
        res.render('MyPhoneme', { chapterDetails,encodeURIComponent});
    } catch (error) {
        console.error("Error fetching chapter:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
