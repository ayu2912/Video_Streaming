const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: String,
  text: String,
  pinned: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
});

const videoSchema = new mongoose.Schema({
  youtubeId:   { type: String, default: "" },
  videoUrl:    { type: String, default: "" },
  thumbnail:   { type: String, default: "" },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  category:    { type: String, required: true },
  views:       { type: Number, default: 0 },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments:    [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model("Video", videoSchema);
