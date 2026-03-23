# 배포 가이드

## 1. Supabase 프로젝트 설정

### 1-1. Supabase 프로젝트 생성
1. https://supabase.com 접속 → 새 프로젝트 생성
2. 프로젝트 이름: `wcon-mission-book`
3. 데이터베이스 비밀번호 설정 (안전하게 보관)

### 1-2. 스키마 적용
1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/001_initial_schema.sql` 내용 전체 복사 후 실행

### 1-3. Storage 버킷 생성
1. Supabase Dashboard → Storage → New bucket
2. 이름: `mission-images`
3. Public bucket: **체크 (ON)**
4. File size limit: `5242880` (5MB)
5. Allowed MIME types: `image/*`

### 1-4. Storage 정책 추가
SQL Editor에서 실행:
```sql
-- mission-images 버킷 업로드 허용 (누구나)
CREATE POLICY "Anyone can upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'mission-images');

-- 공개 읽기 허용
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'mission-images');
```

### 1-5. 관리자 계정 생성
1. Supabase Dashboard → Authentication → Users → Add user
2. 이메일/비밀번호 입력
3. SQL Editor에서 role을 admin으로 변경:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = '관리자_이메일@example.com';
```

### 1-6. API 키 확인
Supabase Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (비공개)

---

## 2. Vercel 배포

### 2-1. GitHub 저장소 생성
```bash
cd wcon-mission-book
git init
git add .
git commit -m "Initial commit: W공동체 Connect Mission Book"
git remote add origin https://github.com/YOUR_USERNAME/wcon-mission-book.git
git push -u origin main
```

### 2-2. Vercel 배포
1. https://vercel.com 접속 → Import Project
2. GitHub 저장소 선택
3. Environment Variables 설정:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
   SUPABASE_SERVICE_ROLE_KEY = eyJ...
   NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
   ```
4. Deploy 클릭

### 2-3. Supabase Auth 리다이렉트 URL 설정
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URL: `https://your-domain.vercel.app`
3. Redirect URLs에 추가: `https://your-domain.vercel.app/api/auth/callback`

---

## 3. 로컬 개발

```bash
# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 실제 값 입력

# 개발 서버 실행
npm run dev
# http://localhost:3000

# 빌드 테스트
npm run build
```

---

## 4. 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 메인 (조 목록 + 점수) |
| `/groups/[groupId]` | 조별 미션 목록 |
| `/groups/[groupId]/missions/[missionId]` | 미션 인증 |
| `/memory-map` | 추억지도 갤러리 |
| `/login` | 관리자 로그인 |
| `/admin` | 관리자 대시보드 |
| `/admin/approvals` | 인증 승인 관리 |
| `/admin/missions` | 미션 CRUD |
| `/admin/groups` | 조 관리 |
