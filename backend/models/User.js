const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  resetOTP: { type: String, default: "" },
  resetOTPExpiry: { type: Date, default: null },
  savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  watchHistory: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      title: String,
      youtubeId: String,
      category: String,
      watchedAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 },
      duration: { type: Number, default: 0 },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  downloadedVideos: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      title: String,
      youtubeId: String,
      category: String,
      downloadedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);