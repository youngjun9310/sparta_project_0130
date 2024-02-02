import express, { json } from 'express';
import { prisma } from '../src/utils/prisma/index.js';
import authMiddleware from '../src/middlewares/auth.middleware.js';

const router = express.Router();

router.post('/resumes', authMiddleware, async (req, res, next) => {
  try {
    const { title, intro, resumeStatus } = req.body;
    const userId = res.locals.user;
    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        intro,
        resumeStatus,
      },
    });
    return res.status(201).json({ data: resume });
  } catch (err) {
    if (
      (err =
        'Invalid value for argument `resumeStatus`. Expected resumestatus.')
    )
      res.status(401).json({ message: 'resumeStatus값이 올바르지 않습니다.' });
  }
});

router.get('/resumes/:order', async (req, res, next) => {
  const { order } = req.params;
  const resumes = await prisma.resume.findMany({
    select: {
      resumeId: true,
      userId: true,
      title: true,
      resumeStatus: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: order,
    },
  });
  return res.status(200).json({ data: resumes });
});

export default router;
