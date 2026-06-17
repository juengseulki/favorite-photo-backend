import prisma from '../configs/prisma.js';

const exchangeProposalRepository = {
  getExchangeProposal: async ({ saleId, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.exchangeProposal.findMany({
      where: {
        saleId,
      },
    });
  },

  getProposalById: async ({ id, include, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.exchangeProposal.findUnique({
      where: {
        id,
      },
      include,
    });
  },

  createProposal: async ({ data, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.exchangeProposal.create({
      data,
    });
  },

  setStatus: async ({ id, prevStatus, newStatus, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.exchangeProposal.updateMany({
      where: {
        id,
        ...(prevStatus && { status: prevStatus }),
      },
      data: {
        status: newStatus,
      },
    });
  },

  setProposalsStatus: async ({ ids, prevStatus, newStatus, tx }) => {
    const dbClient = tx || prisma;

    return await dbClient.exchangeProposal.updateMany({
      where: {
        id: {
          in: ids,
        },
        status: prevStatus,
      },
      data: {
        status: newStatus,
      },
    });
  },

  findDuplicatedProposal: async ({
    saleId,
    proposerId,
    offeredCardCopyId,
    status,
    tx,
  }) => {
    const dbClient = tx || prisma;

    return await dbClient.exchangeProposal.findFirst({
      where: {
        saleId,
        proposerId,
        offeredCardCopyId,
        status,
      },
    });
  },
};

export default exchangeProposalRepository;
