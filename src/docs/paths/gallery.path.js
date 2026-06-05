export const galleryPaths = {
  '/me/cards': {
    get: {
      tags: ['Gallery'],
      summary: '마이갤러리 카드 조회',

      security: [
        {
          bearerAuth: [],
        },
      ],

      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'number' },
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
                $ref: '#/components/schemas/CardListResponse',
              },
            },
          },
        },
      },
    },
  },
};
