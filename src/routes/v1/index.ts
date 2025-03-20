import authRouter from './auth.route';
import express from 'express';
import userRouter from './user.route';
import reviewRouter from './review.route';

const router = express.Router();

const defaultIRoute = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/user',
    route: userRouter,
  },
  {
    path: '/review',
    route: reviewRouter,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
