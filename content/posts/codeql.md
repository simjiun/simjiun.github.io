---
title: "CodeQL : 소스코드를 데이터베이스처럼 분석하는 정적 분석 도구"
summary: "CodeQL"
date: "2026-05-14"
category: "misc"
section: "misc"
miscGroup: "archive"
badge: "static analysis tool"
badgeTone: "cert"
tags:
  - CodeQL
statLabel: "static analysis"
statValue: "CodeQL"
heroEyebrow: "$ cat content/posts/codeql.md"
heroAvatar: "MISC"
---


# 1. CodeQL 이란?

- 정적 분석 도구로 프로그램을 실행하지 않고 소스코드 구조를 분석하여 보안 취약점, 코드 품질 문제, 유지보수 문제 찾음
- `grep`처럼 문자열을 찾는 것이 아니라, AST, 제어 흐름, 데이터 흐름 같은 프로그램 구조를 기반으로 쿼리를 실행

| 구분 | 설명 |
| --- | --- |
| 분석 방식 | 정적 분석 |
| 핵심 개념 | 코드를 데이터처럼 질의 |
| 분석 대상 | 소스코드 |
| 주요 목적 | 보안 취약점, 코드 오류, 품질 문제 탐지 |
| 결과 형태 | Code scanning alert, SARIF 등 |
| 활용 방식 | CLI, GitHub Actions, VS Code 확장 등 |
- 소스코드를 데이터베이스로 만들고, 그 데이터베이스에 쿼리를 날려 문제 패턴을 찾는 코드 분석용 언어이자 도구 체인

---

# 2. CodeQL 핵심 원리

- 동작 흐름

```bash
[1] 분석 대상 소스코드 준비
        ↓
[2] CodeQL CLI 또는 GitHub Actions 실행
        ↓
[3] 언어별 extractor가 코드 구조 추출
        ↓
[4] CodeQL Database 생성
        ↓
[5] QL Query 실행
        ↓
[6] 취약점, 버그, 코드 품질 문제 탐지
        ↓
[7] SARIF / GitHub Code Scanning Alert로 결과 확인
```

---

# 3. CodeQL Database란?

- CodeQL 쿼리를 실행하는 데 필요한 코드 정보를 담은 분석용 데이터베이스
- CodeQL 분석을 수행하기 전에는 먼저 분석 대상 소스코드를 CodeQL Database로 변환해야 함
- CodeQL은 언어별 extractor를 통해 소스  코드에서 관계형 데이터를 추출하고, 이를 기반으로 CodeQL Database를 구성
- CodeQL Database에는 소스 파일 정보, 함수, 클래스, 변수, 표현식, import, 호출 관계, 파일 위치 등 코드 분석에 필요한 정보가 포함
    
    
    | 데이터 | 의미 |
    | --- | --- |
    | 소스 파일 정보 | 어떤 파일을 분석했는지 |
    | 구문 구조 | 함수, 클래스, 변수, 표현식, import 등 |
    | 호출 관계 | 어떤 함수가 어떤 함수를 호출하는지 |
    | 제어 흐름 | 조건문, 반복문, 분기 구조 |
    | 데이터 흐름 | 값이 어디서 생성되어 어디로 전달되는지 |
    | 위치 정보 | 취약점 결과를 어느 파일 몇 번째 줄에 표시할지 |
- CodeQL 라이브러리는 이 데이터를 바탕으로 AST, 제어 흐름, 데이터 흐름, 호출 그래프 등의 관점에서 코드를 질의할 수 있도록 추상화된 API를 제공
- QL Query를 사용해 데이터베이스에 질의하는 방식으로 보안 취약점, 코드 오류, 품질 문제를 탐지

---

# 4. QL Query란?

