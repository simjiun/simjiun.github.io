---
title: "React Server Components, RSC"
summary: "security incident, React"
date: "2026-05-13"
category: "misc"
section: "misc"
miscGroup: "archive"
badge: "security incident"
badgeTone: "cert"
tags:
  - CVE-2025-55182
  - web
  - React
statLabel: "security incident"
statValue: "cve"
heroEyebrow: "$ cat content/posts/React2Shell.md"
heroAvatar: "MISC"
---



# 사건 개요

- React의 **React Server Components, RSC**에서 발생한 치명적인 **원격 코드 실행 취약점**
- AWS는 2025년 12월 3일 공개 후 수 시간 내에 중국 연계 위협 그룹의 악용 시도를 관측했다고 밝혔고,
- Google Threat Intelligence Group은 여러 국가·산업군에서 다양한 payload와 침해 후 행위가 관찰되었다고 분석

![image.png](attachment:9ed9ff2f-8860-4a26-8c6f-313d5d46267c:image.png)

# 라이브러리 배경

## React란?

- 사용자 인터페이스를 만들기 위한 JavaScript 라이브러리
- React는 주로 브라우저에서 컴포넌트를 렌더링하는 구조였지만, 최신 React는 서버에서 컴포넌트를 처리하는 **React Server Components** 기능이 도입

## React Server Components, RSC

- 컴포넌트 일부를 서버에서 실행하고, 그 결과를 클라이언트에 전달하는 구조
- 데이터베이스 접근, 파일 시스템 접근, 서버 전용 API 호출 등 클라이언트에 노출하면 안 되는 로직을 서버 측에서 처리할 수 있게 해줌
- 즉, RSC는 단순 UI 렌더링 기능을 넘어 **서버 실행 환경과 직접 연결되는 React 기능**

# 취약점 정보

| 항목 | 내용 |
| --- | --- |
| 취약점 명칭 | React2Shell |
| CVE 번호 | CVE-2025-55182 |
| 영향 대상 | React Server Components |
| 취약점 유형 | Pre-authentication Remote Code Execution |
| 위험도 | Critical |
| CVSS | 10.0 |
| 주요 원인 | Server Function endpoint로 전달된 HTTP 요청 payload의 unsafe deserialization |
| 주요 영향 | 인증 없는 원격 코드 실행 |
| 실제 악용 여부 | 공개 직후 실제 악용 활동 관측 |
- 취약한 특정 RSC 패키지 버전 (19.0, 19.1.0, 19.1.1, 19.2.0 버전)
    - react-server-dom-webpack
    - react-server-dom-parcel
    - react-server-dom-turbopack

# 취약점 발생 원리

- 핵심 원인은 **Server Function endpoint로 전달된 HTTP 요청 payload를 React가 처리하는 과정에서 안전하지 않은 역직렬화가 발생한 것**
    - **Server Function endpoint :** 클라이언트가 서버 측 함수나 서버 액션을 호출할 때 요청이 도착하는 서버 측 진입점
- 즉, 클라이언트가 서버로 보낸 RSC/Flight 데이터가 서버에서 다시 객체로 복원되는 과정에서, 공격자가 조작한 데이터까지 정상 객체처럼 처리되어 서버 코드 실행으로 이어질 수 있음
- NVD에선, 공격자가 조작한 HTTP 요청 payload가 서버로 전달되었을 때, React Server Components 처리 로직이 이를 안전하게 검증하지 못하고 해석하면서 서버 측 코드 실행으로 이어질 수 있었다. 라고 설명

## React Server Components와 Server Function 처리 구조

- RSC는 클라이언트와 서버 사이의 통신에 **Flight protocol** 사용
    - **`Flight protocol`**: React 전용 직렬화/전송 형식으로, 단순히 HTML 문자열을 보내는 것이 아니라, **React가 클라이언트에서 다시 조립할 수 있는 중간 데이터(컴포넌트 트리 정보 등)**를 보내는 역할
- 클라이언트가 RSC 데이터를 요청하면 서버가 payload를 수신하고 파싱한 뒤 서버 측 로직을 실행하고 Flight protocol 형식으로 직렬화하여 클라이언트에 반환

### 정상적인 RSC 처리 흐름

