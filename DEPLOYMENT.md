# Render.com 배포 가이드

이 문서는 커피 주문 앱을 Render.com에 배포하는 방법을 설명합니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. Render.com 대시보드에 로그인
2. **New +** 버튼 클릭 → **PostgreSQL** 선택
3. 데이터베이스 설정:
   - **Name**: `order-app-db` (원하는 이름)
   - **Database**: `order_app` (또는 원하는 이름)
   - **User**: 자동 생성됨
   - **Region**: 가장 가까운 지역 선택
   - **PostgreSQL Version**: 최신 버전 선택
   - **Plan**: Free 플랜 선택 (또는 유료 플랜)
4. **Create Database** 클릭
5. 데이터베이스가 생성되면 **Connections** 탭에서 연결 정보 확인:
   - **Internal Database URL**: 백엔드에서 사용
   - **External Database URL**: 로컬에서 접근 시 사용

### 2단계: 백엔드 서버 배포

1. **New +** 버튼 클릭 → **Web Service** 선택
2. GitHub 저장소 연결:
   - 저장소를 선택하거나 연결
   - **Root Directory**: `server` 지정
3. 서비스 설정:
   - **Name**: `order-app-server` (원하는 이름)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free 플랜 선택
4. **Environment Variables** 섹션에서 환경 변수 추가:
   
   **방법 1: DATABASE_URL 사용 (권장)**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<PostgreSQL Internal Database URL>
   ```
   
   **방법 2: 개별 환경 변수 사용**
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<PostgreSQL 호스트>
   DB_PORT=5432
   DB_NAME=order_app
   DB_USER=<PostgreSQL 사용자>
   DB_PASSWORD=<PostgreSQL 비밀번호>
   ```
   
   > **참고**: 
   > - PostgreSQL 연결 정보는 Render 대시보드의 데이터베이스 페이지에서 확인할 수 있습니다.
   > - **Internal Database URL**을 사용하는 것이 권장됩니다 (Render 서비스 간 통신에 최적화).
   > - Internal Database URL은 `postgresql://user:password@host:port/database` 형식입니다.
5. **Create Web Service** 클릭
6. 배포 완료 후 서비스 URL 확인 (예: `https://order-app-server.onrender.com`)

### 3단계: 데이터베이스 초기화

백엔드 서버가 배포된 후, 데이터베이스를 초기화해야 합니다.

**방법 1: Render Shell 사용 (권장)**

1. Render 대시보드에서 백엔드 서비스 선택
2. **Shell** 탭 클릭
3. 다음 명령어 실행:
   ```bash
   cd /opt/render/project/src
   node database/init.js
   ```

**방법 2: 로컬에서 실행**

1. 로컬에서 `.env` 파일 생성 (External Database URL 사용):
   ```env
   DB_HOST=<External Database Host>
   DB_PORT=5432
   DB_NAME=order_app
   DB_USER=<External Database User>
   DB_PASSWORD=<External Database Password>
   ```
2. 다음 명령어 실행:
   ```bash
   cd server
   npm run db:init
   ```

### 4단계: 프론트엔드 배포

#### 옵션 A: Static Site로 배포 (권장)

1. **New +** 버튼 클릭 → **Static Site** 선택
2. GitHub 저장소 연결:
   - 저장소를 선택하거나 연결
   - **Root Directory**: `ui` 지정
3. 빌드 설정:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables** 섹션에서 환경 변수 추가:
   ```
   VITE_API_BASE_URL=https://order-app-server.onrender.com/api
   ```
   > **참고**: 백엔드 서비스 URL을 `VITE_API_BASE_URL`로 설정합니다.
5. **Create Static Site** 클릭

#### 옵션 B: Web Service로 배포

1. **New +** 버튼 클릭 → **Web Service** 선택
2. GitHub 저장소 연결:
   - 저장소를 선택하거나 연결
   - **Root Directory**: `ui` 지정
3. 서비스 설정:
   - **Name**: `order-app-ui`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview` (또는 정적 파일 서빙 설정)
   - **Plan**: Free 플랜 선택
4. **Environment Variables** 추가:
   ```
   VITE_API_BASE_URL=https://order-app-server.onrender.com/api
   ```
5. **Create Web Service** 클릭

### 5단계: CORS 설정 확인

백엔드 서버의 `server.js`에서 CORS 설정이 올바른지 확인합니다.
프론트엔드 URL을 허용하도록 설정되어 있어야 합니다.

## 환경 변수 요약

### 백엔드 (Web Service)
```
NODE_ENV=production
PORT=10000
DB_HOST=<PostgreSQL 호스트>
DB_PORT=5432
DB_NAME=order_app
DB_USER=<PostgreSQL 사용자>
DB_PASSWORD=<PostgreSQL 비밀번호>
```

### 프론트엔드 (Static Site 또는 Web Service)
```
VITE_API_BASE_URL=https://order-app-server.onrender.com/api
```

## 배포 후 확인 사항

1. **백엔드 헬스 체크**: `https://order-app-server.onrender.com/health`
2. **API 엔드포인트 테스트**: `https://order-app-server.onrender.com/api/menus`
3. **프론트엔드 접속**: 프론트엔드 URL에서 앱이 정상 작동하는지 확인

## 문제 해결

### 데이터베이스 연결 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Internal Database URL 사용 권장
- 데이터베이스가 활성화되어 있는지 확인 (Free 플랜은 90일 비활성화 후 삭제)

### CORS 오류
- 백엔드의 CORS 설정 확인
- 프론트엔드 URL이 허용 목록에 있는지 확인

### 빌드 오류
- Node.js 버전 확인 (Render는 자동 감지)
- `package.json`의 스크립트 확인
- 빌드 로그 확인

## 참고 사항

- Free 플랜은 15분간 비활성화되면 자동으로 슬리프 모드로 전환됩니다.
- 첫 요청 시 서비스가 깨어나는데 시간이 걸릴 수 있습니다.
- 데이터베이스는 90일간 비활성화되면 삭제됩니다.

