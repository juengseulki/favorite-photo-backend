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
  void description;

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
  if (sale.saleItems.length === 0) {
    throw conflict('판매글에 연결된 판매 카드가 없습니다.', 'VALIDATION_ERROR');
  }

  const saleCardCopy = await prisma.cardCopy.findUnique({
    where: { id: sale.saleItems[0].cardCopyId },
  });
  if (!saleCardCopy) throw notFound('판매 카드 복사본을 찾을 수 없습니다.');
  if (saleCardCopy.status !== 'ON_SALE') {
    throw conflict(
      '현재 교환 가능한 판매 카드 상태가 아닙니다.',
      'VALIDATION_ERROR'
    );
  }

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
export async function listProposals({
  userId,
  type,
  status,
  page = 1,
  limit = 10,
}) {
  if (!['sent', 'received'].includes(type)) {
    throw badRequest('type은 sent 또는 received만 가능합니다.');
  }
  if (status && !EXCHANGE_STATUS.has(status)) {
    throw badRequest('유효하지 않은 교환 상태값입니다.');
  }
  if (!Number.isInteger(page) || page < 1) {
    throw badRequest('page는 1 이상의 정수여야 합니다.');
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw badRequest('limit는 1 이상의 정수여야 합니다.');
  }

  const safeLimit = Math.min(limit, 50);
  const skip = (page - 1) * safeLimit;

  const where = {
    ...(status ? { status } : {}),
    ...(type === 'sent'
      ? { proposerId: userId }
      : { sale: { sellerId: userId } }),
  };

  const [totalCount, items] = await Promise.all([
    prisma.exchangeProposal.count({ where }),
    prisma.exchangeProposal.findMany({
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
            photoCard: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                grade: true,
                genre: true,
              },
            },
          },
        },
        offeredCardCopy: {
          select: {
            id: true,
            ownerId: true,
            photoCardId: true,
            status: true,
            serialNumber: true,
            photoCard: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                grade: true,
                genre: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: safeLimit,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / safeLimit);

  return {
    items,
    meta: {
      page,
      limit: safeLimit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
}

// 받은 교환 요청을 거절한다.
export async function rejectProposal({ userId, proposalId }) {
  if (!proposalId || Number.isNaN(proposalId)) {
    throw badRequest('proposalId가 올바르지 않습니다.');
  }

  const proposal = await prisma.exchangeProposal.findUnique({
    where: { id: proposalId },
    include: {
      sale: true,
    },
  });

  if (!proposal) {
    throw notFound('교환 제안을 찾을 수 없습니다.');
  }
  if (proposal.sale.sellerId !== userId) {
    throw forbidden('받은 교환 요청만 거절할 수 있습니다.');
  }
  if (proposal.status !== 'PENDING') {
    throw conflict(
      '대기중인 교환 제안만 거절할 수 있습니다.',
      'VALIDATION_ERROR'
    );
  }

  return prisma.exchangeProposal.update({
    where: { id: proposalId },
    data: {
      status: 'REJECTED',
    },
  });
}

// 받은 교환 요청을 승인하고 카드 소유권을 교환한다.
export async function acceptProposal({ userId, proposalId }) {
  if (!proposalId || Number.isNaN(proposalId)) {
    throw badRequest('proposalId가 올바르지 않습니다.');
  }

  return prisma.$transaction(async (tx) => {
    const proposal = await tx.exchangeProposal.findUnique({
      where: { id: proposalId },
      include: {
        sale: {
          include: {
            saleItems: true,
          },
        },
        offeredCardCopy: true,
      },
    });

    if (!proposal) {
      throw notFound('교환 제안을 찾을 수 없습니다.');
    }
    if (proposal.sale.sellerId !== userId) {
      throw forbidden('받은 교환 요청만 승인할 수 있습니다.');
    }
    if (proposal.status !== 'PENDING') {
      throw conflict(
        '대기중인 교환 제안만 승인할 수 있습니다.',
        'VALIDATION_ERROR'
      );
    }
    if (proposal.sale.saleItems.length === 0) {
      throw conflict(
        '판매글에 연결된 판매 카드가 없습니다.',
        'VALIDATION_ERROR'
      );
    }

    const saleCardCopy = await tx.cardCopy.findUnique({
      where: { id: proposal.sale.saleItems[0].cardCopyId },
    });
    if (!saleCardCopy) {
      throw notFound('판매 카드 복사본을 찾을 수 없습니다.');
    }
    if (saleCardCopy.ownerId !== userId) {
      throw conflict(
        '판매 카드의 소유권이 이미 변경되었습니다.',
        'VALIDATION_ERROR'
      );
    }
    if (saleCardCopy.status !== 'ON_SALE') {
      throw conflict(
        '현재 판매 카드 상태에서는 교환을 승인할 수 없습니다.',
        'VALIDATION_ERROR'
      );
    }

    const offeredCardCopy = await tx.cardCopy.findUnique({
      where: { id: proposal.offeredCardCopyId },
    });
    if (!offeredCardCopy) {
      throw notFound('제안 카드 복사본을 찾을 수 없습니다.');
    }
    if (offeredCardCopy.ownerId !== proposal.proposerId) {
      throw conflict(
        '제안 카드의 소유권이 이미 변경되었습니다.',
        'VALIDATION_ERROR'
      );
    }
    if (offeredCardCopy.status !== 'OWNED') {
      throw conflict(
        '현재 제안 카드 상태에서는 교환을 승인할 수 없습니다.',
        'VALIDATION_ERROR'
      );
    }

    await tx.cardCopy.update({
      where: { id: saleCardCopy.id },
      data: {
        ownerId: proposal.proposerId,
        status: 'OWNED',
      },
    });

    await tx.cardCopy.update({
      where: { id: offeredCardCopy.id },
      data: {
        ownerId: userId,
        status: 'OWNED',
      },
    });

    const acceptedProposal = await tx.exchangeProposal.update({
      where: { id: proposalId },
      data: {
        status: 'ACCEPTED',
      },
    });

    await tx.exchangeProposal.updateMany({
      where: {
        saleId: proposal.saleId,
        status: 'PENDING',
        id: { not: proposalId },
      },
      data: {
        status: 'CANCELED',
      },
    });

    await tx.sale.update({
      where: { id: proposal.saleId },
      data: {
        status: 'SOLD_OUT',
      },
    });

    return acceptedProposal;
  });
}
