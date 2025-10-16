import express from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getMovieReviews,
  getUserReviews,
  likeReview,
  unlikeReview,
} from "../controllers/reviewController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Create/update review (authenticated)
router.post("/", authenticateToken, createReview);

// Update specific review
router.patch("/:id", authenticateToken, updateReview);

// Delete review
router.delete("/:id", authenticateToken, deleteReview);

// Get reviews for a movie (optional auth for like status)
router.get("/movie/:movieId", optionalAuth, getMovieReviews);

// Get reviews by user
router.get("/user/:username", getUserReviews);

// Like/unlike review
router.post("/:id/like", authenticateToken, likeReview);
router.delete("/:id/like", authenticateToken, unlikeReview);

export default router;
