import express from 'express';
import cors from 'cors';
import helment from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import router from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(helment());
app.use(morgan("dev"));

app.use("/api", router);

app.use(errorHandler);

export default app;