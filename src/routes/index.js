import express from 'express';
import runTestRoute from "./runRoutes.js";

const router = express.Router();

router.use("/run", runTestRoute);

export default router;