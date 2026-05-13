---
title: "Nx s1ngularity npm 공급망 공격"
summary: "security incident, Nx"
date: "2026-05-13"
category: "misc"
section: "misc"
miscGroup: "archive"
badge: "security incident"
badgeTone: "cert"
tags:
  - CVE-2025-10894
  - NX
  - npm
  - Git
statLabel: "security incident"
statValue: "cve"
heroEyebrow: "$ cat content/posts/Nx.md"
heroAvatar: "MISC"
---



# Nx s1ngularity npm 공급망 공격

![image.png](/images/nx.png)

# 사건 개요

- 2025년 8월 26일, JavaScript/TypeScript 생태계에서 사용되는 **Nx 빌드 시스템 관련 npm 패키지들이 악성 버전으로 배포되는 공급망 공격**이 발생
- Nx 공식 포스트모템에 따르면 공격자는 GitHub Actions injection 취약점을 악용해 Nx의 npm publishing token을 탈취했고, 이를 이용해 악성 Nx 패키지를 npm registry에 게시
- Nx 및 관련 플러그인에 악성 코드가 삽입되고, 변조된 패키지가 npm registry에 게시된 공급망 공격
- 단순히 npm 패키지 하나가 변조된 사건이 아니라, **CI/CD 권한 관리, npm 배포 토큰 관리, 개발자 환경의 secret 관리 문제**가 함께 드러난 사고라고 볼 수 있다.

---

## Nx 란?

- Nx는 JavaScript/TypeScript 프로젝트에서 사용하는 **빌드 시스템 및 모노레포 관리 도구**
- 여러 개의 애플리케이션과 라이브러리를 하나의 저장소에서 관리할 때 빌드, 테스트, 린트, 배포 자동화 등을 도와준다.
- 즉, Nx는 개발자의 로컬 환경과 CI/CD 파이프라인에서 자주 실행되는 도구이다.
- 이런 도구의 npm 패키지가 악성으로 변조되면, 개발자가 평소처럼 `npm install`을 실행하는 것만으로도 악성 코드가 실행될 수 있다.

---

# 취약점 정보

| 항목 | 내용 |
| --- | --- |
| CVE ID | **CVE-2025-10894** |
| 취약점 명칭 | Nx build system npm package 공급망 공격 |
| 공개일 | 2025년 9월 24일 |
| 영향 대상 | `nx` 및 여러 Nx 관련 npm 플러그인 |
| 취약점 유형 | Supply Chain Attack / Embedded Malicious Code |
| CWE | **CWE-506: Embedded Malicious Code** |
| CVSS v3.1 | **9.6 Critical** |
| 공격 방식 | 변조된 Nx npm 패키지를 npm registry에 게시 |
| 주요 영향 | 파일 시스템 스캔, credential 수집, GitHub repository를 통한 정보 유출 |
| 탈취 대상 | GitHub token, npm token, SSH key, `.env` 파일, 암호화폐 지갑 등 |

---

# 사고 발생 흐름

```bash
[1] 공격자가 조작된 Pull Request 생성
↓
[2] GitHub Actions workflow가 PR 제목을 처리
↓
[3] PR title 처리 과정에서 command injection 발생
↓
[4] 공격자가 GitHub Actions 권한을 악용
↓
[5] npm publishing token 탈취
↓
[6] 탈취한 token으로 악성 Nx 패키지 배포
↓
[7] 사용자가 npm install 또는 npx 실행
↓
[8] postinstall script 실행
↓
[9] GitHub token, npm token, SSH key, .env 파일 등 수집
↓
[10] 피해자 GitHub 계정에 공개 repository 생성 후 정보 업로드
```

---

# 취약점 원인 분석

## 1. GitHub Actions workflow 취약점

`pull_request_target`

- GitHub Actions workflow에서 발생한 command injection
    - PR title을 처리하는 과정에서 injection이 발생
    - 해당 취약점을 악용해 Nx의 npm publishing token을 탈취
    - 이로 인해 공격자가 GitHub Actions 환경에서 명령을 실행할 수 있었다.

### 문제 지점 : PR title validation workflow

- PR 제목은 외부 기여자도 조작할 수 있는 입력값
- 이 값이 workflow 내부에서 안전하게 처리되지 않으면, 단순 문자열이 아니라 shell command처럼 실행
- Nx 공식 보고서에서 공격자가 악성 shell command가 포함된 PR 제목을 사용했고, PR title validation workflow의 injection 취약점 때문에 해당 명령이 repository 권한으로 실행되었다고 설명함

