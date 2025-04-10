const mongoose = require('mongoose');
// const PhonemeSchema = new mongoose.Schema({
//   data: Array
// },{ collection: 'initial_results' });
// const Phoneme = mongoose.model('Initial_result', PhonemeSchema);
// module.exports = Phoneme;




// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    initialAssessment: {
        date: Date,
        phonemeResults: Object // Stores the initial accuracy for each phoneme
    },
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
const ChapterSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phoneme: String,
  levels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }]
});
// Level Schema
const LevelSchema = new mongoose.Schema({
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phoneme: String,
  score: Number,
  recording: String
});



const User = mongoose.model("User", UserSchema);
const Chapter = mongoose.model("Chapter", ChapterSchema);
const Level = mongoose.model("Level", LevelSchema);

