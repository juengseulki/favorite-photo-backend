import morgan from 'morgan';
import logger from '../configs/logger.js';

// Morgan 로그를 Winston으로 스트리밍
const stream = {
  write: (message) => logger.http(message.trim()),
};

const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream }
);

export default requestLogger;
