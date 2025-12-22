# 개발 환경 설정 가이드

## 1. Node.js 설치

Node.js가 설치되어 있지 않은 경우 다음 단계를 따라주세요:

1. [Node.js 공식 웹사이트](https://nodejs.org/)에 접속
2. LTS 버전 다운로드 (권장: v18 이상)
3. 설치 프로그램 실행 및 설치
4. 설치 완료 후 터미널을 재시작

## 2. 설치 확인

터미널에서 다음 명령어로 설치 확인:

```bash
node --version
npm --version
```

두 명령어 모두 버전 번호를 출력하면 정상적으로 설치된 것입니다.

## 3. 프로젝트 의존성 설치

ui 폴더로 이동한 후 의존성을 설치합니다:

```bash
cd ui
npm install
```

## 4. 개발 서버 실행

의존성 설치가 완료되면 개발 서버를 실행합니다:

```bash
npm run dev
```

개발 서버가 실행되면 터미널에 다음과 같은 메시지가 표시됩니다:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

브라우저에서 `http://localhost:5173`으로 접속하면 앱을 확인할 수 있습니다.

## 5. 문제 해결

### ERR_CONNECTION_REFUSED 오류

- 개발 서버가 실행 중인지 확인 (`npm run dev` 실행 여부)
- 다른 포트를 사용 중인지 확인 (5173 포트가 사용 중일 수 있음)
- 방화벽 설정 확인

### npm install 오류

- Node.js가 제대로 설치되었는지 확인
- 인터넷 연결 확인
- 관리자 권한으로 터미널 실행 후 재시도

