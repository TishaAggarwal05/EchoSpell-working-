const mongoose = require('mongoose');
// const PhonemeSchema = new mongoose.Schema({
//   data: Array
// },{ collection: 'initial_results' });
// const Phoneme = mongoose.model('Initial_result', PhonemeSchema);
// module.exports = Phoneme;




// User Schema
const UserSchema = new mongoose.Schema({
    username: {
      type:String,
      required:[true,"name is required.."],
      unique: [true,"provide a unique username its already taken"]
    },
    parent:{
      type:String,
      required:[true,"parent name is required.."]
    },
    email: String,
    initialAssessment: {
        date: { type: Date, default: Date.now },
        data: Array // Stores the initial accuracy for each phoneme
    },
    password: { type: String, required: true }, // Store hashed password
    chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
    progress: {
        lastLevel: String,
        lastChapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
        phonemeAccuracy: {
            initialAccuracy: Object, // { phoneme: initial accuracy percentage }
            cumulativeAccuracy: Object, // { phoneme: cumulative accuracy percentage }
            latestLevelScore: Object, // { phoneme: latest level score percentage }
            improvementPercentage: Object // { phoneme: improvement percentage compared to initial }
        }
    }
});




const User = mongoose.model("User", UserSchema);

module.exports = User;








