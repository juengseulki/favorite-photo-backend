export const notificationSchemas = {
  Notification: {
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

      type: {
        type: 'string',
        enum: [
          'PURCHASE',
          'EXCHANGE_REQUEST',
          'EXCHANGE_ACCEPTED',
          'EXCHANGE_REJECTED',
          'SOLD_OUT',
          'RANDOM_BOX',
        ],
        example: 'PURCHASE',
      },

      content: {
        type: 'string',
        example: '포토카드 구매가 완료되었습니다.',
      },

      linkUrl: {
        type: 'string',
        example: '/market/1',
      },

      targetId: {
        type: 'number',
        nullable: true,
        example: 1,
      },

      targetType: {
        type: 'string',
        nullable: true,
        example: 'EXCHANGE',
      },

      isRead: {
        type: 'boolean',
        example: false,
      },

      createdAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  NotificationListResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          items: {
            type: 'array',

            items: {
              $ref: '#/components/schemas/Notification',
            },
          },

          meta: {
            type: 'object',

            properties: {
              totalCount: {
                type: 'number',
                example: 10,
              },

              unreadCount: {
                type: 'number',
                example: 3,
              },
            },
          },
        },
      },

      message: {
        type: 'string',
        example: 'success',
      },
    },
  },

  NotificationReadResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          id: {
            type: 'number',
            example: 1,
          },

          isRead: {
            type: 'boolean',
            example: true,
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