- 취약점을 찾는 규칙은 **QL Query**로 작성
- CodeQL query는 보안, 정확성, 유지보수성, 가독성 문제를 찾기 위해 사용
- QL은 `and`, `or`, `not` 같은 논리 연결자와 `exists`, `forall` 같은 정량자, predicate 개념을 사용
- CodeQL 쿼리의 기본 구조
    
    
    | 구성 요소 | 역할 |
    | --- | --- |
    | `import` | 분석할 언어 또는 라이브러리 불러오기 |
    | `from` | 찾고 싶은 코드 요소 선언 |
    | `where` | 조건 정의 |
    | `select` | 결과로 보여줄 위치와 메시지 정의 |

## 4.1 Alert Query와 Path Query

| 유형 | 설명 | 예시 |
| --- | --- | --- |
| Alert Query | 특정 코드 위치에 문제를 표시 | 위험 함수 사용, 잘못된 API 사용 |
| Path Query | source에서 sink까지의 흐름을 경로로 표시 | SQL Injection, Command Injection, XSS |
- Alert Query :코드의 특정 위치에 문제를 표시하는 쿼리
- Path Query : source와 sink 사이의 정보 흐름을 설명하는 쿼리

## + Source, Sink, Sanitizer

| 개념 | 의미 | 예시 |
| --- | --- | --- |
| Source | 신뢰할 수 없는 데이터가 시작되는 지점 | HTTP 요청 파라미터, 쿠키, 파일 입력 |
| Sink | 위험한 동작이 수행되는 지점 | SQL 실행, OS 명령 실행, HTML 출력 |
| Sanitizer | 위험한 입력을 검증하거나 무해화하는 처리 | allowlist 검증, escape, parameterized query |

---

# 5. Data Flow Analysis

- CodeQL의 강점은 단순 패턴 검색이 아니라 **데이터 흐름 분석**
- CodeQL 데이터 흐름 분석 크게 두 가지 관점

## 5.1 Local Data Flow

- 하나의 함수 내부에서 데이터가 어떻게 흐르는지 분석
- 같은 함수에 속한 data flow node 사이의 edge만 고려하고, 함수 간 흐름이나 객체 속성을 통한 흐름은 무시함
- ex)
    
    ```graphql
    function test(req) {
      const name = req.query.name;
      console.log(name);
    }
    ```
    
    - `req.query.name`에서 `name`으로 값이 전달, 다시 `console.log(name)`으로 전달
    - 함수 내부에서 끝나는 단순 흐름

## 5.2 Global Data Flow

- 함수 간 호출, 객체 속성, 프로그램 전체 흐름까지 더 넓게 분석
- 함수 사이의 데이터 흐름과 객체 속성을 통한 흐름까지 고려하며, local data flow보다 계산 비용이 더 크기 때문에 source와 sink를 구체적으로 좁혀야 한다
- ex)
    
    ```graphql
    function getName(req) {
      return req.query.name;
    }
    
    function run(req) {
      const name = getName(req);
      db.query("SELECT * FROM users WHERE name = '" + name + "'");
    }
    ```
    
    - 사용자 입력은 `getName()` 함수에서 반환, 다른 함수인 `run()`에서 SQL 쿼리에 사용
    - 단일 함수 내부만 보면 전체 흐름이 보이지 않기 때문에 global data flow가 필요

# 6. Taint Tracking

- 신뢰할 수 없는 데이터가 프로그램 안에서 어디까지 영향을 미치는지 추적하는 분석 기법
- normal data flow와 taint tracking을 구분
    - normal data flow : 값이 각 단계에서 보존되는 흐름을 추적
    - taint tracking : 어떤 값이 다른 값에서 파생 되었는지까지 추적
    
    ```graphql
    const input = req.query.name;
    const query = "SELECT * FROM users WHERE name = '" + input + "'";
    db.query(query);
    ```
    
    - `query`는 `input`과 완전히 같은 값이 아닌, 문자열이 결합되어 새로운 값이 만들어짐
    - `query`는 사용자 입력에서 파생된 값
    - 따라서, SQL Injection 분석에서는 normal data flow보다 taint tracking이 더 적합

