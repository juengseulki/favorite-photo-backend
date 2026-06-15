import {
  acceptProposal,
  cancelProposal,
  createProposal,
  listProposals,
  rejectProposal,
} from '../services/exchange.service.js';
import AppError from '../utils/AppError.js';

function getCurrentUserId(req) {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(401, 'UNAUTHORIZED', '인증된 사용자 정보가 필요합니다.');
  }

  return String(userId);
}

export async function createExchangeProposal(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    const { saleId, offeredCardCopyId, description } = req.body;

    const data = await createProposal({
      userId,
      saleId: Number(saleId),
      offeredCardCopyId: Number(offeredCardCopyId),
      description: description ?? '',
    });

    return res.status(201).json({ data, message: 'success' });
  } catch (error) {
    next(error);
  }
}

export async function getExchangeProposals(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    const { type = 'received', status, page = '1', limit = '10' } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const data = await listProposals({
      userId,
      type: String(type),
      status: status ? String(status) : undefined,
      page: Number.isNaN(parsedPage) ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) ? 10 : Math.min(parsedLimit, 50),
    });

    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    next(error);
  }
}

export async function acceptExchangeProposal(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    const proposalId = Number(req.params.id);

    const data = await acceptProposal({
      userId,
      proposalId,
    });

    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    next(error);
  }
}

export async function rejectExchangeProposal(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    const proposalId = Number(req.params.id);

    const data = await rejectProposal({
      userId,
      proposalId,
    });

    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    next(error);
  }
}

export async function cancelExchangeProposal(req, res, next) {
  try {
    const userId = getCurrentUserId(req);
    const proposalId = Number(req.params.id);

    const data = await cancelProposal({
      userId,
      proposalId,
    });

    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    next(error);
  }
}
