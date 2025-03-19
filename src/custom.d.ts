import { userInterface } from './modules/user';

declare module 'express-serve-static-core' {
  export interface Request {
    user: userInterface.IUser;
  }
}