| 분석 방식 | 설명 | 보안 분석에서의 의미 |
| --- | --- | --- |
| Normal Data Flow | 값 자체가 어떻게 이동하는지 추적 | 변수 대입, 반환값 추적 |
| Taint Tracking | 오염된 값의 영향이 어디까지 퍼지는지 추적 | SQLi, XSS, Command Injection 분석에 적합 |

---

# 7.  실습 진행

## 7.1 CodeQL CLI 설치

- CodeQL CLI를 사용하려면 데이터베이스 생성과 분석에 필요한 tools, queries, libraries에 접근할 수 있도록 CLI를 설정해야 한다고 설명
- CodeQL bundle, bundle에는 CodeQL CLI, 호환되는 queries와 libraries, precompiled query가 포함되어 있어 호환성과 성능 면에서 유리하다고 설명

```graphql
# CodeQL bundle 다운로드
wget https://github.com/github/codeql-action/releases/latest/download/codeql-bundle-linux64.tar.zst

# 압축 해제
tar --zstd -xf codeql-bundle-linux64.tar.zst

# PATH 등록
export PATH="$PATH:$PWD/codeql"

# 설치 확인
codeql version
```

![image.png](/images/codeq/1.png)

## 7.2 CodeQL Database 생성

- `codeql database create`는 분석 가능한 CodeQL Database를 source tree로부터 생성하는 명령

```bash
codeql database create <database> --language=<language-identifier>
```

| 옵션 | 의미 |
| --- | --- |
| `<database>` | 생성할 CodeQL Database 경로 |
| `--language` | 분석할 언어 지정 |
| `--source-root` | 분석 대상 소스코드 루트 경로 |
| `--command` | 컴파일 언어에서 빌드 명령 지정 |
| `--db-cluster` | 여러 언어를 각각 DB로 생성 |
| `--build-mode` | 빌드 방식 선택 |
| `--threads` | 사용할 스레드 수 |
| `--ram` | 사용할 메모리 지정 |

## + 동적 언어와 컴파일 언어의 차이

### non-compiled language

- `database create` 실행 시 extractor가 자동으로 호출
- JavaScript/TypeScript, Python, Ruby 분석에서는 일반적으로 `--command` 옵션을 지정하지 않아야 하며, 잘못 지정하면 빈 데이터베이스가 만들어질 수 있음

### compiled language

- C/C++, C#, Go, Java/Kotlin, Swift 같은 컴파일 언어는 빌드 과정이 중요
- 컴파일 언어에서는 `--command`로 빌드 명령을 지정할 수 있으며, 지정하지 않으면 언어팩의 휴리스틱에 따라 자동 빌드를 시도 함

| 언어 유형 | 예시 | DB 생성 방식 |
| --- | --- | --- |
| 비컴파일 언어 | JavaScript, Python, Ruby | 보통 `--command` 불필요 |
| 컴파일 언어 | C/C++, Java, C#, Go, Swift | 빌드 명령 또는 autobuild 필요 |
| 복합 언어 프로젝트 | Python + C++ 등 | `--db-cluster` 사용 가능 |
- `--build-mode` ⇒ `none`, `autobuild`, `manual`
    - `none` ⇒ 빌드 없이 DB를 생성하는 방식
    - `autobuild` ⇒ 자동 빌드를 시도
    - `manual` ⇒ 사용자가 지정한 빌드 명령으로 DB를 생성하는 방식

## 7.3 Query suite

- CodeQL 쿼리 묶음, 여러 `.ql` 쿼리를 목적별로 묶어둔 파일
- CodeQL에서 취약점을 찾는 규칙 하나하나는 `.ql` 파일
- 자주 쓰는 Query suite
    
    
    | Query suite | 의미 | 예시(Java Script) |
    | --- | --- | --- |
    | `default` / `code-scanning` | GitHub Code Scanning에서 기본으로 쓰는 고정밀 쿼리 묶음 | `javascript-code-scanning.qls` |
    | `security-extended` | 기본보다 더 넓은 보안 쿼리 포함 | `javascript-security-extended.qls` |
    | `security-and-quality` | 보안 문제 + 코드 품질 문제까지 포함 | `javascript-security-and-quality.qls` |

