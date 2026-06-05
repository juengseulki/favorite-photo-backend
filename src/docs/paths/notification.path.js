export const notificationPaths = {
  '/notifications': {
    get: {
      tags: ['Notification'],
      summary: '알림 목록 조회',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: '조회 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NotificationListResponse',
              },
            },
          },
        },
      },
    },
  },

  '/notifications/{id}/read': {
    patch: {
      tags: ['Notification'],
      summary: '알림 읽음 처리',

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
          description: '처리 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NotificationReadResponse',
              },
            },
          },
        },
      },
    },
  },

  '/notifications/read-all': {
    patch: {
      tags: ['Notification'],
      summary: '전체 알림 읽음 처리',

      security: [{ bearerAuth: [] }],

      responses: {
        200: {
          description: '전체 처리 성공',
        },
      },
    },
  },
};
