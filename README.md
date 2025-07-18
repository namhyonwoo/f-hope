# F-Hope 유년부 출석부 프로젝트

## 🚀 프로젝트 실행 방법

### 1. 백엔드 설정

```bash
cd packages/backend
npm install
```

백엔드 환경변수 설정 (`.env` 파일 생성):
```env
# Database Configuration
FLOCKS_DB_HOST=localhost
FLOCKS_DB_PORT=5432
FLOCKS_DB_USER=postgres
FLOCKS_DB_PASSWORD=password
FLOCKS_DB_NAME=fhope_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3001
```

### 2. 프론트엔드 설정

```bash
cd packages/frontend
npm install
```

프론트엔드 환경변수 설정 (`.env.local` 파일 생성):
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. 개발 서버 실행

```bash
# 백엔드 실행 (새 터미널)
cd packages/backend
npm run start:dev

# 프론트엔드 실행 (새 터미널)
cd packages/frontend
npm run dev
```

## 🔧 로그인 문제 해결

### 문제점 및 해결방안

1. **API 엔드포인트 불일치**
   - ✅ 해결됨: `vite.config.ts`에서 API URL 설정
   - ✅ 해결됨: 백엔드 CORS 설정 추가

2. **Google OAuth 콜백 경로 오류**
   - ✅ 해결됨: `/login` → `/` 경로 수정

3. **SocialSignupPage API 호출 문제**
   - ✅ 해결됨: `authApi.socialSignup()` 사용

4. **환경변수 설정**
   - ✅ 해결됨: `vite.config.ts`에서 기본값 설정

### 확인사항

1. **데이터베이스 연결**: PostgreSQL이 실행 중인지 확인
2. **JWT 시크릿**: 백엔드 `.env` 파일에 `JWT_SECRET` 설정
3. **Google OAuth**: Google Cloud Console에서 OAuth 클라이언트 설정
4. **포트 충돌**: 3001(백엔드), 5173(프론트엔드) 포트 사용 가능한지 확인

## 📁 프로젝트 구조

```
f-hope/
├── packages/
│   ├── backend/          # NestJS 백엔드
│   │   ├── src/
│   │   │   ├── auth/     # 인증 관련
│   │   │   ├── entities/ # 데이터베이스 엔티티
│   │   │   └── ...
│   └── frontend/         # React 프론트엔드
│       ├── src/
│       │   ├── components/ # UI 컴포넌트
│       │   ├── api/        # API 클라이언트
│       │   └── ...
```

## 🛠️ 기술 스택

- **백엔드**: NestJS, TypeScript, PostgreSQL, TypeORM
- **프론트엔드**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **인증**: JWT, Google OAuth
- **파일 업로드**: Multer 