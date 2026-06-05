import { commonSchemas } from './schemas/common.schema.js';
import { authSchemas } from './schemas/auth.schema.js';
import { cardSchemas } from './schemas/card.schema.js';
import { saleSchemas } from './schemas/sale.schema.js';
import { exchangeSchemas } from './schemas/exchange.schema.js';
import { notificationSchemas } from './schemas/notification.schema.js';
import { pointSchemas } from './schemas/point.schema.js';
import { uploadSchemas } from './schemas/upload.schema.js';

import { authPaths } from './paths/auth.path.js';
import { cardPaths } from './paths/card.path.js';
import { galleryPaths } from './paths/gallery.path.js';
import { marketPaths } from './paths/market.path.js';
import { salePaths } from './paths/sale.path.js';
import { exchangePaths } from './paths/exchange.path.js';
import { notificationPaths } from './paths/notification.path.js';
import { pointPaths } from './paths/point.path.js';
import { uploadPaths } from './paths/upload.path.js';

export const swaggerSpec = {
  openapi: '3.0.0',

  info: {
    title: 'Favorite Photo API',
    version: '1.0.0',
    description: '최애의 포토 API 문서',
  },

  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local server',
    },
  ],

  tags: [
    { name: 'Auth' },
    { name: 'Card' },
    { name: 'Gallery' },
    { name: 'Market' },
    { name: 'Sale' },
    { name: 'Exchange' },
    { name: 'Notification' },
    { name: 'Point' },
    { name: 'Upload' },
  ],

  paths: {
    ...authPaths,
    ...cardPaths,
    ...galleryPaths,
    ...marketPaths,
    ...salePaths,
    ...exchangePaths,
    ...notificationPaths,
    ...pointPaths,
    ...uploadPaths,
  },

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },

    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...cardSchemas,
      ...saleSchemas,
      ...exchangeSchemas,
      ...notificationSchemas,
      ...pointSchemas,
      ...uploadSchemas,
    },
  },
};