## 7.4 실습 진행 : JavaScript/TypeScrip

### 실습용 취약 코드 생성

```jsx
// app.js , made by GPT
const express = require("express");
const { exec } = require("child_process");

const app = express();

app.get("/ping", (req, res) => {
  const host = req.query.host;
  exec("ping -c 1 " + host, (err, stdout, stderr) => {
    if (err) {
      res.send(stderr);
      return;
    }
    res.send(stdout);
  });
});

app.get("/eval", (req, res) => {
  const code = req.query.code;
  const result = eval(code);
  res.send(String(result));
});

app.listen(3000);
```

### 실습 코드로 DB 생성

- CodeQL Database는 특정 시점의 소스코드를 분석한 결과
- 코드를 새로 만들거나 수정했다면 DB도 다시 만들어야 함

```jsx
codeql database create codeql_database \
  --language=javascript-typescript \
  --source-root . \
  --build-mode=none \
  --overwrite
```

![image.png](/images/codeq/2.png)

### 분석 실행

- `security-extended` 쿼리 슈트 사용

```jsx
codeql database analyze codeql-js-db \
  codeql/javascript-queries:codeql-suites/javascript-security-and-quality.qls \
  --format=sarif-latest \
  --output=results.sarif \
  --threads=0
```

![image.png](/images/codeq/3.png)

---

## + SARIF 결과란?

- CodeQL CLI 분석 결과는 SARIF로 저장할 수 있습니다.
- 공식 문서에 따르면 `database analyze`의 `--format` 옵션은 필수
- `sarif-latest`는 Static Analysis Results Interchange Format의 최신 지원 버전을 사용하는 JSON 기반 형식입니다.
- 결과 파일 안에 대략 다음 정보가 들어감.

| 항목 | 의미 |
| --- | --- |
| ruleId | 탐지된 규칙 ID |
| message | 취약점 또는 문제 설명 |
| location | 파일명, 라인, 컬럼 |
| severity | 심각도 |
| path | source에서 sink까지의 경로 정보 |

### + 결과에서 확인해야 할 요소

- `ruleId` : CodeQL이 어떤 규칙으로 문제를 찾았는지 보여 줌
- `severity` : 심각도
- `message` : CodeQL이 문제를 어떻게 설명하는지 확인
- `location` : 취약점이 표시된 파일과 줄 번호
- `source-sink path` : `path-problem` 유형의 쿼리는 단순히 “여기 위험함”이 아니라, 데이터가 어디서 시작해서 어디로 갔는지 경로

---

### 결과 확인

![image.png](/images/codeq/4.png)

- 결과 개수 확인
    
    ```jsx
     jq '.runs[0].results | length' results.sarif
    ```
    
    ![image.png](/images/codeq/4.png)
    
- ruleId 확인
    
    ```jsx
    jq '.runs[0].results[].ruleId' results.sarif=
    ```
    
    ![image.png](/images/codeq/7.png)
    
    - 총 alert 개수: 3개
- `results.sarif`에서 각 탐지 결과의 핵심 정보 확인

```bash
jq '.runs[0].results[] | {
  ruleId: .ruleId,
  message: .message.text,
  locations: .locations,
  codeFlows: .codeFlows
}' results.sarif
```

![image.png](/images/codeq/6.png)

