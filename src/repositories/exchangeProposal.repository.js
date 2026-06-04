import prisma from '../configs/prisma';

export const getExchangeProposalBySaleId = async (saleId) => {
  return await prisma.exchangeProposal.findMany({
    where: {
      saleId,
    },
  });
};

export const setStatus = async (id, prevStatus, newStatus) => {
  return await prisma.exchangeProposal.update({
    where: { id, status: prevStatus },
    data: { status: newStatus },
  });
};

export const setProposalsStatus = async (ids, prevStatus, newStatus) => {
  return await prisma.exchangeProposal.update({
    where: { id: { in: ids }, status: prevStatus },
    data: { status: newStatus },
  });
};

const exchangeProposalRepository = {
  getExchangeProposalBySaleId,
  setStatus,
  setProposalsStatus,
};
export default exchangeProposalRepository;
