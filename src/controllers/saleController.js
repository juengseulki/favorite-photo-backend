//요청 데이터 검증, 서비스 호출, 응답 반환 역할

export const createSale = (req, res, next) => {
  //새로운 sale 데이터 검증
  try {
    const {} = req.body;
  } catch (e) {
    next(e);
  }
};
export const modifySale = (req, res, next) => {
  try {
    const { saleId } = req.params;
    const {} = req.body;
  } catch (e) {
    next(e);
  }
};
export const cancelSale = (req, res, next) => {
  try {
    const { saleId } = req.params;
  } catch (e) {
    next(e);
  }
};

export default saleController;
