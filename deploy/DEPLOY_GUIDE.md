# vista-thepark.irunda.co.kr 실서버 배포 가이드

본 프로젝트는 **이룬다 공식 홈페이지(`irunda.co.kr`) 및 Land CRM**과 동일한 **Supabase 클라우드 데이터베이스**와 **Vercel 클라우드 호스팅**에 최적화되어 있습니다.

고객이 웹사이트에서 관심고객을 등록하면 **Supabase 클라우드 DB에 즉시 저장**되며, 이룬다 **Land CRM의 고객 문의함에도 실시간 동기화**됩니다.

---

## 🌟 [방법 1] Vercel 배포 (irunda.co.kr와 동일한 방식 - 가장 추천)

`irunda.co.kr`가 이미 Vercel에서 운영 중이므로, 가장 빠르고 안정적이며 무료로 HTTPS(SSL)까지 자동 적용되는 방식입니다.

### 1단계: GitHub 저장소 생성 및 푸시
```bash
# hopeful-turing 폴더에서 git 커밋
git add .
git commit -m "feat: Munsuro Vista The Park with Supabase & Vercel deployment"

# GitHub에 새 저장소(예: vista-thepark) 생성 후 푸시
git remote add origin https://github.com/[사용자계정]/vista-thepark.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 가져오기 (Import)
1. **[Vercel 대시보드](https://vercel.com/dashboard)** 접속 후 로그인
2. **[Add New...]** ➔ **[Project]** 클릭
3. 방금 푸시한 `vista-thepark` 저장소의 **[Import]** 버튼 클릭
4. **Environment Variables (환경변수)** 설정 추가:
   - `SUPABASE_URL` : `https://lalmyznpdqzjshewndyp.supabase.co`
   - `SUPABASE_KEY` : `your_supabase_secret_key`
   - `ADMIN_PASSWORD` : `1234`
5. **[Deploy]** 클릭 (약 20~30초 만에 배포 완료!)

### 3단계: 서브도메인 (`vista-thepark.irunda.co.kr`) 연결
1. Vercel 프로젝트 대시보드에서 **[Settings]** ➔ **[Domains]** 이동
2. `vista-thepark.irunda.co.kr` (또는 `vista-thepark.iruna.co.kr`) 입력 후 **[Add]** 클릭
3. **DNS 설정**:
   - 도메인 관리처(가비아, 후이즈 등) DNS 설정에서 CNAME 레코드 추가:
     - **호스트**: `vista-thepark`
     - **값(Target)**: `cname.vercel-dns.com`
   - (만약 `irunda.co.kr`의 네임서버가 이미 Vercel로 지정되어 있다면 추가 작업 없이 즉시 자동 연결됩니다.)
4. Vercel이 무료 SSL 인증서(HTTPS)를 1분 이내에 자동 발급하여 배포가 완료됩니다!

---

## 🖥️ [방법 2] 독립 서버 / Linux VPS 배포 (Cafe24, AWS, Nginx)

독립 리눅스 서버에서 직접 구동할 경우:

### 1단계: 서버에 파일 업로드 및 환경변수 확인
```bash
cd /var/www/vista-thepark
# .env.local 파일에 SUPABASE_URL, SUPABASE_KEY가 설정되어 있는지 확인
```

### 2단계: PM2를 통한 무중단 실행
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 3단계: Nginx 리버스 프록시 및 SSL 인증서
```bash
sudo cp deploy/nginx/vista-thepark.irunda.co.kr.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/vista-thepark.irunda.co.kr.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 무료 Let's Encrypt SSL 자동 발급
sudo certbot --nginx -d vista-thepark.irunda.co.kr
```

---

## 💻 [방법 3] 로컬 PC에서 즉시 테스트 구동

로컬 컴퓨터에서 바로 서버를 실행해보고 싶으신 경우:
```bash
# 터미널에서 실행
npm start
# 또는
node server.js
```
브라우저에서 `http://localhost:3000`으로 접속하시면 즉시 웹페이지와 Supabase DB 연동을 테스트하실 수 있습니다.

---

## 🔒 관리자 페이지 및 엑셀 다운로드

1. **접속 방법**:
   - 브라우저 주소창에 `https://vista-thepark.irunda.co.kr/#admin` 입력
   - 또는 웹페이지 아무 곳에서나 **`Ctrl + Shift + A`** 입력
   - 또는 푸터 최하단의 **`[🔒 공인중개사 고객관리 (Admin)]`** 버튼 클릭
2. **비밀번호**: `1234`
3. **기능**:
   - **실시간 Supabase DB 명단 조회**: 클라우드 DB에 보관된 고객 명단 실시간 확인
   - **엑셀(CSV) 다운로드**: 한글 인코딩(UTF-8 BOM)이 완벽 적용된 엑셀 파일 즉시 다운로드
   - **삭제 관리**: 상담 완료된 고객 행 삭제 가능
