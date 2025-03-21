import authRouter from './auth.route';
import express from 'express';
import userRouter from './user.route';
import reviewRouter from './review.route';
import crewRouter from './crew.route';
import episodeRouter from './episode.route';
import likeRouter from './like.route';

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
    path: '/crew',
    route: crewRouter,
  },
  {
    path:'/episode',
    route: episodeRouter,
  },
  {
    path: '/like',
    route: likeRouter,
  }
  {
    path: '/review',
    route: reviewRouter,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
