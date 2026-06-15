# 📌 Favorite Photo API Endpoint 정리

## Base URL

```txt
/api
```

---

# 🔐 Auth

## 회원가입

```http
POST /api/auth/register
```

## 로그인

```http
POST /api/auth/login
```

## 로그아웃

```http
POST /api/auth/logout
```

## AccessToken 재발급

```http
POST /api/auth/refresh
```

## 내 정보 조회

```http
GET /api/auth/me
```

## OAuth

### Google

```http
GET /api/auth/google
GET /api/auth/google/callback
```

### Kakao

```http
GET /api/auth/kakao
GET /api/auth/kakao/callback
```

### Naver

```http
GET /api/auth/naver
GET /api/auth/naver/callback
```

### OAuth 닉네임 설정

```http
POST /api/auth/oauth/complete
```

---

# 📸 PhotoCard

## 포토카드 생성

```http
POST /api/cards
```

## 포토카드 상세 조회

```http
GET /api/cards/:id
```

---

# 🖼 My Gallery

## 내 보유 카드 조회

```http
GET /api/me/cards
```

### Query

```txt
keyword
grade
genre
page
limit
sort
```

---

# 🏪 Market

## 마켓 카드 목록 조회

```http
GET /api/market/cards
```

### Query

```txt
cursor
limit
keyword
grade
genre
sort
```

### sort

```txt
latest
priceAsc
priceDesc
```

---

## 마켓 카드 상세 조회

```http
GET /api/market/cards/:saleId
```

---

## 카드 구매

```http
POST /api/market/cards/:saleId/purchase
```

### Body

```json
{
  "quantity": 1
}
```

---

# 💰 Sales

## 판매 등록

```http
POST /api/sales
```

### Body

```json
{
  "photoCardId": 1,
  "quantity": 2,
  "price": 1000,
  "exchangeGrade": "RARE",
  "exchangeGenre": "ALBUM",
  "exchangeDescription": "교환 희망"
}
```

---

## 판매 상세 조회

```http
GET /api/sales/:saleId
```

---

## 내가 판매 중인 카드 조회

```http
GET /api/me/sales
```

---

## 판매 수정

```http
PATCH /api/sales/:saleId
```

---

## 판매 취소

```http
DELETE /api/sales/:saleId
```

---

# 🔄 Exchange

## 교환 제안 생성

```http
POST /api/exchange-proposals
```

### Body

```json
{
  "saleId": 1,
  "offeredCardCopyId": 10,
  "description": "교환 신청합니다"
}
```

---

## 교환 목록 조회

```http
GET /api/exchange-proposals
```

### Query

```txt
type=sent | received

status=
PENDING
ACCEPTED
REJECTED
CANCELED

page
limit
```

---

## 교환 승인

```http
PATCH /api/exchange-proposals/:id/accept
```

---

## 교환 거절

```http
PATCH /api/exchange-proposals/:id/reject
```

---

## 교환 취소

```http
PATCH /api/exchange-proposals/:id/cancel
```

---

# 🔔 Notification

## 알림 목록 조회

```http
GET /api/notifications
```

### Response

```json
{
  "items": [],
  "meta": {
    "totalCount": 10,
    "unreadCount": 3
  }
}
```

---

## 알림 읽음 처리

```http
PATCH /api/notifications/:id/read
```

---

# 💎 Point

## 포인트 내역 조회

```http
GET /api/points
```

### Query

```txt
page
limit
```

---

# 🎁 Random Box

## 랜덤박스 상태 조회

```http
GET /api/points/random-box
```

---

## 랜덤박스 열기

```http
POST /api/points/random-box
```

### Body

```json
{
  "selectedBox": 1
}
```

---

# 📁 Upload

## 이미지 업로드

```http
POST /api/upload
```

### FormData

```txt
image: File
```

---

# 공통 Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "에러 메시지"
  }
}
```
