export const marketPaths = {
  '/market/cards': {
    get: {
      tags: ['Market'],
      summary: '마켓 카드 목록 조회',

      parameters: [
        {
          name: 'cursor',
          in: 'query',
          schema: { type: 'number' },
        },

        {
          name: 'keyword',
          in: 'query',
          schema: { type: 'string' },
        },

        {
          name: 'grade',
          in: 'query',
          schema: { type: 'string' },
        },

        {
          name: 'genre',
          in: 'query',
          schema: { type: 'string' },
        },
      ],

      responses: {
        200: {
          description: '조회 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaleListResponse',
              },
            },
          },
        },
      },
    },
  },

  '/market/cards/{saleId}': {
    get: {
      tags: ['Market'],
      summary: '마켓 카드 상세 조회',

      parameters: [
        {
          name: 'saleId',
          in: 'path',
          required: true,
          schema: { type: 'number' },
        },
      ],

      responses: {
        200: {
          description: '조회 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SaleDetailResponse',
              },
            },
          },
        },
      },
    },
  },

  '/market/cards/{saleId}/purchase': {
    post: {
      tags: ['Market'],
      summary: '포토카드 구매',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'saleId',
          in: 'path',
          required: true,
          schema: { type: 'number' },
        },
      ],

      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/PurchaseRequest',
            },
          },
        },
      },

      responses: {
        200: {
          description: '구매 성공',
        },
      },
    },
  },
};
