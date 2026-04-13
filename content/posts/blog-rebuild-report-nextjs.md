---
title: "Next.js 기반 보안 블로그 재구성 보고서"
summary: "현재 운영 중인 Next.js 블로그의 기능, 기술 스택, 라우팅 구조, 운영 규칙을 코드 기준으로 정리한 리빌드 보고서."
date: "2026-04-13"
category: "dev"
section: "dev"
badge: "DEV / REPORT"
badgeTone: "dev"
tags:
  - nextjs
  - typescript
  - markdown
  - github-pages
  - static-export
statLabel: "status"
statValue: "live"
heroEyebrow: "$ cat content/posts/blog-rebuild-report-nextjs.md"
heroAvatar: "DEV"
---

# Next.js 기반 보안 블로그 재구성 보고서

## 1. 목적

블로그는 `Next.js(App Router)` 기반으로 만들었고, 코드는 `TypeScript`로 작성했다.  
콘텐츠는 `content/posts/*.md`에 Markdown으로 작성하고, frontmatter는 `gray-matter`로 파싱했다.  
본문 렌더링은 `remark + remark-gfm + remark-html` 조합을 사용했다.

페이지 구조는 `app/` 라우트 + `components/` UI + `lib/` 데이터 처리로 분리했고,  
배포는 GitHub Actions에서 `npm ci -> npm run build` 후 `out` 폴더를 GitHub Pages에 올리는 방식으로 구성했다.

## 2. 기술 스택 (현재 기준)

- Framework: `Next.js 15.2.2` (App Router)
- Runtime: `React 19`
- Language: `TypeScript 5.8`
- Content Source: `content/posts/*.md`
- Markdown Pipeline: `gray-matter`, `remark`, `remark-gfm`, `remark-html`
- Styling: 전역 CSS (`app/globals.css`)
- Deploy: GitHub Actions (`deploy-pages.yml`) + GitHub Pages
- Build Strategy: `output: "export"` + `trailingSlash: true`

## 3. 라우팅/구조

- `app/`: 페이지 라우트
- `components/`: 레이아웃/포스트 UI 컴포넌트
- `lib/posts.ts`: Markdown 로딩, 파싱, 필터링, 카드 변환
- `lib/site-data.ts`: 네비게이션/페이지 메타 데이터
- `content/posts/`: 게시물 원본
- `.github/workflows/deploy-pages.yml`: 배포 자동화

주요 라우트:

- `/` home
- `/security`, `/security/ctf`, `/security/wargame`, `/security/bug`
- `/dev`, `/dev/projects`
- `/thesis`
- `/misc`, `/misc/archive`
- `/posts/[slug]` 개별 게시물 상세

## 4. 핵심 기능

### 4.1 Markdown 게시물 파이프라인

- 파일 시스템에서 게시물 slug 자동 수집 (`_`로 시작하는 파일 제외)
- frontmatter + 본문 분리 후 HTML로 렌더링
- 공통 메타 필드(`title`, `summary`, `date`, `category`, `section`, `tags` 등) 지원
- post card로 변환하는 공통 유틸 제공

### 4.2 정적 export 대응 동적 포스트 라우팅

- `app/posts/[slug]/page.tsx`에서 `generateStaticParams()` 사용
- `dynamicParams = false`, `dynamic = "force-static"` 적용
- GitHub Pages 정적 호스팅 환경에서 동작하도록 export 중심 구성

### 4.3 레이아웃/네비게이션

- `SiteShell` 기준 3단 구조(rail / nav panel / content)
- 페이지별 breadcrumb, top actions, nav sections 구성
- 포스트 상세 페이지는 같은 카테고리 글 자동 연결

### 4.4 실데이터 기반 사이드 패널

- `RightAside`에서 전체 글을 읽어 카테고리 수치 자동 계산
- CTF / Wargame / Bug / Dev / Thesis 게시물 수를 실시간 반영
- 하드코딩 숫자가 아닌 현재 데이터 기준으로 렌더링

## 5. 데이터 모델 규칙 (중요)

현재 코드에서 허용하는 값은 아래와 같다.

- `section`: `security | dev | thesis | misc`
- `category`: `ctf | bug | dev | project | thesis | misc`
- `ctfGroup`: `ctf | wargame`
- `miscGroup`: `records | archive`

카테고리/섹션 값이 규칙에서 벗어나면 페이지 연결이나 분류에서 문제가 생길 수 있으므로  
frontmatter 작성 시 enum 범위를 맞춰야 한다.

## 6. 배포 파이프라인

- `main` 브랜치 push 시 GitHub Actions 자동 실행
- `npm ci` → `npm run build` → `out` 업로드 → GitHub Pages 배포
- Pages source는 Actions 아티팩트 기반
- Node 20 환경에서 빌드

## 7. 운영 중 확인된 이슈/대응

- 정적 export 환경에서 동적 포스트 라우트 누락 문제  
  -> `generateStaticParams` + `force-static` 설정으로 해결
- 미지원 카테고리 입력으로 post page 프리렌더 에러 발생 가능  
  -> 카테고리 매핑 함수에 안전 폴백 추가
- 빌드 시 lint는 `next.config.mjs`에서 skip 설정(`ignoreDuringBuilds: true`)  
  -> CI 속도는 좋아지지만, 별도 lint 점검 루틴 필요

## 8. 현재 상태 요약

- Next.js 기반 블로그 구조 전환 완료
- Markdown 기반 발행/수정 플로우 안정화
- 섹션/카테고리 라우팅 운영 중
- GitHub Pages 자동 배포 동작 확인
- 운영 관점에서 남은 과제: lint/콘텐츠 검증 자동화 강화
