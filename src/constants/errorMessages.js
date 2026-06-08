export const ERROR_MESSAGES = {
  // 공통
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  BAD_REQUEST: '잘못된 요청입니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',

  // 인증
  EMAIL_REQUIRED: '이메일을 입력해 주세요.',
  PASSWORD_REQUIRED: '비밀번호를 입력해 주세요.',
  NICKNAME_REQUIRED: '닉네임을 입력해 주세요.',
  INVALID_EMAIL: '유효한 이메일을 입력해 주세요.',
  INVALID_NICKNAME_LENGTH: '닉네임은 2자 이상 12자 이하로 입력해 주세요.',
  INVALID_PASSWORD_LENGTH: '비밀번호는 8자 이상 입력해 주세요.',
  INVALID_PASSWORD: '비밀번호가 올바르지 않습니다.',
  MISSING_CREDENTIALS: '이메일과 비밀번호를 입력해 주세요.',
  EMAIL_ALREADY_EXISTS: '이미 사용 중인 이메일입니다.',
  NICKNAME_ALREADY_EXISTS: '이미 사용 중인 닉네임입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  LOGIN_FAILED: '이메일 또는 비밀번호가 올바르지 않습니다.',
  NO_TOKEN: '인증 토큰이 없습니다.',
  TOKEN_REQUIRED: '토큰이 필요합니다.',
  INVALID_TOKEN: '유효하지 않은 토큰입니다.',
  EXPIRED_TOKEN: '만료된 토큰입니다.',
  NO_REFRESH_TOKEN: '리프레시 토큰이 없습니다.',
  INVALID_REFRESH_TOKEN: '유효하지 않은 리프레시 토큰입니다.',
  REFRESH_TOKEN_EXPIRED:
    '리프레시 토큰이 만료되었습니다. 다시 로그인해 주세요.',

  // 포토카드
  PHOTO_CARD_NOT_FOUND: '포토카드를 찾을 수 없습니다.',
  PHOTO_CARD_NAME_REQUIRED: '포토카드 이름을 입력해 주세요.',
  PHOTO_CARD_IMAGE_REQUIRED: '포토카드 이미지를 등록해 주세요.',
  PHOTO_CARD_DESCRIPTION_REQUIRED: '포토카드 설명을 입력해 주세요.',
  PHOTO_CARD_GRADE_REQUIRED: '포토카드 등급을 선택해 주세요.',
  PHOTO_CARD_GENRE_REQUIRED: '포토카드 장르를 선택해 주세요.',
  PHOTO_CARD_QUANTITY_REQUIRED: '포토카드 수량을 입력해 주세요.',
  PHOTO_CARD_PRICE_REQUIRED: '포토카드 가격을 입력해 주세요.',

  // 카드 복사본
  CARD_COPY_NOT_FOUND: '보유한 포토카드를 찾을 수 없습니다.',
  CARD_COPY_ALREADY_ON_SALE: '이미 판매 중인 포토카드입니다.',
  CARD_COPY_NOT_OWNED: '보유 중인 포토카드만 처리할 수 있습니다.',

  // 판매
  SALE_NOT_FOUND: '판매 정보를 찾을 수 없습니다.',
  SALE_ITEM_NOT_FOUND: '판매 상품을 찾을 수 없습니다.',
  SALE_ALREADY_SOLD_OUT: '이미 판매 완료된 상품입니다.',
  SALE_NOT_AVAILABLE: '구매할 수 없는 상품입니다.',
  NOT_SALE_OWNER: '판매자만 수정할 수 있습니다.',
  CANNOT_BUY_OWN_CARD: '본인이 등록한 포토카드는 구매할 수 없습니다.',

  // 구매
  INSUFFICIENT_POINTS: '포인트가 부족합니다.',
  PURCHASE_FAILED: '구매에 실패했습니다.',
  PURCHASE_NOT_FOUND: '구매 내역을 찾을 수 없습니다.',

  // 교환
  EXCHANGE_NOT_FOUND: '교환 제안을 찾을 수 없습니다.',
  EXCHANGE_ALREADY_EXISTS: '이미 교환 제안을 보낸 포토카드입니다.',
  EXCHANGE_NOT_AVAILABLE: '교환할 수 없는 포토카드입니다.',
  EXCHANGE_ALREADY_PROCESSED: '이미 처리된 교환 제안입니다.',
  CANNOT_EXCHANGE_OWN_CARD: '본인 카드에는 교환 제안을 할 수 없습니다.',
  OFFERED_CARD_NOT_FOUND: '제안할 포토카드를 찾을 수 없습니다.',
  REQUESTED_CARD_NOT_FOUND: '교환 요청 대상 포토카드를 찾을 수 없습니다.',

  // 알림
  NOTIFICATION_NOT_FOUND: '알림을 찾을 수 없습니다.',

  // 랜덤박스
  RANDOM_BOX_COOLDOWN: '랜덤박스는 1시간에 한 번만 열 수 있습니다.',
  RANDOM_BOX_OPEN_FAILED: '랜덤박스 열기에 실패했습니다.',

  // 파일
  FILE_REQUIRED: '파일을 등록해 주세요.',
  FILE_UPLOAD_FAILED: '파일 업로드에 실패했습니다.',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
};
