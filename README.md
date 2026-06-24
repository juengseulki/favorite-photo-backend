# 💫 최애의 포토 (Favorite Photo) - Backend

> 디지털 포토카드 생성부터 판매·구매·교환까지  
> 카드 소유권 기반 거래 흐름을 제공하는 포토카드 플랫폼 Backend API

<br />

## 📌 프로젝트 소개

**최애의 포토**는 사용자가 직접 생성한 디지털 포토카드를 기반으로  
구매, 판매, 교환을 진행할 수 있는 포토카드 거래 서비스입니다.

Backend에서는 단순 CRUD API 구현이 아닌,

- JWT 기반 인증/인가
- OAuth 소셜 로그인
- 카드 소유권 관리
- 거래 상태 관리
- 포인트 정산
- 데이터 정합성 유지
- 대용량 데이터 조회 최적화
- 운영 로그 관리

등 실제 서비스에서 필요한 서버 구조를 고려하여 개발했습니다.

<br />

---

# 👥 Team

**Codeit FullStack 1팀**

| 이름   | 담당                                                                  |
| ------ | --------------------------------------------------------------------- |
| 정슬기 | PM, 초기 서버 구조 설계, 개발 환경 구축, Swagger, Logging, Seed, 배포 |
| 전강민 | 인증·인가, OAuth, JWT 인증 흐름                                       |
| 박소정 | 포토카드 생성, 마이갤러리, 포인트, 알림 API                           |
| 김종찬 | 교환 요청, 승인/거절, 카드 교환 로직                                  |
| 김나린 | 판매, 구매, 거래 시스템, 에러 처리 구조                               |
| 이준영 | 마켓플레이스 조회, 검색/필터 API                                      |

<br />

---

# 🛠 Tech Stack

## Server

- Node.js
- Express.js
- JavaScript (ES Module)

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- Passport
- OAuth 2.0
  - Google
  - Kakao
  - Naver

## Infra

- Render
- Cloudinary

## Dev / Quality

- ESLint
- Prettier
- Husky
- Commitlint

## Docs & Monitoring

- Swagger
- Winston
- Morgan

<br />

---

# 📂 Folder Structure

```bash
src
├── controllers
│   └── HTTP 요청 / 응답 처리
│
├── services
│   └── 비즈니스 로직 처리
│
├── repositories
│   └── Prisma DB 접근 계층
│
├── middlewares
│   ├── auth
│   └── errorHandler
│
├── routes
│   └── API Router
│
├── utils
│   ├── jwt
│   ├── logger
│   └── error
│
├── constants
│
└── app.js
```

<br />

---

# 🗄 Database Design

## 핵심 설계 - PhotoCard / CardCopy 분리

포토카드 서비스에서 가장 중요한 것은  
**카드 정보와 실제 소유권 관리 분리**였습니다.

따라서 카드 원본과 실제 보유 카드를 분리했습니다.

<br />

## PhotoCard

카드 자체의 정보 관리

```text
PhotoCard

- name
- description
- imageUrl
- grade
- genre
- totalQuantity
- initialPrice
- creator
```

<br />

## CardCopy

실제 사용자 소유 카드 관리

```text
CardCopy

- owner
- status
  - OWNED
  - ON_SALE

- serialNumber
```

<br />

장점

```
하나의 포토카드
        ↓
여러 개의 실제 카드 발행
        ↓
각 카드별 소유권 추적 가능
```

이를 기반으로

- 판매
- 구매
- 교환

과정에서 정확한 카드 이동을 관리했습니다.

<br />

---

# 🔐 Authentication

## JWT 인증 구조

```
Login
 ↓
Access Token 발급
 ↓
Refresh Token 발급
 ↓
RefreshToken DB 저장
 ↓
Cookie 전달
```

<br />

## Token 관리

AccessToken

```
Frontend Memory 저장
Authorization Header 전달
```

RefreshToken

```
HttpOnly Cookie 저장
DB에는 Hash 값 저장
```

<br />

보안을 위해 RefreshToken 원본을 저장하지 않고  
Hash 처리 후 저장했습니다.

<br />

---

# 🌐 OAuth Login

지원 Provider

- Google
- Kakao
- Naver

공통 OAuth Flow

```text
Provider Login

 ↓

OAuth Callback

 ↓

기존 회원 확인

 ↓

JWT 발급

 ↓

Frontend Redirect
```

신규 사용자의 경우

```
닉네임 설정
 ↓
회원 생성
 ↓
서비스 진입
```

흐름으로 처리했습니다.

<br />

---

# 🃏 포토카드 생성 API

## 기능

