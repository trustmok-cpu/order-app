import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// PostgreSQL 서버에 연결 (데이터베이스 없이)
const adminClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres', // 기본 데이터베이스
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const dbName = process.env.DB_NAME || 'order_app';

async function checkAndCreateDatabase() {
  try {
    await adminClient.connect();
    console.log('PostgreSQL 서버에 연결되었습니다.');

    // 데이터베이스 존재 여부 확인
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const result = await adminClient.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      // 데이터베이스가 없으면 생성
      console.log(`데이터베이스 '${dbName}'가 없습니다. 생성 중...`);
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ 데이터베이스 '${dbName}'가 생성되었습니다.`);
    } else {
      console.log(`✓ 데이터베이스 '${dbName}'가 이미 존재합니다.`);
    }

    await adminClient.end();
    return true;
  } catch (error) {
    console.error('오류 발생:', error.message);
    console.error('\n가능한 원인:');
    console.error('1. PostgreSQL 서버가 실행되지 않았습니다.');
    console.error('2. 연결 정보(호스트, 포트, 사용자, 비밀번호)가 잘못되었습니다.');
    console.error('3. 사용자 권한이 부족합니다.');
    return false;
  }
}

checkAndCreateDatabase();

