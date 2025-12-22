import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQL 파일 읽기 함수
const readSQLFile = (filename) => {
  const filePath = path.join(__dirname, filename);
  return fs.readFileSync(filePath, 'utf8');
};

// 데이터베이스 초기화
const initDatabase = async () => {
  try {
    console.log('데이터베이스 초기화를 시작합니다...');
    
    // init.sql 실행
    const initSQL = readSQLFile('init.sql');
    await pool.query(initSQL);
    console.log('✓ 테이블 생성 완료');
    
    // seed.sql 실행
    const seedSQL = readSQLFile('seed.sql');
    await pool.query(seedSQL);
    console.log('✓ 초기 데이터 삽입 완료');
    
    console.log('데이터베이스 초기화가 완료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// 스크립트 실행
initDatabase();

