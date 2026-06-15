# 영업 파이프라인 대시보드

영업 리드 진행현황 관리 시스템 — Frontend: Vercel(Next.js) / Backend: Supabase

## 설치 및 실행

### 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com) 에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
3. Settings → API에서 `Project URL`과 `anon public key` 복사

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일에 Supabase 정보 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3. 의존성 설치 및 개발 서버 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인

## Vercel 배포

1. [Vercel](https://vercel.com) 에 GitHub 레포 연결
2. Environment Variables에 `.env.local` 내용 추가
3. Deploy

## 기능

- **리드 등록**: 고객사 / 아이템 / 기존 포장재 구성
- **8단계 파이프라인**: 포장개발 → 공장 → 영업 → 마케팅 → 디자인 → 구매 → 경영진 승인 → 외부고객 협의
- **소항목 관리**: + 버튼으로 추가, 각 항목 세부사항 입력
- **신호등 상태**: 
  - 🟢 초록: 모든 소항목 완료
  - 🔴 빨강: 하나라도 이슈 발생
  - ⚫ 회색: 미시작 항목 존재
- **진행률 표시**: 완료 단계 / 전체 단계 비율
