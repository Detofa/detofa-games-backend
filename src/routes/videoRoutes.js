import express from "express";
const router = express.Router();
import {
  getAllVideos,
  payoutForVideo,
} from "../controllers/videoController/videoController.js";
import { checkVideoView } from "../controllers/videoController/checkVideoView.js";
import { auth } from "../middleware/auth.js";

router.get("/", getAllVideos);
router.post("/check", auth, checkVideoView);
router.post("/payout", auth, payoutForVideo);

export default router;
