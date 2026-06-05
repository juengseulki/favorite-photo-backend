export const commonSchemas = {
  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          message: {
            type: 'string',
            example: '잘못된 요청입니다.',
          },
        },
      },
    },
  },

  Meta: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        example: 1,
      },
      limit: {
        type: 'number',
        example: 10,
      },
      totalCount: {
        type: 'number',
        example: 30,
      },
      totalPages: {
        type: 'number',
        example: 3,
      },
      hasNextPage: {
        type: 'boolean',
        example: true,
      },
    },
  },

  CursorMeta: {
    type: 'object',
    properties: {
      nextCursor: {
        type: 'number',
        nullable: true,
        example: 15,
      },
      hasNextPage: {
        type: 'boolean',
        example: true,
      },
    },
  },
};
