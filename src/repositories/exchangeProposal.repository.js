import prisma from '../configs/prisma.js';

export const getExchangeProposal = async (saleId, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.exchangeProposal.findMany({
    where: {
      saleId,
    },
  });
};

export const setStatus = async (id, prevStatus, newStatus, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.exchangeProposal.update({
    where: { id, status: prevStatus },
    data: { status: newStatus },
  });
};

export const setProposalsStatus = async (ids, prevStatus, newStatus, tx) => {
  const dbClient = tx || prisma;
  return await dbClient.exchangeProposal.updateMany({
    where: { id: { in: ids }, status: prevStatus },
    data: { status: newStatus },
  });
};

const exchangeProposalRepository = {
  getExchangeProposal,
  setStatus,
  setProposalsStatus,
};
export default exchangeProposalRepository;
