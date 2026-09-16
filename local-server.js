/**
 * 문수로 비스타 더파크 - 로컬 개발 및 독립 호스팅용 Node.js 서버
 * (Node.js 내장 모듈만 사용하여 npm install 없이 즉시 구동 가능)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

// .env.local 환경변수 수동 로드
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const registerHandler = require('./api/register.js');
const customersHandler = require('./api/customers.js');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = reqUrl.pathname;
  const query = Object.fromEntries(reqUrl.searchParams);

  // Vercel Serverless 호환 래퍼 생성
  const enhanceResponse = () => {
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data) {
      this.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(data));
      return this;
    };
    res.send = function (data) {
      this.end(data);
      return this;
    };
  };

  enhanceResponse();
  req.query = query;

  // 1. API 라우트 분기
  if (pathname === '/api/register') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = bodyData;
      }
      await registerHandler(req, res);
    });
    return;
  }

  if (pathname === '/api/customers') {
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyData ? JSON.parse(bodyData) : {};
      } catch (e) {
        req.body = bodyData;
      }
      await customersHandler(req, res);
    });
    return;
  }

  // 2. 정적 파일 서비스
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // 보안: 디렉터리 탐색 방지
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 처리
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 [문수로 비스타 더파크] 웹 서버 구동 완료!`);
  console.log(`📡 접속 URL: http://localhost:${PORT}`);
  console.log(`🗄️  Supabase DB 연동: ${process.env.SUPABASE_URL || '연결됨'}`);
  console.log(`🔑 관리자 패널 단축키: Ctrl + Shift + A (비밀번호: ${process.env.ADMIN_PASSWORD || '1234'})`);
  console.log(`======================================================\n`);
});
