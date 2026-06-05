export const pointSchemas = {
  PointHistory: {
    type: 'object',

    properties: {
      id: {
        type: 'number',
        example: 1,
      },

      userId: {
        type: 'string',
        example: 'clx123456789',
      },

      amount: {
        type: 'number',
        example: 100,
      },

      reason: {
        type: 'string',
        example: '랜덤박스 보상',
      },

      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  PointHistoryResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          items: {
            type: 'array',

            items: {
              $ref: '#/components/schemas/PointHistory',
            },
          },

          meta: {
            $ref: '#/components/schemas/Meta',
          },
        },
      },

      message: {
        type: 'string',
        example: 'success',
      },
    },
  },

  RandomBoxStatusResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          canOpen: {
            type: 'boolean',
            example: true,
          },

          remainingSeconds: {
            type: 'number',
            example: 0,
          },

          lastOpenedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
        },
      },

      message: {
        type: 'string',
        example: 'success',
      },
    },
  },

  RandomBoxOpenResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          rewardType: {
            type: 'string',
            enum: ['POINT', 'CARD'],
            example: 'POINT',
          },

          point: {
            type: 'number',
            nullable: true,
            example: 500,
          },

          card: {
            nullable: true,

            allOf: [
              {
                $ref: '#/components/schemas/PhotoCard',
              },
            ],
          },
        },
      },

      message: {
        type: 'string',
        example: '랜덤박스 오픈 성공',
      },
    },
  },
};
