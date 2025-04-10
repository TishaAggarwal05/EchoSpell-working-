const mongoose = require('mongoose');
const ChapterSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phoneme: String,
  currentAccur: Number,
  levels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Level" }],
  unplay: [{ type: mongoose.Schema.Types.ObjectId, ref: "Unplay" }]
});
const Chapter = mongoose.model("Chapter", ChapterSchema);
module.exports = Chapter;