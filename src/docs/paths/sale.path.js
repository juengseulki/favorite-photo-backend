export const salePaths = {
  '/sales': {
    post: {
      tags: ['Sale'],
      summary: '판매 등록',
      description: '보유한 포토카드를 판매 등록합니다.',

      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateSaleRequest',
            },
          },
        },
      },

      responses: {
        201: {
          description: '판매 등록 성공',

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

  '/me/sales': {
    get: {
      tags: ['Sale'],
      summary: '내 판매 포토카드 조회',

      security: [{ bearerAuth: [] }],

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

  '/sales/{saleId}': {
    patch: {
      tags: ['Sale'],
      summary: '판매 정보 수정',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'saleId',
          in: 'path',
          required: true,
          schema: {
            type: 'number',
          },
        },
      ],

      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateSaleRequest',
            },
          },
        },
      },

      responses: {
        200: {
          description: '수정 성공',
        },
      },
    },

    delete: {
      tags: ['Sale'],
      summary: '판매 취소',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'saleId',
          in: 'path',
          required: true,
          schema: {
            type: 'number',
          },
        },
      ],

      responses: {
        200: {
          description: '삭제 성공',
        },
      },
    },
  },
};
