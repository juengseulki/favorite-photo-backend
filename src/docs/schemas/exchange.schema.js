export const exchangeSchemas = {
  ExchangeProposal: {
    type: 'object',

    properties: {
      id: {
        type: 'number',
        example: 1,
      },

      saleId: {
        type: 'number',
        example: 10,
      },

      proposerId: {
        type: 'string',
        example: 'clx123456789',
      },

      offeredCardCopyId: {
        type: 'number',
        example: 3,
      },

      description: {
        type: 'string',
        example: '겨울 풍경 카드와 교환 희망합니다.',
      },

      status: {
        type: 'string',
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'],
        example: 'PENDING',
      },

      createdAt: {
        type: 'string',
        format: 'date-time',
      },

      updatedAt: {
        type: 'string',
        format: 'date-time',
      },
    },
  },

  CreateExchangeProposalRequest: {
    type: 'object',

    required: ['saleId', 'offeredCardCopyId'],

    properties: {
      saleId: {
        type: 'number',
        example: 1,
      },

      offeredCardCopyId: {
        type: 'number',
        example: 3,
      },

      description: {
        type: 'string',
        example: '겨울 풍경 카드와 교환 희망합니다.',
      },
    },
  },

  ExchangeProposalListResponse: {
    type: 'object',

    properties: {
      data: {
        type: 'object',

        properties: {
          items: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ExchangeProposal',
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

  ExchangeProposalResponse: {
    type: 'object',

    properties: {
      data: {
        $ref: '#/components/schemas/ExchangeProposal',
      },

      message: {
        type: 'string',
        example: 'success',
      },
    },
  },
};
