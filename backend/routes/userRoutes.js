const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Video = require("../models/Video");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Multer setup for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/avatars")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.userId}-${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"), false);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token, email: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST forgot-password — generate 6-digit OTP (no old password needed)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with that email." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    res.json({ message: "OTP generated", otp }); // returned to UI (no email service)
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST reset-password — verify OTP and set new password (no old password)
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!user.resetOTP || user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (user.resetOTPExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.resetOTP = "";
    user.resetOTPExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully." });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST change-password — logged-in user, requires old password
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required." });
    }
    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect." });

    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.save();
    res.json({ message: "Password changed successfully." });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET current user info (protected)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ email: user.email, avatar: user.avatar || "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH update user avatar (file upload)
router.patch("/avatar", verifyToken, (req, res) => {
  avatarUpload.single("avatar")(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: "No image uploaded." });
    try {
      const avatarUrl = `http://127.0.0.1:5000/uploads/avatars/${req.file.filename}`;
      const user = await User.findByIdAndUpdate(
        req.user.userId,
        { avatar: avatarUrl },
        { new: true }
      );
      res.json({ avatar: user.avatar });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });
});

// POST toggle save video
router.post("/save/:videoId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const videoId = req.params.videoId;
    const isSaved = user.savedVideos.some((id) => id.toString() === videoId);

    if (isSaved) {
      user.savedVideos = user.savedVideos.filter((id) => id.toString() !== videoId);
    } else {
      user.savedVideos.push(videoId);
    }

    await user.save();
    res.json({ saved: !isSaved });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET saved videos
router.get("/saved", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate("savedVideos");
    res.json(user.savedVideos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET liked videos
router.get("/liked", verifyToken, async (req, res) => {
  try {
    const videos = await Video.find({ likes: req.user.userId }).select("-comments");
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET user's comments across all videos
router.get("/mycomments", verifyToken, async (req, res) => {
  try {
    const videos = await Video.find({ "comments.userId": req.user.userId })
      .select("title youtubeId category comments");

    const result = [];
    videos.forEach((video) => {
      video.comments.forEach((c) => {
        if (c.userId.toString() === req.user.userId) {
          result.push({
            commentId: c._id,
            videoId: video._id,
            videoTitle: video.title,
            youtubeId: video.youtubeId,
            text: c.text,
            createdAt: c.createdAt,
          });
        }
      });
    });

    res.json(result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET watch history
router.get("/history", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("watchHistory");
    res.json(user.watchHistory.reverse());
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST add to watch history
router.post("/history", verifyToken, async (req, res) => {
  try {
    const { videoId, title, youtubeId, category } = req.body;
    const user = await User.findById(req.user.userId);

    const exists = user.watchHistory.some(
      (h) => h.videoId.toString() === videoId
    );
    if (!exists) {
      user.watchHistory.push({ videoId, title, youtubeId, category });
      await user.save();
    }

    res.json({ message: "History updated" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST track a download
router.post("/download/:videoId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { title, youtubeId, category } = req.body;
    const alreadyDownloaded = user.downloadedVideos.some(
      (d) => d.videoId.toString() === req.params.videoId
    );
    if (!alreadyDownloaded) {
      user.downloadedVideos.push({ videoId: req.params.videoId, title, youtubeId, category });
      await user.save();
    }
    res.json({ message: "Download tracked" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET videos uploaded by the user
router.get("/uploads", verifyToken, async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user.userId }).select("-comments");
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET downloaded videos
router.get("/downloads", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("downloadedVideos");
    res.json(user.downloadedVideos.reverse());
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE remove a video from watch history
router.delete("/history/:videoId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.watchHistory = user.watchHistory.filter(
      (h) => h.videoId.toString() !== req.params.videoId
    );
    await user.save();
    res.json({ message: "Removed from history" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE remove a comment from a video
router.delete("/comment/:videoId/:commentId", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const comment = video.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not your comment" });
    }

    video.comments.pull(req.params.commentId);
    await video.save();
    res.json({ message: "Comment deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;