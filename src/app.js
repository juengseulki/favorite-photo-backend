import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import exchangeRoutes from './routes/exchange.routes.js'; // 교환 관련 라우트 추가

const app = express();

const allowedOrigins = ['http://localhost:3000'];

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

app.get('/', (req, res) => {
  res.json({ message: 'Favorite Photo Backend API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', exchangeRoutes); // 교환 관련 라우트 등록

export default app;
