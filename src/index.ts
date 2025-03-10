import express, { Request, Response } from "express";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import { PORT } from "./utils/envProvider";
import { Frontend_Base_URL } from "./utils/constants";
import userRouter from "./routes/user";
import movieRouter from "./routes/movie";
import reviewRouter from "./routes/review";
import likedRouter from "./routes/like";
import watchlistRouter from "./routes/watchlist";
import searchRouter from "./routes/search";
import castRouter from "./routes/cast";
import directorRouter from "./routes/director";
import connectCloudinary from "./config/cloudinary";
import seriesRouter from "./routes/series";
import fileUpload from "express-fileupload";
import episodeRouter from "./routes/episode";
import continueWatchingRouter from "./routes/continueWatching";
import { userAuth } from "./middlewares/Auth";
import { getMostViewedSeriesList } from "./controllers/series";
import { addDummmyData } from "./utils/dummyDataInput";

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
app.use("/watchlist", watchlistRouter);
app.use("/search", searchRouter);
app.use("/cast", castRouter);
app.use("/director", directorRouter);
app.use("/episode", episodeRouter);
app.use("/continue-watching", continueWatchingRouter);
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
