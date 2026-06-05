export const authSchemas = {
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'clx123456789',
      },

      email: {
        type: 'string',
        example: 'test@test.com',
      },

      nickname: {
        type: 'string',
        example: '프로여행러',
      },

      point: {
        type: 'number',
        example: 2000,
      },
    },
  },

  AuthResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          user: {
            $ref: '#/components/schemas/User',
          },

          accessToken: {
            type: 'string',
            example: 'access-token',
          },
        },
      },

      message: {
        type: 'string',
        example: 'success',
      },
    },
  },

  RegisterRequest: {
    type: 'object',

    required: ['email', 'nickname', 'password'],

    properties: {
      email: {
        type: 'string',
        example: 'test@test.com',
      },

      nickname: {
        type: 'string',
        example: '슬기',
      },

      password: {
        type: 'string',
        example: 'password123',
      },
    },
  },

  LoginRequest: {
    type: 'object',

    required: ['email', 'password'],

    properties: {
      email: {
        type: 'string',
        example: 'test@test.com',
      },

      password: {
        type: 'string',
        example: 'password123',
      },
    },
  },

  TokenResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          accessToken: {
            type: 'string',
            example: 'new-access-token',
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
