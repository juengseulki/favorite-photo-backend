export const ERROR_CODES = {
  // 공통
  SERVER_ERROR: (customMsg = '서버 오류가 발생했습니다.') => ({
    httpStatus: 500,
    errorCode: 'SERVER_ERROR',
    message: customMsg,
  }),
  NOT_FOUND: (customMsg = '요청한 리소스를 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'NOT_FOUND',
    message: customMsg,
  }),
  BAD_REQUEST: (customMsg = '잘못된 요청입니다.') => ({
    httpStatus: 400,
    errorCode: 'BAD_REQUEST',
    message: customMsg,
  }),
  UNAUTHORIZED: (customMsg = '인증이 필요합니다.') => ({
    httpStatus: 401,
    errorCode: 'UNAUTHORIZED',
    message: customMsg,
  }),
  FORBIDDEN: (customMsg = '권한이 없습니다.') => ({
    httpStatus: 403,
    errorCode: 'FORBIDDEN',
    message: customMsg,
  }),

  //----범용 에러메세지----
  VALIDATION_ERROR: (customMsg = '필수 입력 값을 확인해주세요.') => ({
    httpStatus: 400,
    errorCode: 'VALIDATION_ERROR',
    message: customMsg,
  }),
  INVALID_FORMAT: (customMsg = '올바르지 않은 형식입니다.') => ({
    httpStatus: 400,
    errorCode: 'INVALID_FORMAT',
    message: customMsg,
  }),
  CONCURRENCY_ERROR: (customMsg = '충돌이 발생했습니다.') => ({
    httpStatus: 409,
    errorCode: 'CONCURRENCY_ERROR',
    message: customMsg,
  }),

  // ---인증---
  EMAIL_REQUIRED: (customMsg = '이메일을 입력해 주세요.') => ({
    httpStatus: 400,
    errorCode: 'EMAIL_REQUIRED',
    message: customMsg,
  }),
  PASSWORD_REQUIRED: (customMsg = '비밀번호를 입력해 주세요.') => ({
    httpStatus: 400,
    errorCode: 'PASSWORD_REQUIRED',
    message: customMsg,
  }),
  NICKNAME_REQUIRED: (customMsg = '닉네임을 입력해 주세요.') => ({
    httpStatus: 400,
    errorCode: 'NICKNAME_REQUIRED',
    message: customMsg,
  }),
  INVALID_EMAIL: (customMsg = '올바른 이메일 형식이 아닙니다.') => ({
    httpStatus: 400,
    errorCode: 'INVALID_EMAIL',
    message: customMsg,
  }),
  INVALID_PASSWORD: (customMsg = '비밀번호가 올바르지 않습니다.') => ({
    httpStatus: 400,
    errorCode: 'INVALID_PASSWORD',
    message: customMsg,
  }),
  //중복 생성 시도
  EMAIL_ALREADY_EXISTS: (customMsg = '이미 사용 중인 이메일입니다.') => ({
    httpStatus: 409,
    errorCode: 'EMAIL_ALREADY_EXISTS',
    message: customMsg,
  }),
  NICKNAME_ALREADY_EXISTS: (customMsg = '이미 사용 중인 닉네임입니다.') => ({
    httpStatus: 409,
    errorCode: 'NICKNAME_ALREADY_EXISTS',
    message: customMsg,
  }),

  USER_NOT_FOUND: (customMsg = '사용자를 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'USER_NOT_FOUND',
    message: customMsg,
  }),
  LOGIN_FAILED: (customMsg = '이메일 또는 비밀번호가 올바르지 않습니다.') => ({
    httpStatus: 401,
    errorCode: 'LOGIN_FAILED',
    message: customMsg,
  }),
  TOKEN_REQUIRED: (customMsg = '토큰이 필요합니다.') => ({
    httpStatus: 401,
    errorCode: 'TOKEN_REQUIRED',
    message: customMsg,
  }),
  INVALID_TOKEN: (customMsg = '유효하지 않은 토큰입니다.') => ({
    httpStatus: 401,
    errorCode: 'INVALID_TOKEN',
    message: customMsg,
  }),
  EXPIRED_TOKEN: (customMsg = '만료된 토큰입니다.') => ({
    httpStatus: 401,
    errorCode: 'EXPIRED_TOKEN',
    message: customMsg,
  }),

  // 포토카드
  PHOTO_CARD_NOT_FOUND: (customMsg = '포토카드를 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'PHOTO_CARD_NOT_FOUND',
    message: customMsg,
  }),
  PHOTO_CARD_NAME_REQUIRED: (customMsg = '포토카드 이름을 입력해 주세요.') => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_NAME_REQUIRED',
    message: customMsg,
  }),
  PHOTO_CARD_IMAGE_REQUIRED: (
    customMsg = '포토카드 이미지를 등록해 주세요.'
  ) => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_IMAGE_REQUIRED',
    message: customMsg,
  }),
  PHOTO_CARD_DESCRIPTION_REQUIRED: (
    customMsg = '포토카드 설명을 입력해 주세요.'
  ) => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_DESCRIPTION_REQUIRED',
    message: customMsg,
  }),
  PHOTO_CARD_GRADE_REQUIRED: (
    customMsg = '포토카드 등급을 선택해 주세요.'
  ) => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_GRADE_REQUIRED',
    message: customMsg,
  }),
  PHOTO_CARD_GENRE_REQUIRED: (
    customMsg = '포토카드 장르를 선택해 주세요.'
  ) => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_GENRE_REQUIRED',
    message: customMsg,
  }),
  PHOTO_CARD_QUANTITY_REQUIRED: (
    customMsg = '포토카드 수량을 입력해 주세요.'
  ) => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_QUANTITY_REQUIRED',
    message: customMsg,
  }),
  PHOTO_CARD_PRICE_REQUIRED: (
    customMsg = '포토카드 가격을 입력해 주세요.'
  ) => ({
    httpStatus: 400,
    errorCode: 'PHOTO_CARD_PRICE_REQUIRED',
    message: customMsg,
  }),

  // 카드 복사본
  CARD_COPY_NOT_FOUND: (customMsg = '보유한 포토카드를 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'CARD_COPY_NOT_FOUND',
    message: customMsg,
  }),
  CARD_COPY_ALREADY_ON_SALE: (
    customMsg = '이미 판매 중인 포토카드입니다.'
  ) => ({
    httpStatus: 409,
    errorCode: 'CARD_COPY_ALREADY_ON_SALE',
    message: customMsg,
  }),
  CARD_COPY_NOT_OWNED: (
    customMsg = '보유 중인 포토카드만 처리할 수 있습니다.'
  ) => ({
    httpStatus: 409,
    errorCode: 'CARD_COPY_NOT_OWNED',
    message: customMsg,
  }),
  CARD_COPY_NOT_ENOUGH: (customMsg = '보유한 카드 수량이 부족합니다.') => ({
    httpStatus: 400,
    errorCode: 'CARD_COPY_NOT_ENOUGH',
    message: customMsg,
  }),

  // 판매
  SALE_NOT_FOUND: (customMsg = '판매 정보를 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'SALE_NOT_FOUND',
    message: customMsg,
  }),
  SALE_ITEM_NOT_FOUND: (customMsg = '판매 상품을 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'SALE_ITEM_NOT_FOUND',
    message: customMsg,
  }),
  SALE_ALREADY_SOLD_OUT: (customMsg = '이미 판매 완료된 상품입니다.') => ({
    httpStatus: 409,
    errorCode: 'SALE_ALREADY_SOLD_OUT',
    message: customMsg,
  }),
  SALE_NOT_AVAILABLE: (customMsg = '구매할 수 없는 상품입니다.') => ({
    httpStatus: 409,
    errorCode: 'SALE_NOT_AVAILABLE',
    message: customMsg,
  }),
  NOT_SALE_OWNER: (customMsg = '판매자만 수정할 수 있습니다.') => ({
    httpStatus: 403,
    errorCode: 'NOT_SALE_OWNER',
    message: customMsg,
  }),
  CANNOT_BUY_OWN_CARD: (
    customMsg = '본인이 등록한 포토카드는 구매할 수 없습니다.'
  ) => ({
    httpStatus: 403,
    errorCode: 'CANNOT_BUY_OWN_CARD',
    message: customMsg,
  }),

  // 구매
  INSUFFICIENT_POINTS: (customMsg = '포인트가 부족합니다.') => ({
    httpStatus: 400,
    errorCode: 'INSUFFICIENT_POINTS',
    message: customMsg,
  }),
  PURCHASE_FAILED: (customMsg = '구매에 실패했습니다.') => ({
    httpStatus: 500,
    errorCode: 'PURCHASE_FAILED',
    message: customMsg,
  }),
  PURCHASE_NOT_FOUND: (customMsg = '구매 내역을 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'PURCHASE_NOT_FOUND',
    message: customMsg,
  }),

  // 교환
  EXCHANGE_NOT_FOUND: (customMsg = '교환 제안을 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'EXCHANGE_NOT_FOUND',
    message: customMsg,
  }),
  EXCHANGE_ALREADY_EXISTS: (
    customMsg = '이미 교환 제안을 보낸 포토카드입니다.'
  ) => ({
    httpStatus: 409,
    errorCode: 'EXCHANGE_ALREADY_EXISTS',
    message: customMsg,
  }),
  EXCHANGE_NOT_AVAILABLE: (customMsg = '교환할 수 없는 포토카드입니다.') => ({
    httpStatus: 409,
    errorCode: 'EXCHANGE_NOT_AVAILABLE',
    message: customMsg,
  }),
  EXCHANGE_ALREADY_PROCESSED: (customMsg = '이미 처리된 교환 제안입니다.') => ({
    httpStatus: 409,
    errorCode: 'EXCHANGE_ALREADY_PROCESSED',
    message: customMsg,
  }),
  CANNOT_EXCHANGE_OWN_CARD: (
    customMsg = '본인 카드에는 교환 제안을 할 수 없습니다.'
  ) => ({
    httpStatus: 403,
    errorCode: 'CANNOT_EXCHANGE_OWN_CARD',
    message: customMsg,
  }),
  OFFERED_CARD_NOT_FOUND: (
    customMsg = '제안할 포토카드를 찾을 수 없습니다.'
  ) => ({
    httpStatus: 404,
    errorCode: 'OFFERED_CARD_NOT_FOUND',
    message: customMsg,
  }),
  REQUESTED_CARD_NOT_FOUND: (
    customMsg = '교환 요청 대상 포토카드를 찾을 수 없습니다.'
  ) => ({
    httpStatus: 404,
    errorCode: 'REQUESTED_CARD_NOT_FOUND',
    message: customMsg,
  }),

  // 알림
  NOTIFICATION_NOT_FOUND: (customMsg = '알림을 찾을 수 없습니다.') => ({
    httpStatus: 404,
    errorCode: 'NOTIFICATION_NOT_FOUND',
    message: customMsg,
  }),

  // 랜덤박스
  RANDOM_BOX_COOLDOWN: (
    customMsg = '랜덤박스는 1시간에 한 번만 열 수 있습니다.'
  ) => ({
    httpStatus: 429,
    errorCode: 'RANDOM_BOX_COOLDOWN',
    message: customMsg,
  }),
  RANDOM_BOX_OPEN_FAILED: (customMsg = '랜덤박스 열기에 실패했습니다.') => ({
    httpStatus: 500,
    errorCode: 'RANDOM_BOX_OPEN_FAILED',
    message: customMsg,
  }),

  // 파일
  FILE_REQUIRED: (customMsg = '파일을 등록해 주세요.') => ({
    httpStatus: 400,
    errorCode: 'FILE_REQUIRED',
    message: customMsg,
  }),
  FILE_UPLOAD_FAILED: (customMsg = '파일 업로드에 실패했습니다.') => ({
    httpStatus: 500,
    errorCode: 'FILE_UPLOAD_FAILED',
    message: customMsg,
  }),
  INVALID_FILE_TYPE: (customMsg = '지원하지 않는 파일 형식입니다.') => ({
    httpStatus: 400,
    errorCode: 'INVALID_FILE_TYPE',
    message: customMsg,
  }),
};
