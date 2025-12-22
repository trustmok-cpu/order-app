# 커피 주문 앱 - 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정하세요.

```bash
cp .env.example .env
```

`.env` 파일을 열어 데이터베이스 연결 정보를 수정하세요.

## 서버 실행

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 기본
- `GET /` - API 정보
- `GET /health` - 헬스 체크

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:menuId` - 특정 메뉴 조회
- `PATCH /api/menus/:menuId/stock` - 메뉴 재고 수정

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 특정 주문 조회
- `PATCH /api/orders/:orderId/status` - 주문 상태 변경

### 통계 관련
- `GET /api/orders/stats` - 주문 통계 조회

## 데이터베이스

PostgreSQL 데이터베이스를 사용합니다.

### 데이터베이스 설정

1. PostgreSQL에서 데이터베이스 생성:
```sql
CREATE DATABASE order_app;
```

2. `.env` 파일에 데이터베이스 연결 정보 설정:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=order_app
DB_USER=postgres
DB_PASSWORD=your_password
```

3. 데이터베이스 초기화 (테이블 생성 및 초기 데이터 삽입):
```bash
npm run db:init
```

이 명령어는 다음을 수행합니다:
- 테이블 생성 (menus, options, orders, order_items, order_item_options)
- 인덱스 생성
- 트리거 생성 (updated_at 자동 업데이트)
- 초기 메뉴 및 옵션 데이터 삽입

데이터베이스 스키마는 `docs/PRD.md` 파일의 6.4.2 섹션을 참고하세요.

## 개발 가이드

1. 데이터베이스 연결 설정
2. 라우터 모듈화 (`routes/` 폴더)
3. 데이터베이스 모델 (`models/` 폴더)
4. 미들웨어 설정 (`middleware/` 폴더)
5. 에러 처리 (`utils/` 폴더)

