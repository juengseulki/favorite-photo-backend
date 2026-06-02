import { createProposal, listProposals } from '../services/exchange.service.js';

// 인증 미들웨어가 세팅한 사용자 정보를 컨트롤러 공통으로 꺼낸다.
function getCurrentUserId(req) {
  const userId = req.user?.id;
  if (!userId) {
    const err = new Error('인증된 사용자 정보가 필요합니다.');
    err.status = 401;
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  return String(userId);
}

// 교환 제안 생성 요청을 받아 서비스 계층에 필요한 값만 전달한다.
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

// 보낸 요청/받은 요청 목록을 필터 조건과 함께 조회한다.
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
