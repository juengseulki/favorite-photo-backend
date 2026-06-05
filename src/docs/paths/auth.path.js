export const authPaths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: '회원가입',
      description: '이메일, 닉네임, 비밀번호로 회원가입합니다.',

      requestBody: {
        required: true,

        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RegisterRequest',
            },
          },
        },
      },

      responses: {
        201: {
          description: '회원가입 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse',
              },
            },
          },
        },

        400: {
          description: '회원가입 실패',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: '로그인',
      description: '이메일과 비밀번호로 로그인합니다.',

      requestBody: {
        required: true,

        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/LoginRequest',
            },
          },
        },
      },

      responses: {
        200: {
          description: '로그인 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse',
              },
            },
          },
        },

        401: {
          description: '로그인 실패',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
  },

  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Access Token 재발급',
      description: 'Refresh Token으로 Access Token을 재발급합니다.',

      responses: {
        200: {
          description: '토큰 재발급 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/TokenResponse',
              },
            },
          },
        },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: '로그아웃',

      security: [
        {
          bearerAuth: [],
        },
      ],

      responses: {
        200: {
          description: '로그아웃 성공',
        },
      },
    },
  },

  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: '내 정보 조회',

      security: [
        {
          bearerAuth: [],
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
                    type: 'object',

                    properties: {
                      user: {
                        $ref: '#/components/schemas/User',
                      },
                    },
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
