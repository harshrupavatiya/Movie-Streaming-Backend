import express, { Request, Response } from "express";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import { PORT } from "./modules/utils/envProvider";
import { Frontend_Base_URL } from "./modules/utils/constants";
import userRouter from "./routes/user";
import movieRouter from "./routes/movie";
import reviewRouter from "./routes/review";
import likedRouter from "./routes/like";
import subscriptionRouter from './routes/subscription'
import watchlistRouter from "./routes/watchlist";
import searchRouter from "./routes/search";
import castRouter from "./routes/cast";
import directorRouter from "./routes/director";
import connectCloudinary from "./config/cloudinary";
import seriesRouter from "./routes/series";
import fileUpload from "express-fileupload";
import episodeRouter from "./routes/episode";
import continueWatchingRouter from "./routes/continueWatching";
import homeRouter from "./routes/home";

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
app.use('/webhook', express.raw({ type: "application/json" }), subscriptionRouter);



app.use(express.json());
app.use(cookieParser());

// Middleware to handle file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Define a route handler for the root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});


app.use("/auth", authRouter);
app.use("/movie", movieRouter);
app.use("/user", userRouter);
app.use("/series", seriesRouter);
app.use("/review", reviewRouter);
app.use("/liked", likedRouter);
app.use("/stripe", subscriptionRouter);
app.use("/watchlist", watchlistRouter);
app.use("/search", searchRouter);
app.use("/cast", castRouter);
app.use("/director", directorRouter);
app.use("/episode", episodeRouter);
app.use("/continue-watching", continueWatchingRouter);
app.use("/trending", homeRouter);


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