```bash
외부 입력값인 PR title을
GitHub Actions workflow에서 안전하게 처리하지 못함
        ↓
command injection 발생
       ↓
공격자가 workflow 실행 환경에서 명령 실행
```

## 2. `pull_request_target` 사용으로 인한 권한 확대

- `pull_request_target` : **GitHub Actions에서 Pull Request가 들어왔을 때 workflow를 실행시키는 이벤트 종류**

### `pull_request`와 `pull_request_target` 차이

| 구분 | `pull_request` | `pull_request_target` |
| --- | --- | --- |
| 실행 기준 | PR을 보낸 쪽 코드 기준 | PR이 들어온 원본 repository 기준 |
| 외부 fork PR 처리 | 비교적 안전 | 위험할 수 있음 |
| 권한 | 제한적 | 원본 repository 권한을 가질 수 있음 |
| secrets 접근 | 보통 제한됨 | 설정에 따라 접근 가능 |
| 주요 용도 | 테스트, 빌드 | PR 라벨링, 제목 검사, 댓글 작성 등 |
| 위험성 | 낮은 편 | 잘못 쓰면 높음 |
- `pull_request_target`의 경우 외부 fork에서 들어온 PR이라도 **대상 repository의 권한과 컨텍스트로 workflow가 실행될 수 있다.**
- 문제가 된 workflow가 `pull_request_target`을 사용했고, 이 이벤트가 fork가 아니라 target branch의 권한으로 실행 됨
    - 공격자가 권한 있는 실행 환경에 들어올 수 있게 만든 조건 만들어줌
    - 공격자가 만든 PR의 값이, 원본 저장소 권한을 가진 workflow 안에서 처리
- 해당 구조가 PR 제목 injection과 결합되어 위험한 injection 지점을 만듦
- Nx 공식 포스트모뎀에서 PR title validation workflow의 injection 취약점과 `pull_request_target` 사용이 결합되어 공격 지점이 만들어졌다고 설명
    - `pull_request_target` 때문에 외부 입력값이 더 높은 권한을 가진 workflow 안에서 처리되었고, 그 결과 공격자가 원본 repository 권한을 가진 실행 환경에 접근할 수 있었다.

```bash
일반 PR 입력값
     ↓
pull_request_target workflow에서 처리
     ↓
base repository 권한으로 실행
     ↓
command injection 성공 시 영향 범위 확대
```

## 3. GitHub Actions 권한이 read/write로 설정 되어 있음

- workflow 권한이 과도했다는 점
- Nx repository는 GitHub Actions 권한이 read/write로 설정되어 있었다.
    - GitHub는 2023년 2월 이후 새 repository의 기본 Actions 권한을 read-only로 변경했지만,
    - 기존 repository에는 이 변경이 자동 적용되지 않았고, Nx repository는 기존 read/write 설정을 유지
- PR title 검증 workflow ⇒ 단순 검증 작업이므로 **repository write 권한이 필요 X**
- workflow token이 read/write 권한을 가지고 있었기 때문에, 공격자가 command injection에 성공한 뒤 더 강한 권한을 사용 가능 하였음
    - `read/write GITHUB_TOKEN`: workflow가 단순 조회만 하는 게 아니라 **저장소에 영향을 줄 수 있는 권한을 가진 상태**

```bash
공격자가 악성 PR 제목 작성
      ↓
PR 제목 검사 workflow 실행
      ↓
command injection 발생
      ↓
공격자가 workflow 안에서 명령 실행
      ↓
그런데 GITHUB_TOKEN이 read/write 권한을 가짐
      ↓
공격자가 저장소 수정, 다른 workflow 트리거 등 더 큰 행동 가능
```

## 4. **`publish.yml` workflow를 통한 npm token 탈취**

- npm publishing token이 탈취
- `publish.yml` : Nx 패키지를 게시하는 가장 권한이 큰 pipeline, npm token을 GitHub Secret으로 가지고 있었음
- 악성 commit을 통해 `publish.yml`의 동작을 바꾸고, 해당 workflow가 npm token을 공격자의 webhook으로 보내도록 만든 것
- CI/CD 내부의 npm publishing token을 탈취했고, 그 token으로 정상 패키지 배포 권한을 우회

```bash
PR validation workflow 취약점
   ↓
read/write GITHUB_TOKEN 확보
   ↓
publish.yml workflow 트리거
   ↓
publish.yml 내부의 NPM_TOKEN 접근
   ↓
NPM_TOKEN 외부 webhook으로 유출
   ↓
공격자가 악성 Nx 패키지 배포
```

