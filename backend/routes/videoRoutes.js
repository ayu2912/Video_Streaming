const express = require("express");
const router = express.Router();
const Video = require("../models/Video");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

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

// POST upload a video
router.post("/upload", verifyToken, async (req, res) => {
  try {
    const { title, description, category, videoInput, thumbnail } = req.body;
    if (!title || !category || !videoInput) {
      return res.status(400).json({ message: "Title, category and video URL are required" });
    }

    // Detect YouTube URL and extract ID
    const ytMatch = videoInput.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    const youtubeId = ytMatch ? ytMatch[1] : "";
    const videoUrl  = ytMatch ? "" : videoInput;

    // Auto-thumbnail from YouTube if not provided
    const finalThumb = thumbnail
      ? thumbnail
      : youtubeId
      ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
      : "";

    const video = new Video({
      title,
      description: description || "",
      category: category.toLowerCase(),
      youtubeId,
      videoUrl,
      thumbnail: finalThumb,
      uploadedBy: req.user.userId,
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all videos
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find().select("-comments");
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET trending videos (top 10 by views)
router.get("/trending", async (req, res) => {
  try {
    const videos = await Video.find().sort({ views: -1 }).limit(10).select("-comments");
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET recommended videos (random sample)
router.get("/recommended", async (req, res) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 8 } }, { $project: { comments: 0 } }]);
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET search videos by title
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const videos = await Video.find({
      title: { $regex: q, $options: "i" },
    }).select("-comments");
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET videos by category
router.get("/category/:category", async (req, res) => {
  try {
    const videos = await Video.find({ category: req.params.category }).select("-comments");
    res.json(videos);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET single video with comments
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });

    let isLiked = false;
    let isSaved = false;
    let progress = 0;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        isLiked = video.likes.some((id) => id.toString() === decoded.userId);
        const user = await User.findById(decoded.userId).select("savedVideos watchHistory");
        isSaved = user.savedVideos.some((id) => id.toString() === req.params.id);
        const histEntry = user.watchHistory.find((h) => h.videoId.toString() === req.params.id);
        progress = histEntry?.progress || 0;
      } catch {}
    }

    res.json({ ...video.toObject(), isLiked, isSaved, progress });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST increment view count
router.post("/:id/view", verifyToken, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ views: video.views });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST toggle like
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const userId = req.user.userId;
    const alreadyLiked = video.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      video.likes = video.likes.filter((id) => id.toString() !== userId);
    } else {
      video.likes.push(userId);
    }

    await video.save();
    res.json({ likes: video.likes.length, liked: !alreadyLiked });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST add comment
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text required" });

    const video = await Video.findById(req.params.id);
    video.comments.push({ userId: req.user.userId, email: req.user.email, text });
    await video.save();

    res.json(video.comments);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH save watch progress
router.patch("/:id/progress", verifyToken, async (req, res) => {
  try {
    const { progress, duration } = req.body;
    const user = await User.findById(req.user.userId);
    const entry = user.watchHistory.find((h) => h.videoId.toString() === req.params.id);
    if (entry) {
      entry.progress = progress;
      if (duration) entry.duration = duration;
      entry.updatedAt = new Date();
      await user.save();
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a video (owner only)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.uploadedBy?.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await Video.findByIdAndDelete(req.params.id);
    await User.updateMany({}, {
      $pull: {
        savedVideos: video._id,
        watchHistory: { videoId: video._id },
        downloadedVideos: { videoId: video._id },
      },
    });
    res.json({ message: "Video deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST toggle like on a comment
router.post("/:id/comment/:commentId/like", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const comment = video.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const userId = req.user.userId;
    const idx = comment.likes.findIndex((id) => id.toString() === userId);
    if (idx > -1) comment.likes.splice(idx, 1);
    else comment.likes.push(userId);
    await video.save();
    res.json({ likes: comment.likes });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST toggle pin on a comment (only one pinned at a time)
router.post("/:id/comment/:commentId/pin", verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const comment = video.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const newPinned = !comment.pinned;
    video.comments.forEach((c) => (c.pinned = false));
    comment.pinned = newPinned;
    await video.save();
    res.json({ pinned: newPinned });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST reply to a comment (one reply per user)
router.post("/:id/comment/:commentId/reply", verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Reply text required" });
    const video = await Video.findById(req.params.id);
    const comment = video.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const userId = req.user.userId;
    const alreadyReplied = comment.replies.some((r) => r.userId.toString() === userId);
    if (alreadyReplied) return res.status(400).json({ message: "You have already replied to this comment" });
    comment.replies.push({ userId, email: req.user.email, text });
    await video.save();
    res.json(comment.replies);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
