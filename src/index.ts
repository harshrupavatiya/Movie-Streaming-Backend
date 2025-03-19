import express, { Request, Response } from 'express';
import connectDB from './config/db';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PORT } from './config/config';
import { Frontend_Base_URL } from './config/constants';
import connectCloudinary from './config/cloudinary';
import fileUpload from 'express-fileupload';
import router from './routes/v1';

// Create Express server
const app = express();

connectCloudinary();

const corsOptions = {
  origin: Frontend_Base_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
  ],
  credentials: true,
};

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// The reason i wrote this here because stripe does not accept .json format so i am using this route before intializing app.use(express.json) so that it will not give error stripe expects raw format
// app.use('/webhook', express.raw({ type: "application/json" }), subscriptionRouter);

app.use(express.json());
app.use(cookieParser());

// Middleware to handle file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);

app.use('/api/v1', router);

// Define a route handler for the root route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

const port = PORT || 3000;

connectDB()
  .then(() => {
    console.log('Database connected ✅ \nCloudinary configured ✅');

    // start server
    app.listen(port, () => {
      console.log(`Server is running on 👉 http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(`something went wrong. ${err.message}`);
  });
