import express from 'express';
import { prisma } from '../src/utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import authMiddleware from '../src/middlewares/auth.middleware.js';

dotenv.config();

const router = express.Router();

router.post('/sign-up', async (req, res, next) => {
  try {
    const { userName, email, password, passwordCheck } = req.body;
    const isExistUser = await prisma.users.findFirst({
      //이미 email이 존재하는지 조회
      where: { email },
    });

    if (isExistUser) {
      //isExistUser이 존재하면
      return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    }

    if (!passwordCheck)
      return res
        .status(401)
        .json({ message: '비밀번호 확인값을 입력해주십시오.' });
    if (password !== passwordCheck)
      return res
        .status(401)
        .json({ message: '비밀번호 확인값이 비밀번호 값과 다릅니다.' });
    if (password.length < 6)
      return res
        .status(401)
        .json({ message: '비밀번호의 길이가 너무 짧습니다.' });
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      //안겹치니까 만들어야지
      data: {
        userName,
        email,
        password: hashedPassword,
      }, //user테이블에 push
    });
    return res.status(201).json({ data: { userName, email } });
  } catch (err) {
    next(err);
  }
});

router.post('/sign-in', async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user)
    return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });

  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_KEY);
  res.cookie('authorization', `Bearer ${token}`);

  return res.status(200).json({ message: '로그인에 성공하였습니다.' });
});

router.get('/users', authMiddleware, async (req, res, next) => {
  const users = res.locals.user;
  console.log(users);
  const user = await prisma.users.findFirst({
    where: { userId: users },
    select: {
      userId: true,
      userName: true,
      email: true,
      password: false,
    },
  });
  return res.status(200).json({ data: user });
});

export default router;
