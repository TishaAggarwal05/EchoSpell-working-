const mongoose = require('mongoose');

const PhonemeSchema = new mongoose.Schema({
    instruction: String,
    levelname: String,
    fantasyPrompt: String,
    speechExercise:String
});

const Phoneme = mongoose.model("Phoneme", PhonemeSchema);

module.exports = Phoneme;








