import express from 'express';
import { runTestController } from '../controllers/runner.controller.js';

const router = express.Router();

router.post("/", runTestController);

export default router