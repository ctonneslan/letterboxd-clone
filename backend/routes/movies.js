import express from "express";
import {
  search,
  getDetails,
  getPopular,
  getTrending,
} from "../controllers/movieController.js";

const router = express.Router();

router.get("/search", search);
router.get("/popular", getPopular);
router.get("/trending", getTrending);
router.get("/:id", getDetails);

export default router;
