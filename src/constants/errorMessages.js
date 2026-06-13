export const ERROR_MESSAGES = {
  RANDOM_BOX_OPEN_FAILED: {
    httpStatus: 500,
    errorCode: 'RANDOM_BOX_OPEN_FAILED',
    message: '랜덤박스 열기에 실패했습니다.',
  },
  RANDOM_BOX_COOLDOWN: {
    httpStatus: 429,
    errorCode: 'RANDOM_BOX_COOLDOWN',
    message: '랜덤박스는 1시간에 한 번만 열 수 있습니다.',
  },
};