## 5. 장기 npm publishing token 사용

- 장기 npm publishing token이 CI/CD 환경에 존재 했음
- npm publishing token은 패키지를 npm registry에 게시할 수 있는 권한을 가짐
    - token이 탈취되면 공격자는 maintainer 계정을 직접 탈취하지 않아도, 정상 패키지 이름으로 악성 버전을 배포 가능

## 6. npm `postinstall` 구조가 피해를 확대함

- npm 패키지 설치 시 lifecycle script가 자동 실행될 수 있다는 구조
- 악성 Nx 패키지는 설치 과정에서 `postinstall` script를 실행
    - `postinstall` script는 사용자의 파일 시스템을 스캔하고, 파일 경로와 credential을 수집한 뒤, 이를 사용자의 GitHub 계정 아래 `s1ngularity-repository`라는 이름이 포함된 repository로 업로드
- 사용자가 직접 `npm install nx`를 실행하지 않아도 감염될 수 있음
    - 개발 도구, extension, transitive dependency, 자동 설치 과정 등 여러 경로에서 npm install이 발생할 수 있음

---

# 상세 공격 흐름도

| 원인 | 설명 |
| --- | --- |
| GitHub Actions command injection | PR title이 안전하게 처리되지 않아 workflow에서 명령 실행 가능 |
| `pull_request_target` 사용 | 외부 PR 입력이 base repository 권한으로 실행되는 구조 |
| read/write `GITHUB_TOKEN` | 단순 PR 검증 workflow에 과도한 권한 부여 |
| `publish.yml` workflow 악용 | npm token이 있는 workflow를 트리거하고 token 유출 |
| 장기 npm publishing token 사용 | token 탈취만으로 정상 배포 체계를 우회 가능 |
| npm `postinstall` 자동 실행 | 패키지 설치만으로 악성 코드 실행 |

```bash
[1] PR title validation workflow에 취약점 존재
             ↓
[2] 해당 workflow가 pull_request_target으로 실행됨
             ↓
[3] 공격자가 악성 명령어가 포함된 PR 제목 생성
             ↓
[4] PR 제목 처리 과정에서 command injection 발생
             ↓
[5] workflow가 원본 저장소 권한으로 명령 실행
             ↓
[6] read/write 권한의 GITHUB_TOKEN 확보
             ↓
[7] 공격자가 GitHub API를 이용해 악성 branch 생성
             ↓
[8] publish.yml workflow를 악성 branch 기준으로 실행
             ↓
[9] publish.yml 내부의 NPM_TOKEN 탈취
             ↓
[10] 탈취한 NPM_TOKEN으로 악성 Nx 패키지 배포
             ↓
[11] 사용자가 npm install / npx / Nx Console 실행
             ↓
[12] 악성 postinstall script 실행
             ↓
[13] GitHub token, npm token, SSH key, .env 파일 등 수집
             ↓
[14] 피해자 GitHub 계정에 공개 repository 생성
             ↓
[15] 탈취 정보 업로드
```

# 보완이 미흡했던 부분

## 1. 외부 입력값 처리 미흡

- PR title, branch name, commit message는 모두 공격자가 조작할 수 있는 값
- 이런 값이 shell command 안에서 안전하게 처리되지 않으면 command injection이 발생
- PR title 같은 단순한 문자열도 공격 표면이 될 수 있음을 보여준다.

## 2. 최소 권한 원칙 미흡

- workflow token이 read/write 권한을 가지고 있었기 때문에, 공격자가 이를 악용할 수 있었다.
- 모든 workflow는 기본적으로 최소 권한으로 실행되어야 하며, 필요한 job에만 제한적으로 권한을 부여해야 한다.

## 3. npm token 기반 배포 구조

- 장기 npm publishing token이 CI 환경에 저장되어 있었기 때문에, token이 탈취되자 공격자는 정상 배포 파이프라인을 우회할 수 있었다.
- 장기 token 대신 OIDC 기반 Trusted Publishing 같은 방식을 사용하는 것이 더 안전

## 4. 개발자 환경의 secret 관리 문제

- 악성 패키지는 개발자 PC에 저장된 GitHub token, npm token, SSH key, `.env` 파일 등을 찾았다.
- 개발자 입장에서는 편의를 위해 여러 secret을 로컬에 저장하는 경우가 많지만, 공급망 공격에서는 이런 정보들이 바로 공격자의 목표가 됨
- 로컬 환경에 저장되는 token의 범위와 권한을 최소화해야 한다.