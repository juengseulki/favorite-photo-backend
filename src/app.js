import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './configs/passport.js';
import router from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ message: 'Favorite Photo Backend API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);
app.use(errorHandler);

export default app;
