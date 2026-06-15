import dotenv from 'dotenv';
import app from './app.js';
import { startCleanupRefreshTokensJob } from './jobs/cleanupRefreshTokens.job.js';

dotenv.config();

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'REFRESH_SECRET'];

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[환경변수 누락] 서버를 시작할 수 없습니다: ${missing.join(', ')}`
  );
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);

  startCleanupRefreshTokensJob();
});
