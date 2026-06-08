import morgan from 'morgan';
import logger from '../configs/logger.js';

const SENSITIVE_KEYS = ['password', 'accessToken', 'refreshToken', 'token'];

function maskSensitiveUrl(url) {
  const [pathname, queryString] = url.split('?');

  if (!queryString) return url;

  const params = new URLSearchParams(queryString);

  SENSITIVE_KEYS.forEach((key) => {
    if (params.has(key)) params.set(key, '[FILTERED]');
  });

  return `${pathname}?${params.toString()}`;
}

morgan.token('safe-url', (req) => maskSensitiveUrl(req.originalUrl));

const format =
  process.env.NODE_ENV === 'production'
    ? ':remote-addr - :method :safe-url :status :res[content-length] - :response-time ms'
    : ':method :safe-url :status :response-time ms';

const stream = {
  write: (message) => logger.http(message.trim()),
};

const requestLogger = morgan(format, {
  stream,
  skip: (req) =>
    req.originalUrl.startsWith('/api-docs') || req.originalUrl === '/health',
});

export default requestLogger;
