const mongoose = require('mongoose');
// Level Schema
const LevelSchema = new mongoose.Schema({
    chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    phoneme: String,
    score: Number,
    difficulty: String,
    Ldata : {
        type: mongoose.Schema.Types.Mixed
    },
    Assessment: {
        date: { type: Date, default: Date.now },
        data: Array // Stores the level's accuracy for targetted phoneme
    },
    rate:{
        type: String,
        enum:["L", "M", "W"]
    }
    
});
const Level = mongoose.model("Level", LevelSchema);

module.exports = Level;