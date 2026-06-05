export const uploadSchemas = {
  UploadImageResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          imageUrl: {
            type: 'string',
            example: 'https://favorite-photo.s3.amazonaws.com/photo/image.png',
          },
        },
      },

      message: {
        type: 'string',
        example: '이미지 업로드 성공',
      },
    },
  },
};
