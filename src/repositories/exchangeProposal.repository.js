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
  setStatus: async ({ id, prevStatus, newStatus, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.exchangeProposal.update({
      where: { id, status: prevStatus },
      data: { status: newStatus },
    });
  },
  setProposalsStatus: async ({ ids, prevStatus, newStatus, tx }) => {
    const dbClient = tx || prisma;
    return await dbClient.exchangeProposal.updateMany({
      where: { id: { in: ids }, status: prevStatus },
      data: { status: newStatus },
    });
  },
};

export default exchangeProposalRepository;
