---
title: "Next.js 기반 보안 블로그 재구성 보고서"
summary: "블로그를 Next.js + TypeScript + Markdown 기반으로 전환 기능을 정리한 개발 보고서."
date: "2026-04-09"
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

## 1. 프로젝트 개요

기존 정적 HTML/CSS 중심 블로그를 유지보수성과 확장성을 높이기 위해 Next.js + TypeScript 구조로 전환했다.  
핵심 목표는 다음과 같았다.

- 라우팅 구조 명확화
- Markdown 기반 게시물 작성
- GitHub Pages 자동 배포
- 기존 사이버 테마 UI/UX 최대한 유지

## 2. 사용 기술 스택

- Framework: Next.js 15 (App Router)
- Language: TypeScript
- UI: React + CSS (글로벌 테마 스타일)
- Content: Markdown (`content/posts/*.md`)
- Parsing: `gray-matter`, `remark`, `remark-gfm`, `remark-html`
- Deploy: GitHub Actions + GitHub Pages
- Build Mode: `output: "export"` (정적 사이트 배포)

## 3. 디렉토리/구조

- `app/`: 페이지 라우트(App Router)
- `components/`: 공통 UI 컴포넌트
- `lib/`: 데이터/포스트 로직
- `content/posts/`: 게시물 Markdown 원본
- `.github/workflows/`: Pages 자동 배포 워크플로

주요 라우트:

- `/` home
- `/security`, `/security/ctf`, `/security/bug`
- `/dev`, `/dev/projects`
- `/thesis`
- `/misc`, `/misc/archive`
- `/posts/[slug]` 개별 게시물

## 4. 구현 기능

### 4.1 Markdown 기반 게시물 시스템

- `content/posts/*.md` 파일을 읽어 게시물 생성
- Frontmatter로 제목/요약/카테고리/태그/뱃지/통계 표시값 관리
- `_template.md` 템플릿 파일은 집계 및 목록에서 제외 처리

### 4.2 동적 라우팅 + 정적 export 대응

- 동적 게시물 라우트: `app/posts/[slug]/page.tsx`
- `generateStaticParams()`로 slug 목록 정적 생성
- `dynamicParams = false`, `dynamic = "force-static"`로 export 모드 호환

### 4.3 UI/네비게이션 개선

- 좌측 rail + 네비 패널 + 메인 + 우측 aside 구조 유지
- 테마 커서/전환 애니메이션 적용
- 홈 중앙 콘텐츠 스크롤 구조 유지
- 페이지별 top actions 및 breadcrumb 구성

### 4.4 우측 패널 실데이터 반영

- CTF/BUG/POST 통계: 실제 게시물 기준 자동 계산
- 카테고리 카드 post 개수: 실제 카테고리 개수로 자동 반영
- skills 목록 축소(운영 방향에 맞춰 정리 가능)

## 5. 배포/운영 방식

### 5.1 게시물 작성

1. `content/posts/`에 `.md` 파일 추가
2. Frontmatter 작성 (`category`, `section`, `date`, `tags` 등)
3. `git add/commit/push`
4. GitHub Actions 빌드/배포 후 사이트 반영

### 5.2 GitHub Pages 배포

- Source: GitHub Actions
- 워크플로: 빌드(`next build`) 후 `out` 아티팩트 배포
- 성공 시 `https://simjiun.github.io/`에 자동 반영

## 6. 이슈 및 해결 내역 요약

- 정적 export 시 동적 라우트 오류:
  `generateStaticParams`/`dynamic` 설정으로 해결
- CSS 미적용/깨짐 이슈:
  개발 서버 방식과 정적 서빙 방식 분리 확인
- 불필요 파일 커밋 이슈(`*.log`, `tsbuildinfo`):
  `.gitignore` 정리 및 추적 제거
- 게시물 삭제/복구 이슈:
  Git 히스토리 기반 복구 절차 정립

## 7. 현재 상태

- Next.js 기반 구조 전환 완료
- Markdown 포스트 발행 흐름 확보
- GitHub Pages 자동 배포 파이프라인 작동
- UI 테마와 네비게이션 체계 운영 가능 상태

---
