export const cardSchemas = {
  PhotoCard: {
    type: 'object',

    properties: {
      id: {
        type: 'number',
        example: 1,
      },

      name: {
        type: 'string',
        example: '스페인 여행',
      },

      description: {
        type: 'string',
        example: '스페인 여행에서 촬영한 포토카드입니다.',
      },

      imageUrl: {
        type: 'string',
        example: 'https://image.com/card.png',
      },

      grade: {
        type: 'string',
        enum: ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'],
        example: 'COMMON',
      },

      genre: {
        type: 'string',
        enum: [
          'ALBUM',
          'SPECIAL',
          'FAN_SIGN',
          'SEASON_GREETING',
          'FAN_MEETING',
          'CONCERT',
          'MD',
          'COLLAB',
          'FAN_CLUB',
          'ETC',
        ],
        example: 'ALBUM',
      },

      totalQuantity: {
        type: 'number',
        example: 5,
      },

      initialPrice: {
        type: 'number',
        example: 10,
      },

      creator: {
        type: 'object',
        properties: {
          nickname: {
            type: 'string',
            example: '프로여행러',
          },
        },
      },

      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  CreateCardRequest: {
    type: 'object',

    required: [
      'name',
      'description',
      'imageUrl',
      'grade',
      'genre',
      'totalQuantity',
      'initialPrice',
    ],

    properties: {
      name: {
        type: 'string',
        example: '스페인 여행',
      },

      description: {
        type: 'string',
        example: '스페인 여행에서 찍은 사진입니다.',
      },

      imageUrl: {
        type: 'string',
        example: 'https://image.com/card.png',
      },

      grade: {
        type: 'string',
        example: 'COMMON',
      },

      genre: {
        type: 'string',
        example: 'ALBUM',
      },

      totalQuantity: {
        type: 'number',
        example: 5,
      },

      initialPrice: {
        type: 'number',
        example: 10,
      },
    },
  },

  CardListResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          items: {
            type: 'array',

            items: {
              $ref: '#/components/schemas/PhotoCard',
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
};
