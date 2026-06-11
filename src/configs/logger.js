import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] ${stack ?? message}`;
});

winston.addColors({ http: 'magenta' });

const transports = [
  new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
  }),
];

/**
 * 로컬 개발:
 * logs 폴더 저장
 *
 * 운영(Render):
 * ENABLE_FILE_LOG=true일 때만 파일 저장
 */
if (!isProduction || process.env.ENABLE_FILE_LOG === 'true') {
  transports.push(
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      zippedArchive: true,
    }),

    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d',
      zippedArchive: true,
    })
  );
}

/**
 * 운영 로그 저장 (Better Stack)
 */
if (process.env.LOGTAIL_TOKEN) {
  const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

  transports.push(new LogtailTransport(logtail));
}

const logger = winston.createLogger({
  levels: { ...winston.config.npm.levels, http: 5 },

  level: isProduction ? 'info' : 'http',

  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),

  transports,
});

export default logger;
