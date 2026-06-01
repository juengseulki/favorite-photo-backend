import { createProposal, listProposals } from '../services/exchange.service.js';

function getCurrentUserId(req) {
  // TODO(auth): req.user.id 사용으로 전환 예정
  const userId = req.headers['x-user-id'];
  if (!userId) {
    const err = new Error('임시 사용자 식별 헤더(x-user-id)가 필요합니다.');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  return String(userId);
}

export async function createExchangeProposal(req, res) {
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
    const status = error.status || 500;
    return res.status(status).json({
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || '서버 오류',
      },
    });
  }
}

export async function getExchangeProposals(req, res) {
  try {
    const userId = getCurrentUserId(req);
    const { type = 'received', status } = req.query;

    const data = await listProposals({
      userId,
      type: String(type),
      status: status ? String(status) : undefined,
    });

    return res.status(200).json({ data, message: 'success' });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message || '서버 오류',
      },
    });
  }
}