```bash
클라이언트 요청
   ↓
RSC / Server Function endpoint
   ↓
서버가 payload 수신 및 파싱
   ↓
Server Component / Server Function 실행
   ↓
컴포넌트 트리 결과 생성
   ↓
Flight protocol 형식으로 직렬화
   ↓
클라이언트로 응답 반환
   ↓
클라이언트 React가 해석 후 화면 구성
```

### React2Shell 공격 상황에서의 RSC 처리 흐름

```bash
공격자가 조작된 요청 전송
   ↓
RSC / Server Function endpoint
   ↓
서버가 조작된 payload를 수신 및 파싱
   ↓
fake chunk가 정상 chunk처럼 처리됨
   ↓
payload 역직렬화 과정에서 검증 부족 발생
   ↓
__proto__ / constructor 경로 접근
   ↓
Prototype Pollution 및 Function 생성자 접근
   ↓
서버 측 코드 실행 발생
```

---

# 패킷 분석

[]()

- 서버는 요청 본문 안의 데이터를 React Flight의 **chunk**로 해석
- Chunk 객체는 `status`, `value`, `reason`, `_respons` 속성을 가짐

| 항목 | 의미 |
| --- | --- |
| `status: "resolved_model"` | 서버가 이 chunk를 처리 가능한 모델 chunk처럼 오인하게 함 |
| `then: "$1:__proto__:then"` | `Chunk.prototype.then`에 접근해 fake chunk를 thenable처럼 만듦 |
| `value: {"then":"$B1337"}` | 이후 Blob 참조 파싱 흐름으로 진입하게 함 |
| `_response._prefix` | 공격자가 제어하는 코드 문자열이 들어가는 위치 |
| `_response._chunks: "$Q2"` | Chunk 2를 Map 참조처럼 사용 |
| `_response._formData.get: "$1:constructor:constructor"` | Function 생성자 접근을 유도 |

# 1 name="2": Chunk 2, Map placeholder

- `_response._chunks: "$Q2"`
    - `$Q`는 Flight Protocol에서 **Map 참조**를 의미
- Chunk 2는 직접 공격을 실행하는 핵심 payload라기보다, `_response._chunks`가 React 내부에서 정상 Map 구조처럼 처리되도록 돕는 **placeholder** 역할
    - 실제 공격 코드를 실행하는 핵심 값은 아니지만, React Flight payload의 참조 구조가 정상적으로 보이도록 자리를 채우는 보조 값을 의미
- Chunk 2는 `$Q2` Map 참조의 대상이 되며, 빈 배열 형태로 사용되어 `_response._chunks` 구조가 내부적으로 유효한 Map 참조처럼 처리되도록 도움,즉 공격 payload 전체 구조를 유지하는 보조 역할

# 2. name="1": Chunk 1, 순환 참조 역할

- `"$@0"`
- **Chunk 0을 Promise/Chunk 형태로 다시 참조한다**는 것
- Chunk 0으로 되돌아가는 경로 탐색 기반

# 3. name="0": Chunk 0, Fake Chunk

## 3.1 `status: "resolved_model"`

- 공격자는 `status: resolved_model`과 같은 값을 가진 **fake chunk**를 넣음
    - `resolved_model` : 서버 입장에서 “이 chunk는 모델 데이터가 준비되었으니 파싱해서 사용할 수 있다”는 의미로 처리
- 서버는 이 fake chunk를 정상 chunk처럼 오인하고, `initializeModelChunk`를 호출
    - `initializeModelChunk`: React Flight 내부에서 **`resolved_model` 상태의 chunk를 실제 모델 데이터로 초기화하는 함수**
    - 즉 해당 함수 호출 시 chunk 안의 데이터를 열어서 파싱하고 React 내부 객체로 복원하기 시작 함

## 3.2 Prototype Pollution

- **Prototype Pollution** : 사용자가 제어하는 입력값을 통해 객체의 프로토타입을 오염 시키는 공격 기법
- Flight Protocol은 콜론 `:`으로 구분된 경로를 사용해서 중첩 객체의 속성에 접근 가능
    
    ```bash
    ex) 
    <정상적인 예시>
    $1:name
    → chunk 1의 name 속성
    $1:user:role
    → chunk 1의 user.role 속성
    ```
    
- 경로 검증이 충분하지 않아, 공격자가 프로토타입 체인을 따라가며 위험한 속성에 접근할 수 있음
    - 프로토타입 체인: 객체가 자기 자신에게 없는 속성을 prototype에서 계속 찾는 구조
- 공격자는 두 가지 속성 참조 경로를 조작

