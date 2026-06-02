import { prisma } from '../lib/prisma.js';

// 잘못된 요청값에 대한 400 에러
function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

// 권한이 없는 요청에 대한 403 에러
function forbidden(message) {
  const err = new Error(message);
  err.status = 403;
  err.code = 'FORBIDDEN';
  return err;
}

// 조회 대상이 없을 때 사용할 404 에러
function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  err.code = 'NOT_FOUND';
  return err;
}

// 중복 요청이나 현재 상태에서 처리 불가한 경우의 409 에러
function conflict(message, code = 'DUPLICATE_ERROR') {
  const err = new Error(message);
  err.status = 409;
  err.code = code;
  return err;
}

const EXCHANGE_STATUS = new Set([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELED',
]);

// 교환 제안 생성 전 판매글/카드 상태를 검증하고 제안을 저장
export async function createProposal({
  userId,
  saleId,
  offeredCardCopyId,
  description,
}) {
  if (!saleId || Number.isNaN(saleId))
    throw badRequest('saleId가 올바르지 않습니다.');
  if (!offeredCardCopyId || Number.isNaN(offeredCardCopyId)) {
    throw badRequest('offeredCardCopyId가 올바르지 않습니다.');
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: { saleItems: true },
  });
  if (!sale) throw notFound('판매글을 찾을 수 없습니다.');
  if (sale.status !== 'ON_SALE')
    throw conflict(
      '판매중인 카드만 교환 제안할 수 있습니다.',
      'VALIDATION_ERROR'
    );
  if (sale.sellerId === userId)
    throw forbidden('본인 판매글에는 교환 제안을 보낼 수 없습니다.');

  const offeredCopy = await prisma.cardCopy.findUnique({
    where: { id: offeredCardCopyId },
  });
  if (!offeredCopy) throw notFound('제안 카드 복사본을 찾을 수 없습니다.');
  if (offeredCopy.ownerId !== userId)
    throw forbidden('본인 소유 카드만 제안할 수 있습니다.');
  if (offeredCopy.status !== 'OWNED')
    throw conflict('교환 가능한 카드 상태가 아닙니다.', 'VALIDATION_ERROR');

  const duplicated = await prisma.exchangeProposal.findFirst({
    where: {
      saleId,
      proposerId: userId,
      offeredCardCopyId,
      status: 'PENDING',
    },
  });
  if (duplicated) throw conflict('이미 동일한 교환 제안이 대기중입니다.');

  return prisma.exchangeProposal.create({
    data: {
      saleId,
      proposerId: userId,
      offeredCardCopyId,
      // 스키마에 description 필드가 없으므로 저장하지 않음
    },
  });
}

// 보낸 요청/받은 요청 목록을 조건에 맞게 조회
export async function listProposals({ userId, type, status }) {
  if (!['sent', 'received'].includes(type)) {
    throw badRequest('type은 sent 또는 received만 가능합니다.');
  }
  if (status && !EXCHANGE_STATUS.has(status)) {
    throw badRequest('유효하지 않은 교환 상태값입니다.');
  }

  const where = {
    ...(status ? { status } : {}),
    ...(type === 'sent'
      ? { proposerId: userId }
      : { sale: { sellerId: userId } }),
  };

  return prisma.exchangeProposal.findMany({
    where,
    include: {
      proposer: { select: { id: true, nickname: true } },
      sale: {
        select: {
          id: true,
          sellerId: true,
          photoCardId: true,
          price: true,
          status: true,
        },
      },
      offeredCardCopy: {
        select: {
          id: true,
          ownerId: true,
          photoCardId: true,
          status: true,
          serialNumber: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