- 이미지 업로드
- 카드 생성
- CardCopy 자동 발급
- 월별 생성 제한

<br />

생성 Flow

```text
PhotoCard 생성

 ↓

quantity 만큼 CardCopy 생성

 ↓

사용자 소유 처리
```

<br />

Transaction 적용

```js
prisma.$transaction();
```

중간 실패 시 일부 데이터만 생성되는 문제 방지

<br />

---

# 🏪 판매 시스템

## 판매 등록 Flow

```text
Sale 생성

 ↓

SaleItem 생성

 ↓

CardCopy 상태 변경

OWNED → ON_SALE
```

<br />

판매 중인 카드는 상태 변경으로 관리하여

- 중복 판매
- 중복 교환

문제를 방지했습니다.

<br />

---

# 💳 구매 시스템

구매 과정에서 변경되는 데이터

- Purchase 생성
- PurchaseItem 생성
- CardCopy 소유권 이전
- 구매자 포인트 감소
- 판매자 포인트 증가
- Sale 상태 변경

<br />

Transaction 적용

```text
구매 성공

모든 데이터 변경 commit


중간 실패

전체 rollback
```

<br />

데이터 정합성 유지

<br />

---

# 🔄 교환 시스템

교환 상태 관리

```text
PENDING

 ↓

ACCEPTED
or
REJECTED
```

<br />

승인 처리

```text
사용자 A CardCopy

        ↕

사용자 B CardCopy
```

소유권 교환

<br />

추가 처리

- 다른 대기 요청 정리
- 카드 상태 변경
- 알림 생성

<br />

Transaction으로 처리하여  
부분 변경 문제를 방지했습니다.

<br />

---

# 🔔 Notification

지원 이벤트

- 구매 완료
- 교환 요청
- 교환 승인
- 교환 거절
- 품절

<br />

기능

- 알림 조회
- 읽음 처리
- unread count 제공

<br />

---

# 🎁 Random Point

랜덤 포인트 지급 시스템

기능

- 1시간 쿨타임
- 랜덤 포인트 지급
- 지급 기록 저장

<br />

동시 요청 방어

```
Transaction 내부 검증
```

으로 중복 지급 방지

<br />

---

# 📝 API Documentation

Swagger 적용

제공 내용

- Endpoint
- Request Schema
- Response Schema
- Error Response

<br />

API 변경 사항을 팀원이 쉽게 확인할 수 있도록 관리했습니다.

<br />

---

# 📊 Logging System

운영 환경 문제 추적을 위해 로그 시스템 구축

사용 기술

- Winston
- Morgan

<br />

관리 로그

```text
INFO

- 서버 실행
- 주요 이벤트


WARN

- 인증 실패
- 잘못된 요청


ERROR

- 서버 오류
```

<br />

파일 관리

- 날짜별 로그 저장
- Error 로그 분리 관리

<br />

---

# 🚨 Troubleshooting

# 1. Refresh Token 인증 안정화

## 문제

새로고침 이후

```text
401 발생
refresh 반복 요청
```

## 원인

여러 API 요청이 동시에 Token 재발급 요청

<br />

## 해결

Refresh Token 저장 구조 개선

```js
upsertRefreshToken();
```

적용

<br />

결과

- 사용자당 Token 하나 유지
- 중복 인증 문제 해결

---

# 2. 마켓 조회 성능 개선

## 문제

대용량 테스트

```text
User 10,000+
PhotoCard 100,000+
Sale 30,000+
```

환경에서 조회 지연 발생

## 원인

cursor 요청마다 count 계산 수행

## 해결

첫 페이지

```text
count 조회
```

추가 페이지

```text
cursor 데이터만 조회
```

<br />

결과

- 조회 속도 개선
- DB 부하 감소

---

# 3. Transaction 구조 개선

## 문제

구매 / 교환 과정에서

```text
카드는 이동
포인트 실패
```

같은 데이터 불일치 가능

## 해결

Prisma Transaction 적용

결과

```
모두 성공 → 저장

하나 실패 → rollback
```

---

# 🚀 Deploy

Backend

```
Render
```

Database

```
PostgreSQL
```

Image Storage

```
Cloudinary
```

<br />

---

# 💬 회고

이번 프로젝트에서는 단순 API 구현을 넘어  
실제 서비스에서 중요한

- 인증 안정성
- 데이터 정합성
- 성능 최적화
- 운영 로그 관리

를 경험했습니다.

특히 거래 서비스 특성상  
"데이터가 변경되는 순간"을 안전하게 관리하는 것이 중요하다는 것을 배우며  
보다 서비스 관점에서 백엔드를 설계하는 경험을 할 수 있었습니다.
