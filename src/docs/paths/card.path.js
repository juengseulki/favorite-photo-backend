export const cardPaths = {
  '/cards': {
    post: {
      tags: ['Card'],
      summary: '포토카드 생성',
      description: '새로운 포토카드를 생성합니다.',

      security: [
        {
          bearerAuth: [],
        },
      ],

      requestBody: {
        required: true,

        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateCardRequest',
            },
          },
        },
      },

      responses: {
        201: {
          description: '생성 성공',

          content: {
            'application/json': {
              schema: {
                type: 'object',

                properties: {
                  data: {
                    $ref: '#/components/schemas/PhotoCard',
                  },

                  message: {
                    type: 'string',
                    example: 'success',
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  '/cards/{cardId}': {
    get: {
      tags: ['Card'],
      summary: '포토카드 상세 조회',

      parameters: [
        {
          name: 'cardId',
          in: 'path',
          required: true,

          schema: {
            type: 'number',
          },
        },
      ],

      responses: {
        200: {
          description: '조회 성공',

          content: {
            'application/json': {
              schema: {
                type: 'object',

                properties: {
                  data: {
                    $ref: '#/components/schemas/PhotoCard',
                  },

                  message: {
                    type: 'string',
                    example: 'success',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
