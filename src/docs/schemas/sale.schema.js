export const saleSchemas = {
  Sale: {
    type: 'object',
    properties: {
      saleId: { type: 'number', example: 1 },
      cardId: { type: 'number', example: 10 },
      name: { type: 'string', example: '스페인 여행' },
      description: { type: 'string', example: '스페인 여행 포토카드입니다.' },
      imageUrl: { type: 'string', example: 'https://image.com/card.png' },
      grade: { type: 'string', example: 'COMMON' },
      genre: { type: 'string', example: 'ALBUM' },
      price: { type: 'number', example: 5 },
      status: {
        type: 'string',
        enum: ['ON_SALE', 'SOLD_OUT', 'CANCELED'],
        example: 'ON_SALE',
      },
      remainingQuantity: { type: 'number', example: 3 },
      totalQuantity: { type: 'number', example: 5 },
      sellerNickname: { type: 'string', example: '판매왕' },
      creatorNickname: { type: 'string', example: '프로여행러' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },

  CreateSaleRequest: {
    type: 'object',
    required: ['photoCardId', 'quantity', 'price'],
    properties: {
      photoCardId: { type: 'number', example: 1 },
      quantity: { type: 'number', example: 2 },
      price: { type: 'number', example: 5000 },
      exchangeGrade: {
        type: 'string',
        nullable: true,
        example: 'RARE',
      },
      exchangeGenre: {
        type: 'string',
        nullable: true,
        example: 'ALBUM',
      },
      exchangeDescription: {
        type: 'string',
        nullable: true,
        example: '풍경 카드와 교환 원합니다.',
      },
    },
  },

  SaleListResponse: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          cards: {
            type: 'array',
            items: { $ref: '#/components/schemas/Sale' },
          },
          nextCursor: {
            type: 'number',
            nullable: true,
            example: 20,
          },
          hasNextPage: {
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

  SaleDetailResponse: {
    type: 'object',
    properties: {
      data: { $ref: '#/components/schemas/Sale' },
      message: {
        type: 'string',
        example: 'success',
      },
    },
  },

  PurchaseRequest: {
    type: 'object',
    required: ['quantity'],
    properties: {
      quantity: {
        type: 'number',
        example: 2,
      },
    },
  },
};