### 속성 경로 조작 1 : `then` 조작 (`then: "$1:__proto__:then"`)

- `then` : **Chunk를 비동기 데이터처럼 다루기 위한 메서드**
- React Flight의 Chunk 객체는 Promise처럼 동작할 수 있고, `then()` 메서드를 가질 수 있음
- JavaScript에서는 객체가 `then()` 메서드를 가지고 있으면 실제 Promise가 아니더라도 Promise처럼 처리될 수 있는데, 이를 `thenable` 객체 라고 함

⇒  **공격자는 이 특성을 이용해 fake chunk가 단순 JSON 객체가 아니라 `thenable` 객체처럼 처리되도 록 유도**

- `then`  속성 → Prototype Pollution 통해  `Chunk.prototype.then`을 참조하도록 조작
(“then”:”$1:__proto__:then")
    - `Chunk.prototype.then` : React Flight 내부에서 `Chunk` 객체가 Promise처럼 처리될 때 실행되는 내부 메서드
    - 서버는 fake chunk를 React Flight의 정상 chunk 처리 흐름에 포함시키게 됨

왜 하느냐? ⇒ ” `initializeModelChunk(fake chunk)`를 호출시키기 위해”

```bash
Prototype Pollution/경로 조작 통해 then속성이 Chunk.prototype.then을 참조하도록 조작
< then:$1:__proto__:then > 

$1: chunk 1 참조
   ↓
chunk 1($@0): Chunk 0, 즉 fake chunk를 다시 참조
   ↓
__proto__ → Chunk 0(fake chunk)의 prototype으로 이동       
   ↓
then → 해당 prototype에 존재하는 then 메서드 접근

<결과>
fake chunk의 then 속성은 Chunk.prototype.then을 참조

----------------------------------------------------------------------------------------
<이후 흐름> 
fake chunk가 thenable 객체처럼 처리됨
   ↓
서버가 fake chunk.then() 호출
   ↓
Chunk.prototype.then 실행
   ↓
status: resolved_model 확인
   ↓
initializeModelChunk(fake chunk) 호출
```

### 속성 경로 조작 2 : `constructor` 조작(`_response._formData.get: "$1:constructor:constructor"`)

- `_response` : chunk가 다른 chunk나 FormData를 찾아갈 수 있게 해주는 전체 문맥 객체
- `constructor` 경로를 이용해 JavaScript의 **Function 생성자**에 접근하는 것
- JavaScript에서 `Function` 생성자는 문자열을 함수 객체로 만들 수 있기 때문에 위험

```bash
Prototype Pollution/경로 조작 통해 Function 생성자 접근
< _response._formData.get: "$1:constructor:constructor"r >

$1: Chunk 1 참조
   ↓
Chunk 1: Chunk 0(fake chunk)을 다시 참조
   ↓
constructor: fake chunk 객체의 생성자 접근
   ↓
constructor: 생성자의 생성자 접근

<결과>
→ Function 생성자 획득
       
-------------------------------
_response._formData.get이 Function 생성자처럼 동작하도록 조작
   ↓
서버가 정상 FormData.get 호출이라고 생각하고 호출
   ↓
실제로는 Function(공격자 문자열)이 수행됨
   ↓
공격자 문자열이 함수 객체로 생성됨
   ↓
Promise/then 처리 과정에서 함수가 호출됨
   ↓
서버 측 코드 실행
```

- 단순 속성 접근이 아니라, 이후 공격자가 제어하는 문자열이 **실행 가능한 함수 형태로 바뀔 수 있는 기반 생성**

## 3.3 `value: {"then":"$B1337"}`

- `value`는 `initializeModelChunk`가 실행된 이후 파싱되는 내부 모델 데이터
- `$B`는 React Flight Protocol에서 **Blob 참조**를 의미
    - 즉, `$B1337`은 Blob 참조 처리 로직으로 진입하게 만드는 값이
    - Blob :  JavaScript에서 이미지, 파일, 바이너리 데이터, 텍스트 조각 같은 **덩어리 데이터**를 표현하는 객체
- 정상적인 경우라면 Blob 참조를 처리하면서 FormData에서 해당 값을 가져와야 함
    
    ```bash
    $B1337
    ↓
    Blob 참조로 해석
    ↓
    response._formData.get(...) 호출
    ```
    
- 속성 경로 조작 통해 `_formData.get`이 Function 생성자처럼 동작하도록 조작 됨
- `$B1337`은 단순 Blob 참조가 아니라, 조작된 `_formData.get` 호출을 유도하는 **트리거**가 됨

```bash
value 내부의 "$B1337" 파싱
   ↓
Blob 참조 처리 로직 진입
   ↓
_response._formData.get 호출
   ↓
조작된 Function 생성자 호출 흐름으로 연결
```

## 3.4 `_response._prefix`

```bash
_response._prefix: "[공격자 제어 문자열]”
```

- `_prefix`: 공격자가 제어하는 문자열이 들어가는 위치
- 서버에서 실행될 수 있는 JavaScript 코드 문자열
- **정상적인 처리에서**
    - `_prefix`가 FormData 참조 키를 구성하는 데 사용될 수 있다.
- **공격 흐름에서**
    - `_formData.get`이 Function 생성자처럼 바뀌기 때문에, `_prefix`는 Function 생성자에 전달될 문자열의 일부로 사용될 수 있다.

```bash
정상 흐름:
_response._formData.get(_response._prefix + 참조값)
→ FormData 값 조회

공격 흐름:
_response._formData.get = Function 생성자
   ↓
Function(_response._prefix + 참조값)
   ↓
공격자 제어 문자열이 함수 객체로 생성
```

# 상세 공격 흐름

```bash
 multipart/form-data 요청 수신
         ↓
요청 body를 Flight payload로 해석
         ↓
 name="0"을 Chunk 0으로 로드
         ↓
 Chunk 0의 then 속성 참조 해석
         ↓
 "$1:**proto**:then"으로 Chunk.prototype.then 획득
         ↓
 fake chunk가 thenable 객체처럼 처리됨
         ↓
 Chunk.prototype.then 실행
         ↓
 status = resolved_model 확인
         ↓
 initializeModelChunk(fake chunk) 호출
         ↓
 value 내부의 "$B1337" 파싱
         ↓
 "$1:constructor:constructor"로 Function 생성자 접근
         ↓
 _response._formData.get이 Function 생성자처럼 동작
         ↓
_formData.get 호출 과정에서 공격자 제어 문자열이 함수 객체로 생성
         ↓
 Promise / then 처리 흐름에서 함수 실행
         ↓
 서버 측 코드 실행 발생
```

## 1.

```bash
[1] multipart/form-data 요청 수신
   ↓
[2] 요청 body를 Flight payload로 해석
   ↓
[3] name="0"을 Chunk 0으로 로드
```

- 공격 요청은 `multipart/form-data` 형식으로 구성
- 요청 본문 안에는 `name="0"`, `name="1"`, `name="2"` 필드가 포함
- 이 필드들은 각각 React Flight Protocol의 **Chunk 0, Chunk 1, Chunk 2**처럼 처리
    - `name="0"` = fake chunk
    - `name="1"` = `$@0`
    - `name="2"` = 빈 배열

## 2.

```bash
[4] Chunk 0의 then 속성 참조 해석
   ↓
[5] "$1:__proto__:then"으로 Chunk.prototype.then 획득
   ↓
[6] fake chunk가 thenable 객체처럼 처리됨
```

- fake chunk의 `then` 속성이 해석
    - `then` 값에 `"$1:__proto__:then"` 형태의 참조를 넣어 `then` 속성이 `Chunk.prototype.then`을 참조하게함
- 공격자는 fake chunk를 thenable 객체처럼 만들어 React 내부 chunk 처리 흐름에 진입시킴

## 3.

```bash
[7] Chunk.prototype.then 실행
   ↓
[8] status = resolved_model 확인
   ↓
[9] initializeModelChunk(fake chunk) 호출
```

- fake chunk가 thenable 객체처럼 처리되면 서버는 fake chunk의 `then()`을 호출
    - `Chunk.prototype.then` 실행
- `Chunk.prototype.then`은 chunk의 상태를 확인하고, 상태가 `resolved_model`이면 `initializeModelChunk`를 호출

## 4.

```bash
[10] value 내부의 "$B1337" 파싱
   ↓
[11] "$1:constructor:constructor"로 Function 생성자 접근
   ↓
[12] _response._formData.get이 Function 생성자처럼 동작
```

- Chunk 0의 `value` 내부에는 `"$B1337"` 형태의 Blob 참조가 포함되어 있다
    - 서버는 `$B1337`을 해석하는 과정에서 `_response._formData.get()`을 호출
- `"$1:constructor:constructor"` 경로를 이용해 JavaScript의 `Function` 생성자에 접근하도록 만듦

## 5.

```bash
[13] _formData.get 호출 과정에서 공격자 제어 문자열이 함수 객체로 생성
   ↓
[14] Promise / then 처리 흐름에서 함수 실행
   ↓
[15] 서버 측 코드 실행 발생
```

- `$B1337`을 처리하는 과정에서 `_formData.get()`이 호출
- 공격 흐름에서는 이 함수가 이미 `Function` 생성자처럼 동작하도록 조작되어 있기 때문에 `_response._prefix`에 들어 있던 공격자 제어 문자열이 함수 객체로 만들어짐
- 마지막으로 JavaScript의 Promise 처리 과정에서 해당 함수가 `then()`으로 호출되면, 공격자가 주입한 코드가 서버 환경에서 실행
# 6. 대응한 방법(공개 대응 기준 정리)

React2Shell 계열 취약점은 "입력 검증 실패 + 역직렬화 경로 악용"이 결합된 형태이므로, 대응은 패치 적용만으로 끝내지 않고 애플리케이션·인프라·운영 절차를 함께 보완해야 한다.

## 6.1 프레임워크 및 코드 레벨 대응

- 취약 버전의 React Server Components 관련 패키지를 즉시 최신 보안 패치 버전으로 업그레이드한다.
- Server Function endpoint에서 수신하는 payload에 대해 allowlist 기반 스키마 검증을 강제한다.
- 역직렬화 이전 단계에서 참조 무결성, 깊이 제한, 순환 참조 여부를 검사한다.
- `constructor`/`prototype` 체인과 같이 객체 구조를 오염시킬 수 있는 입력 패턴을 차단한다.
- 역직렬화 결과를 곧바로 실행 경로에 연결하지 않고, 중간 검증 계층을 거쳐 안전 객체로 재구성한다.

## 6.2 인프라 및 탐지 대응

- 외부 노출된 RSC/Server Function 경로를 자산 목록에 명시하고 접근 정책을 분리 관리한다.
- WAF/IDS에 비정상 `multipart/form-data`, 비정형 chunk, 과도한 중첩 참조 패턴 탐지 룰을 추가한다.
- 사고 의심 기간에는 요청 본문 해시, 파서 오류 코드, 서버 예외 스택을 기준으로 사후 포렌식을 수행한다.
- 운영 환경에서 해당 경로에 대해 속도 제한(rate limit)과 비정상 요청 차단 임계치를 강화한다.

## 6.3 사고 대응 프로세스

- 공지 직후 1차 조치: 노출 경로 임시 차단, 취약 버전 식별, 패치 배포 계획 수립.
- 2차 조치: 로그 기반 침해 흔적 조사, 의심 세션 무효화, 자격 증명/토큰 순환.
- 3차 조치: 재발 방지 정책 반영(배포 게이트, 보안 테스트 항목 추가, 모니터링 룰 상시화).

# 7. 보완이 미흡했던 부분

## 7.1 위협 모델링 미흡

- RSC를 단순 렌더링 기능으로 간주해 "서버 실행 경로로 이어지는 고위험 입력면"이라는 인식이 약했다.
- 클라이언트 입력을 신뢰하는 전제가 남아 있어 악성 구조 입력에 대한 기본 거부 전략이 부족했다.

## 7.2 구현 및 검증 미흡

- 역직렬화 이전의 형식 검증이 충분히 엄격하지 않아 조작된 객체 그래프가 처리 파이프라인에 진입할 수 있었다.
- 객체 참조 해석 과정의 경계 조건(순환, 비정상 참조, 타입 불일치)에 대한 방어가 약했다.
- 보안 테스트가 정상 요청 중심으로 구성되어 "비정상 Flight payload" 시나리오 커버리지가 부족했다.

## 7.3 운영 미흡

- 프레임워크 취약점을 애플리케이션 취약점보다 낮은 우선순위로 처리해 패치 SLA가 지연되기 쉬웠다.
- RSC 전용 엔드포인트를 별도 모니터링하지 않아 초기 이상 징후 탐지가 늦어질 수 있었다.
- 탐지 체계가 REST/JSON 중심이라 Flight 계열 프로토콜 이상 행위에 대한 시그니처가 부족했다.




