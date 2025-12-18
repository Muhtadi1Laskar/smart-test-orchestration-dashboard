import express from 'express';

const router = express.Router();

router.post("/", runTestController);

export default router