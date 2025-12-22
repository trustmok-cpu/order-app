import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { testConnection } from './config/database.js';
import menusRouter from './routes/menus.js';
import ordersRouter from './routes/orders.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // CORS 설정 (프런트엔드와 통신을 위해)
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱

// 데이터베이스 연결을 요청 객체에 추가하는 미들웨어
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '커피 주문 앱 API 서버',
    version: '1.0.0'
  });
});

// 헬스 체크 엔드포인트
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API 라우터
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
  
  // 데이터베이스 연결 테스트
  await testConnection();
});

