import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../user";
import { JWT_SIGNUP_SECRET } from "../utils/envProvider";

const cookieExtractor = (req: any) => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2M3ZGRiY2Q5OGQ1MzVhNmQyYjgzZjMiLCJpYXQiOjE3NDIyMDYwOTUsImV4cCI6MTc0MjgxMDg5NX0.NHrCLv-mcNp5Pf5BkT8hXom-LOiAZie_37SqPb9lpQY";
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["token"];
  }
};

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: JWT_SIGNUP_SECRET!,
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
);

export default jwtStrategy;
