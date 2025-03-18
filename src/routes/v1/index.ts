import authRouter from "./auth.route";
import express from "express";

const router = express.Router();

const defaultIRoute = [
  {
    path: "/user",
    route: authRouter,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});


export default router;