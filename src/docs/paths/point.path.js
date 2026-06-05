export const pointPaths = {
  '/points/history': {
    get: {
      tags: ['Point'],
      summary: '포인트 내역 조회',
      description: '사용자의 포인트 획득/사용 내역을 조회합니다.',

      security: [{ bearerAuth: [] }],

      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: {
            type: 'number',
          },
        },

        {
          name: 'limit',
          in: 'query',
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
                $ref: '#/components/schemas/PointHistoryResponse',
              },
            },
          },
        },
      },
    },
  },

  '/points/random-box/status': {
    get: {
      tags: ['Point'],
      summary: '랜덤박스 상태 조회',
      description: '랜덤박스 오픈 가능 여부를 조회합니다.',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: '조회 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RandomBoxStatusResponse',
              },
            },
          },
        },
      },
    },
  },

  '/points/random-box': {
    post: {
      tags: ['Point'],
      summary: '랜덤박스 열기',
      description: '1시간마다 랜덤 보상을 획득합니다.',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: '랜덤박스 오픈 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RandomBoxOpenResponse',
              },
            },
          },
        },
      },
    },
  },
};
