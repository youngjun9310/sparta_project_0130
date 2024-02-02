// src/app.js
import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.routes.js';
import ResumesRouter from './routes/resume.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.DATABASE_PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api', [UsersRouter, ResumesRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
