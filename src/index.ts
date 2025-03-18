import express, { Request, Response } from "express";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import { PORT } from "./modules/utils/envProvider";
import { Frontend_Base_URL } from "./modules/utils/constants";
import connectCloudinary from "./config/cloudinary";
import fileUpload from "express-fileupload";
import { authMiddleware } from "./modules/auth/auth.middleware";
import passport from "passport";
import jwtStrategy from "./modules/auth/passport";
import routes from "./routes/v1";

// Create Express server
const app = express();

const corsOptions = {
  origin: Frontend_Base_URL, // Allows requests from any origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow common HTTP methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
  ], // Allow necessary headers
  credentials: true, // Allow cookies & authorization headers
};

// Enable CORS with necessary headers
app.use(cors(corsOptions));

// Handle preflight requests (OPTIONS)
app.options("*", cors(corsOptions));

// The reason i wrote this here because stripe does not accept .json format so i am using this route before intializing app.use(express.json) so that it will not give error stripe expects raw format
// app.use('/webhook', express.raw({ type: "application/json" }), subscriptionRouter);

app.use(express.json());
app.use(cookieParser());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Middleware to handle file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use('/api/v1', routes);

app.get("/demo", 
  authMiddleware(), 
  (req: Request, res: Response) => {
    console.log(req);
  res.send("Hello from Demo api");
});

// Define a route handler for the root route
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World!");
});

const port = PORT || 3000;

Promise.all([connectDB(), connectCloudinary()])
  .then(() => {
    console.log("Database connected ✅ \nCloudinary configured ✅");

    // start server
    app.listen(port, () => {
      console.log(`Server is running on 👉 http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(`something went wrong. ${err.message}`);
  });
