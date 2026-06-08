import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../logs');

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack ?? message}`;
});

// http 커스텀 레벨 추가 (morgan 전용)
winston.addColors({ http: 'magenta' });

const logger = winston.createLogger({
  levels: { ...winston.config.npm.levels, http: 5 },
  level: process.env.NODE_ENV === 'production' ? 'info' : 'http',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // 콘솔 출력 (개발 환경)
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
    }),

    // 전체 로그 — 날짜별 파일 분리
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d', // 14일 보관
      zippedArchive: true,
    }),

    // 에러 로그만 별도 파일
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d', // 에러 로그는 30일 보관
      zippedArchive: true,
    }),
  ],
});

export default logger;
