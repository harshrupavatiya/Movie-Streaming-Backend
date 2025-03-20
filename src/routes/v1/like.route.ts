import express from 'express';
import validate from '../../modules/validate/validate.middleware';
import { userAuth } from '../../modules/auth';
import likeValidation from '../../modules/like/like.validation';
import { likeController } from '../../modules/like';


const likeRouter = express.Router();

likeRouter.post('/toggle', userAuth, validate(likeValidation.toggleLike), likeController.toggleLike);
likeRouter.get('/likedContent', userAuth, validate(likeValidation.getLikedContent), likeController.getLikedContent);

export default likeRouter;
