//기존 코드와의 충돌을 최소화 하기 위해, 기존 방법과 에러 객체를 받는 경우 둘 다 수용가능하도록 함.
class AppError extends Error {
  constructor(statusCodeOrObj, code, message) {
    //에러 오브젝트를 받은 경우
    if (typeof statusCodeOrObj === 'object') {
      super(statusCodeOrObj.message);
      this.statusCode = statusCodeOrObj.httpStatus;
      this.code = statusCodeOrObj.errorCode;
    }
    //기존의 방식대로 받은 경우
    else {
      super(message);
      this.statusCode = statusCodeOrObj;
      this.code = code;
    }
  }
}

export default AppError;
