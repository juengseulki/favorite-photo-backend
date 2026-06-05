export const uploadPaths = {
  '/upload/image': {
    post: {
      tags: ['Upload'],
      summary: '이미지 업로드',
      description: '포토카드 이미지를 업로드합니다.',

      security: [{ bearerAuth: [] }],

      requestBody: {
        required: true,

        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',

              properties: {
                image: {
                  type: 'string',
                  format: 'binary',
                },
              },

              required: ['image'],
            },
          },
        },
      },

      responses: {
        200: {
          description: '업로드 성공',

          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UploadImageResponse',
              },
            },
          },
        },
      },
    },
  },
};
