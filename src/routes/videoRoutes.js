import express from 'express';
const router = express.Router();
import { getAllVideos } from '../controllers/videoController.js';

router.get('/', getAllVideos);

export default router;