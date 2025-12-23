import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// 데이터베이스 연결 풀 생성
// Render.com의 Internal Database URL을 지원
let poolConfig = {};

if (process.env.DATABASE_URL) {
  // Render.com의 Internal/External Database URL 사용
  // Render 데이터베이스는 항상 SSL이 필요함
  const isRenderDB = process.env.DATABASE_URL.includes('render.com') || 
                     process.env.DATABASE_URL.includes('onrender.com');
  
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isRenderDB ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // 개별 환경 변수 사용
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  // Render 호스트인 경우 SSL 사용
  const isRenderHost = process.env.DB_HOST && (
    process.env.DB_HOST.includes('render.com') || 
    process.env.DB_HOST.includes('onrender.com')
  );
  
  if (isRenderHost || process.env.NODE_ENV === 'production') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = new Pool(poolConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err);
});

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 성공:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    return false;
  }
};

export default pool;