- 결과 해석 : `js/code-injection`
    
    ```bash
     "ruleId": "js/code-injection",
      "message": "This code execution depends on a [user-provided value](1).",
    ```
    
    - 사용자 입력값이 코드 실행 지점에 영향을 준다
    
    ```bash
    "startLine": 19,
    "startColumn": 23,
    "endColumn": 27
    ```
    
    - `app.js` 19번째 줄의 23~27번째 컬럼이 문제 위치
    
    ```bash
     1단계              "uri": "app.js",
                        "uriBaseId": "%SRCROOT%",
                        "index": 0
                      },
                      "region": {
                        "startLine": 18,
                        "startColumn": 16,
                        "endColumn": 30
                      }
                    },
                    "message": {
                      "text": "req.query.code"
    ----------------------------------------------------------------                 
     2단계              "uri": "app.js",
                        "uriBaseId": "%SRCROOT%",
                        "index": 0
                      },
                      "region": {
                        "startLine": 18,
                        "startColumn": 9,
                        "endColumn": 13
                      }
                    },
                    "message": {
                      "text": "code"
    ---------------------------------------------------------------------
     3단계              "uri": "app.js",
                        "uriBaseId": "%SRCROOT%",
                        "index": 0
                      },
                      "region": {
                        "startLine": 19,
                        "startColumn": 23,
                        "endColumn": 27
                      }
                    },
                    "message": {
                      "text": "code"
    ```
    
    - codeFlows 분석 :  [Source] `req.query.code` → [Variable] `code` → [Sink] `eval`(`code`)
        
        ```bash
        	실제 코드 형태 해석
        const code = req.query.code;
        const result = eval(code);
        ```
        
    - 입력 req.query.code가 code 변수에 저장된 뒤 eval(code)의 인자로 전달되고 있음
    - eval()은 문자열을 JavaScript 코드로 실행하는 함수이므로, 외부 입력이 검증 없이 전달될 경우 공격자가 의도한 코드가 서버에서 실행 가능
    - Source인 req.query.code에서 Sink인 eval()까지 오염된 데이터가 도달한 사례

---

# CodeQL의 장점

## 1. 코드 구조 기반 분석

- CodeQL은 단순 문자열 매칭이 아니라 코드의 구조와 의미를 분석
- 따라서 `eval`이라는 문자열만 찾는 것보다 더 정교하게 “어떤 값이 어떤 API로 전달되는가”를 분석할 수 있음

## 2. 데이터 흐름 추적 가능

- CodeQL은 source에서 sink까지 데이터가 어떻게 이동하는지 분석할 수 있음
- SQL Injection, Command Injection, XSS, Path Traversal 같은 취약점을 탐지하는 데 적합합니다.

## 3. 커스텀 쿼리 작성 가능

- CodeQL은 기본 제공 쿼리뿐 아니라  custom query도 작성 가능

## 4. CI/CD 연동 가능

- CodeQL은 GitHub Actions, 외부 CI, CLI 방식으로 사용 가능
- CodeQL CLI는 외부 CI에서 분석을 실행하고 결과를 GitHub에 업로드하는 방식으로도 사용 가능

---

# CodeQL의 한계

## 1. 정적 분석이므로 런타임 상태를 완벽히 알 수 없음

- 정적 분석 도구이므로, 데이터 흐름 분석의 어려움으로 “일부 동작은 런타임이 되어야 결정된다”
- 실제 실행 환경, 설정 파일, 외부 서비스 응답, 런타임 조건에 따라 결과가 달라질 수 있음

## 2. 오탐과 미탐 가능성

- 데이터 흐름 분석은 매우 복잡
- 정확하고 완전한 data flow graph를 계산하는 데 여러 어려움이 존재
- 표준 라이브러리 함수처럼 소스코드가 없는 부분의 데이터 흐름은 계산하기 어렵고, aliasing 문제나 큰 그래프 크기 때문에 성능 문제가 생길 수 있음
- **따라서, CodeQL 결과는 “취약점 확정”이라기보다 “검토해야 할 보안 의심 지점”으로 봐야 함**

## 3. 프레임워크 모델링 한계

- 지원되지 않는 라이브러리나 프레임워크에 대해서는 data source와 sink를 추가하는 방식으로 분석을 확장할 수 있다고 설명합니다.
- ⇒ CodeQL이 모든 프레임워크의 source/sink를 처음부터 완벽히 알고 있는 것은 아니라는 뜻
    - 자체 개발 프레임워크나 niche framework를 사용하는 경우 커스텀 모델링이 필요할 수 있습니다.