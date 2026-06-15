export const exchangePaths = {
  '/exchange-proposals': {
    post: {
      tags: ['Exchange'],
      summary: '교환 제안 생성',

      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateExchangeProposalRequest',
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
                $ref: '#/components/schemas/ExchangeProposalResponse',
              },
            },
          },
        },
      },
    },

    get: {
      tags: ['Exchange'],
      summary: '교환 제안 목록 조회',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: '조회 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ExchangeProposalListResponse',
              },
            },
          },
        },
      },
    },
  },

  '/exchange-proposals/{id}/accept': {
    patch: {
      tags: ['Exchange'],
      summary: '교환 승인',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'number' },
        },
      ],

      responses: {
        200: {
          description: '승인 성공',
        },
      },
    },
  },

  '/exchange-proposals/{id}/reject': {
    patch: {
      tags: ['Exchange'],
      summary: '교환 거절',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'number' },
        },
      ],

      responses: {
        200: {
          description: '거절 성공',
        },
      },
    },
  },

  '/exchange-proposals/{id}/cancel': {
    patch: {
      tags: ['Exchange'],
      summary: '교환 제안 취소',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'number' },
        },
      ],

      responses: {
        200: {
          description: '취소 성공',
        },
      },
    },
  },
};
