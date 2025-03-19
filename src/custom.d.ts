import { IPaginate } from './modules/auth/auth.interface';
import { episodeInterface } from './modules/episode';
import { mediaInterface } from './modules/media';
import { userInterface } from './modules/user';

declare module 'express-serve-static-core' {
  export interface Request {
    user?: userInterface.IUser;
    mediaPayload?: mediaInterface.IMedia;
    pagination?: IPaginate;                     // Temporory
    episodePayload?: episodeInterface.IEpisode;
  }
}
