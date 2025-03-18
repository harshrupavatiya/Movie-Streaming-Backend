import { IUser } from './modules/user/user.interfaces';

declare module 'express-serve-static-core' {
  export interface Request {
    user: IUser;
  }
}
