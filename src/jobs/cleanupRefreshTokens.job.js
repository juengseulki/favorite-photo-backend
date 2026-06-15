import cron from 'node-cron';

import prisma from '../configs/prisma.js';
import logger from '../configs/logger.js';

export const startCleanupRefreshTokensJob = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      logger.info(`[CRON] 만료 RefreshToken 삭제 완료 (${result.count}개)`);
    } catch (error) {
      logger.error('[CRON] RefreshToken 삭제 실패', {
        message: error.message,
        stack: error.stack,
      });
    }
  });

  logger.info('[CRON] RefreshToken cleanup job started');
};
