---
title: "XSSky: Detecting XSS Vulnerabilities through Local Path-Persistent Fuzzing"
summary: "XSSky: Detecting XSS Vulnerabilities through Local Path-Persistent Fuzzing 논문 리뷰"
date: "2026-05-08"
category: "thesis"
section: "thesis"
miscGroup: "records"
badge: "thesis"
badgeTone: "cert"
tags:
  - USENIX
  - XSS
  - Thesis
  - review
statLabel: "thesis"
statValue: "USENIX"
heroEyebrow: "$ cat content/posts/XSSky.md"
heroAvatar: "thesis"
---

# XSSky: Detecting XSS Vulnerabilities through Local Path-Persistent Fuzzing


**학회:** USENIX Security Symposium 2025

**주제:** PHP 웹 애플리케이션의 XSS 취약점 탐지

**핵심 키워드:** XSS, Static Analysis, Dynamic Analysis, Fuzzing, Sanitizer, PUT, PHP Interpreter Feedback

---

# Introduction

---

## 연구 배경

- PHP 웹 애플리케이션은 여전히 널리 사용되고 있으며, XSS는 PHP 웹 애플리케이션에서 매우 빈번하게 발생하는 보안 취약점
- XSS 취약점은 공격자가 악성 JavaScript를 웹 페이지에 삽입해 사용자의 세션 탈취, 민감정보 유출, 악성 사이트 리다이렉션 등을 유발할 수 있음
- 기존 XSS 탐지 기법들의 스크립트 필터 처리 및 코드 탐색 능력 부족으로 인한 한계를 가짐

## 기존 방식의 한계

### 동적 분석

- 불충분한 코드 커버리지 때문에 false negative, 즉 미탐에 자주 제한

### 정적 분석

- sanitizer가 포함된 source-sink path를 분석할 때 오탐과 미탐이 발생하기 쉬움

## 제안하는 해결법

- **path-guided fuzzing 기법**을 PHP 웹 애플리케이션에 적용
- 정적 분석으로 찾은 XSS 의심 경로를 로컬에서 실행 가능한 코드 조각인 PUT로 변환하고, 그 경로만 대상으로 fuzzing을 수행해 실제 XSS PoC를 생성

---

# State of the Art

---

| 기존 접근 | 특징  | 한계 |
| --- | --- | --- |
| **ReScan [24]** | 실제 웹 애플리케이션을 실행하며 취약점을 탐지하는 **동적 분석 기반 웹 스캐닝 기법** | 대형 PHP 애플리케이션에서는 코드 라인의 50% 미만만 커버하여, 크롤러가 도달하지 못한 sink를 놓칠 수 있음 |
| Efficient and Flexible Discovery [20] | PHP 코드를 **CPG(Code Property Graph)** 로 변환하고, 그래프 탐색을 통해 source-sink 흐름을 분석하는 정적 분석 기법 | sanitizer의 실제 우회 여부를 검증하지 못하며, 실제 XSS PoC 생성이 어려움 |
| TChecker [41] | PHP 애플리케이션 대상 **SOTA 정적 taint 분석 도구**로, source-sink path를 정밀하게 추적 | custom sanitizer 미인식, typecast 분석 한계, sanitizer evasion으로 인한 오탐·미탐 발생 |
| NAVEX [18] | SMT/string solver를 활용해 웹 애플리케이션의 취약 경로에 대한 exploit 생성을 시도하는 기법 | 복잡한 문자열 처리, 정규식, 비즈니스 로직이 포함되면 solver 실패나 메모리 폭발 문제가 발생할 수 있음 |

## 결론

### 동적 분석

- 모든 페이지·기능·조건부 경로를 탐색하기 어려워 코드 커버리지 부족에 따른 미탐이 발생할 수 있음

### 정적 분석

- sanitizer의 존재만으로 경로를 안전하다고 판단하는 경우가 있어, 실제 취약점을 놓치는 false negative가 발생
- 전문가가 미리 정의한 sanitizer 모델에 의존하기 때문에 다양한 custom sanitizer를 제대로 인식하지 못할 수 있다. 이 경우 실제로는 필터링이 적용되어 안전한 경로를 취약하다고 판단하게 되어 false positive 발생

### SMT solver 사용한 분석

- 정규 표현식의 다양한 기능을 모델링하는 데 있어 보안 전문가의 광범위한 모델링이 필요
- 복잡한 비즈니스 로직이 sanitizer와 얽혀 있어 메모리 폭발 및 솔버 실패와 같은 문제 발생

---

# Methodology

---

## Methodology 1 : XSS Vulnerability Background

- **XSS 취약점 유형**

| 유형 | 설명 |
| --- | --- |
| Client-side XSS | 브라우저의 JavaScript 코드에서 사용자 입력을 잘못 처리해 발생 |
| Server-side XSS | 서버가 사용자 입력을 HTML 응답에 잘못 삽입해 발생 |
| Reflected XSS | 사용자 입력이 서버 응답에 즉시 반사되어 실행 |
| Stored XSS | payload가 DB에 저장된 후 다른 사용자에게 실행 |
- 해당  논문은 **PHP 코드에서 발생하는 reflected server-side XSS** 탐지에 초점을 둔다. Client-side DOM XSS나 stored XSS는 주요 평가 범위가 아님

---

## Methodology 2 : Path-Persistent Fuzzing

- 기존 path-guided fuzzing의 문제
    - 기존 directed fuzzing은 특정 코드 경로에 도달하도록 입력을 조정한다. 하지만 웹 애플리케이션에서는 목표 경로에 도달하기 전에 로그인, 세션, DB 상태, 페이지 이동, 권한 조건 등을 만족해야 한다.
- **기존 path-guided fuzzing은 PHP 웹앱에 그대로 적용하기 어렵다.**

### <path-persistent fuzzing 제안>

- 전체 웹 애플리케이션을 실행하며 목표 경로를 찾아가는 대신, 정적 분석으로 찾은 **source-sink path만 따로 떼어내 로컬 실행 가능한 PUT로 변환 후 fuzzing 수행한다.**
    
    ```
    PHP 웹 애플리케이션 소스코드
            ↓
    정적 분석 도구 TChecker로 source-sink path 추출
            ↓
    source-sink path를 PUT로 변환
            ↓
    PUT에 대해 XSS fuzzing 수행
            ↓
    실제 PoC 생성 여부로 취약점 판단
    ```
    
    - 목표와 관련 없는 코드 탐색 감소
    - 전체 웹 애플리케이션 환경 구축 부담 감소
    - source-sink path에 집중한 빠른 fuzzing 가능

---

## Methodology 3 : PUT conversion

- 정적 분석 도구에서 제공된 source-sink 경로를 독립적으로 실행 가능한 프로그램(Program Under Test, PUT)으로 변환

### source-sink path를 실행 가능한 PUT로 변환하는 문제

- 정적 분석 도구가 보고한 source-sink 경로에는 undefined symbol들, 즉 변수나 함수 호출이 포함되는 경우가 많고, 이것들이 실행 가능성을 방해
    - 정의되지 않은 변수들은 파일 include를 통해 도입되었거나, DB 쿼리 같은 런타임 동작을 통해 할당되었을 수도 있음
    - 선언되지 않은 함수 호출은 객체 메서드 호출일 수 있다. 이 경우 런타임에서 실제 객체 타입을 정확히 알 수 없으면, 어떤 함수가 호출되는지 정확히 찾기 어려움
- undefined symbols을 처리 위한 기법 필요

### 1. 정의되지 않은 변수 초기화 (Undefined Variable Initialization)

- 대상 애플리케이션의 코드 속성 그래프(Code Property Graph, CPG)를 탐색하여 정의되지 않은 변수의 사용-정의 체인(def-use chain)을 식별하고, 이와 관련된 코드 조각을 원래의 source-sink 경로에 병합
    - 각 정의되지 않은 변수에 대해 하향식(bttom- up) 데이터 흐름 분석을 수행하여 정의-사용 체인을 따라 역추적 함
    - 변수의 정의-사용체인을 추적하며 상수 or 슈퍼-글로벌 변수를 만나면 추적을 중단하고 해당 변수 초기화를 위한 할당 문장을 경로 시작 부분에 추가
- 외부 선언 변수와 동적 할당 변수 경우 정적 분석만으로 완전한 사용-정의 체인을 구축하기 어려움
    - 외부 선언 변수 : include를 통해 도입된 변수
    - 동적 할당 변수 : 런타임 데이터베이스 쿼리, 파일조작을 통해 할당된 변수
    
    **“생성된 PUT의 실행 가능성을 크게 보장하기 위해 절충적이면서도 적응 가능한 초기화 전략을 제안”**
    
- 해당 변수들을 **fuzzer가 제어할 수 있는 임시 변수**로 변환, 런타임에 무작위 값을 할당하는 방식으로 실행 가능성 확보
    
    ![image.png](/images/XSSky/image.png)
    
- PHP는 약한 타입 언어이므로, 각 정의되지 않은 변수에 대해 값 할당뿐만 아니라 변수 타입도 결정되지 않음
    - PHP weakly typed 특성 고려하여 PHP  interpreter의 오류 피드백에 기반하여 런티임 중에 각 퍼저 제어 가능 변수의 타입을 적시에 수정 함
        - PHP  interprete : 잘못된 변수 타입을 접하면 오류 메시지를 보고

### 2. 선언되지 않은 함수 로컬라이제이션 (Undeclared Function Localization)

- source-sink path 안에 호출된 함수가 있으면 CPG에서 그 함수의 정의 위치를 찾아내고, 해당 함수 구현 코드를 PUT에 포함시켜 로컬에서 실행 가능하게 만든다.
    1. source-sink path에 등장하는 각 함수 호출에 대해 CPG에서 해당 호출 지점, 즉 call site를 식별
    2. CPG를 질의하여 실제 호출되는 함수를 찾는다.
    3. 함수 노드에 기록된 파일 정보와 시작 줄 번호 정보를 기반으로,  대상 애플리케이션의 코드 공간에서 해당 함수 구현을 추출
    4. 최종적으로  이러한 함수 정의 관련 코드 조각들을 원래 source-sink path에 통합
- 새로 통합된 함수가 또 다른 선언되지 않은 함수 호출을 포함할 수 있기 때문에 더 이상 선언되지 않은 함수 호출이 존재하지 않을 때까지 이러한 함수 정의들을 반복적으로 찾고 통합
- 추출한 함수 정의들을 `function_definition.php`에 저장하고, PUT의 첫 줄에서 `include`하여 로컬 실행 가능성을 확보

### 객체 타입이 불확실한 객체 함수 호출 처리

- 클래스 내부에 정의된 객체 함수 호출(object function invocation)의 경우, 런타임 객체 타입을 정확히 알기 어렵다는 문제 발생
    - 오버-근사(over-approximate) 접근 방식 사용
    - false negative보다 false positive를 더 감수
- 런타임 타입이 불확실한 객체 함수 호출(**over-approximate 접근 방식**)
    1. 동일한 함수 시그니처(이름과 매개변수 수)를 가진 모든 가능한 함수 후보 집합 구성
    2. 각각의 함수 정의를 원래 source-sink path에 각각 독립적으로 통합하여 여러 개의 PUT를 생성
    3. 이 중 하나라도 취약점 발견 시 해당 경로 취약한 것으로 간주

---

## Methodology 4 : PUT Fuzzing

- 변환된 PUT에 대해 네 단계의 퍼징(fuzzing) 기법을  통해 XSS 취약점을 확증

### 1. 싱크 컨텍스트 분석

- PUT에 내재된 XSS 취약점의 싱크 컨텍스트를 결정하기 위해 런타임 DOM 분석을 수행
- XSS 익스플로잇의 구성은 싱크의 구문 컨텍스트(즉, 싱크 컨텍스트)에 크게 의존

| Sink Context | 코드 예시 | 가능한 payload |
| --- | --- | --- |
| HTML Context | `echo $input;` | `<script>alert(1)</script>` |
| URL Context | `<a href="$input">` | `javascript:alert(1)` |
| HTML Attribute Context | `<input value="$input">` | `" onerror=alert(1) "` |
| JavaScript Context | `<script>$input</script>` | `";alert(1);//` |
- Fuzzer 가 효과적인 테스트 케이스를 생성하도록 안내하기 위해 XSSky는 먼저 싱크 컨텍스트를 식별

**Step1 . 런타임 응답 검색**

- PUT을 로컬 환경에 배포하고, 요청을 생성하여 브라우저가 PUT에 액세스하는 것을 시뮬레이션
    - 요청 구성 시 소스의 요청 매개변수에 고유한 문자열(현재 타임스탬프의 MD5 해시)을 할당 
    ⇒ DOM 트리 노드 내에서 소스의 위치를 후속적으로 식별하는데 도움

**Step2 . 싱크 컨텍스트 결정**

- 응답 받은 후 싱크 컨텍스트 결정
    - Python 라이브러리 **lxml**통해 응답의 DOM 트리를 파싱
    - 할당된 고유 문자열(MACKER) 활용하여 DOM 트리에서 싱크 매개변수 있는 노드 찾음
    - 노드 분석하고 다음 기준 중 어떤것이 충족되는지 결정하여 싱크 컨텍스트 결정

```
ex)
marker가 <script> 태그 안에 있음	JavaScript Context
marker가 onclick, onmouseover 같은 이벤트 속성 값에 있음	JavaScript Context
marker가 href, src 같은 하이퍼링크/URL 속성 값에 있음	URL Context
marker가 일반 HTML 속성 값에 있음	HTML Attribute Context
위 조건에 해당하지 않음	HTML Context
```

### 2. 테스트 케이스 초기화

- XSSky는 XSS가 문법 구조에 민감하다는 점을 고려해, sink context별로 적절한 exploit grammar를 정의하고, 입력값이 문자열과 연결되어 있는지 여부까지 고려해 초기 테스트 케이스를 생성
- URL context와 JavaScript context에서는 입력값이 독립적으로 사용되는지, 또는 앞뒤 문자열과 이어 붙는지에 따라 필요한 payload가 달라짐
    - sink parameter가 독립적으로 사용 ⇒ JavaScript Code component만으로도 이를 exploit 가능
    - sink parameter가 다른 문자열과 연결되어 사용 ⇒ JavaScript를 삽입하기 전에 문자열 구조를 벗어나기 위해 Terminator component를 사용
    - Terminator component
        
        
        | Context | Terminator 예시 | 역할 |
        | --- | --- | --- |
        | HTML Attribute | `"` 또는 `'` | 속성값을 닫고 새 이벤트 속성 삽입 |
        | JavaScript 문자열 | `";` 또는 `';` | 문자열을 닫고 JS 코드 삽입 |
        | JavaScript 코드 | `;` | 기존 문장을 끝내고 새 코드 삽입 |
        | 뒤 문자열 무력화 | `//` | 뒤쪽 코드를 주석 처리 |
- parameter가 문자열과 연결되어 있는지 여부에 따라 sink context를 여섯 가지 유형으로 더 분류함
- 여러 익스플로잇 문법 중 가장 간단한 것부터 우선적으로 테스트하여 효율성을 높임

![image.png](/images/XSSky/image%201.png)

### 3. 변이 및 피드백 (Mutation and Feedback)

- 퍼징 중에 테스트 케이스의 어떤 문자를 어떻게 변이해야 하는지를 안내

**step1 . 변이 전략**

- 초기 테스트 케이스를 변형하여 XSS 취약점을 트리거하고 잠재적으로 취약한 sanitizer를 우회하는 것
- CVE와 기존 우회 기법 바탕으로 8가지 종류의 우회 방법 수집, 다른 XSS 익스플로잇 구성요소 변이 전략 수집

| 전략 | 이름 | 설명 | 예시 |
| --- | --- | --- | --- |
| **M1** | **문자 대소문자 변형** | sanitizer가 특정 문자열을 대소문자까지 정확히 비교해 차단하는 경우를 우회하기 위해, 위험 키워드의 대소문자를 섞어서 변형한다. | `<script>` → `<ScRipT>` |
| **M2** | **다중 형식 키워드** | sanitizer가 특정 키워드를 한 번만 제거하거나 중첩 패턴을 제대로 처리하지 못하는 경우를 노려, 키워드 안에 동일한 키워드를 중첩 삽입한다. | `<script>` → `<scr<script>ipt>` |
| **M3** | **보이지 않는 문자 삽입** | 공백, 탭, 개행 등 눈에 잘 보이지 않는 문자를 삽입해 sanitizer의 단순 패턴 매칭을 방해한다. | `<script>` → `<script%09>` |
| **M4** | **특수 문자 삽입** | 특수문자를 삽입해 sanitizer가 이벤트 핸들러나 위험 패턴을 정확히 인식하지 못하도록 한다. | `onload=` → `onload!#$%=` |
| **M5** | **대체 키워드** | sanitizer가 특정 태그나 이벤트만 차단하는 경우, 같은 기능을 수행할 수 있는 다른 태그나 이벤트로 바꾼다. | `<img onerror=` → `<svg onload=` |
| **M6** | **유니코드 인코딩** | 위험 문자열 일부를 유니코드 escape sequence로 표현해, 인코딩 처리가 미흡한 sanitizer를 우회한다. | `alert(1)` → `al\u0065rt(1)` |
| **M7** | **동등 의미 변형** | 문법 형태는 다르지만 의미는 같은 JavaScript 표현으로 바꿔, 특정 문자열 기반 필터링을 우회한다. | `alert(1)` → `top` |
| **M8** | **트릭** | JavaScript의 특이한 문법이나 브라우저 해석 차이를 이용해 일반적인 패턴 매칭 기반 sanitizer의 edge case를 테스트한다. | `alert(1)` → `alert`1`` |

**Step2 . 피드백 메커니즘**

- PHP 인터프리터의 문자열 처리 함수를 hook해서 sanitizer가 어떤 문자열을 막았는지 확인하고, 그 정보를 바탕으로 payload를 반복적으로 변형
- 다음과 같은 PHP 내부 함수를 hook

| Hook 대상 | 관련 PHP 함수 | 역할 |
| --- | --- | --- |
| `php_pcre_match_impl` | `preg_match()` | 입력값이 특정 패턴과 매칭되는지 검사 |
| `php_pcre_replace_impl` | `preg_replace()` | 특정 패턴을 찾아 제거하거나 치환 |
- hook으로 기록하는 정보
    
    
    | 수집 정보 | 의미 |
    | --- | --- |
    | line number | sanitizer가 호출된 코드 라인 |
    | input string | sanitizer에 들어간 입력값 |
    | matched substring | sanitizer가 탐지한 문자열 |
    | return string | sanitizer 처리 후 반환값 |
    - 해당 정보는 fuzzing 과정에서 테스트 케이스의 mutation과 생성을 안내하는 피드백으로 사용

**Step3 . 퍼징 스킴**

- fuzzing 과정에서 mutation 전략과 feedback mechanism을 활용해 초기 테스트 케이스를 반복적으로 변형
    1. 미리 정의된 첫 번째 exploit grammar(sink context에 맞는 문법)에서 파생된 초기 테스트 케이스로 시작
    2. 피드백에서 sanitizer플래그가 지정된 문자열을 분석함으로써, XSSky는 어떤 문자들이 sanitizer에 의해 차단되고 있는지 식별
    3. 이에 대응하는 mutation 전략을 적용해 표적화된 mutation을 수행하고, 변형된 값을 다시 입력
    4. 피드백의 라인 번호 정보를 조사함으로써, XSSky는 더 많은 제한 조건이 우회되었는지를 판단하고, 이를 통해 현재 mutation 전략의 효과를 평가(line number 정보를 통해 현재 mutation이 진전이 있는지 확인)
    5. 어떤 mutation 전략이 효과가 있으면 계속 밀고 가고, 반대로 진전이 없으면, bug oracle이 취약점을 확인할 때까지 다른 mutation 전략으로 전환
- 모든 mutation 전략을 다 사용했는데도 취약점을 트리거하는 테스트 케이스를 생성하지 못하면, XSSky는 다음 exploit grammar로 넘어가서 이 과정을 반복
- 모든 exploit grammar를 테스트했음에도 성공하지 못한 경우에만 안전하다고 간주

### 4. 버그 오라클

- fuzzing 과정에서 특정 테스트 케이스가 XSS 취약점을 드러냈는지 판단하는 데 사용
    - Python 라이브러리인 Selenium을 사용해 브라우저 요청을 시뮬레이션하여 PUT에 접근하고, 브라우저에서 JavaScript 팝업이 발생하는지 감지
- 링크 클릭이나 마우스 오버와 같은 사용자 상호작용이 필요한 경우를 위해 크롤러(crawler)를 사용하여 이러한 상호작용을 시뮬레이션하고 팝업이 성공적으로 트리거되는지 확인하여 취약점을 최종적으로 확증
    - crawler : 단순히 페이지를 방문하는 것만이 아니라, 페이지 안의 요소를 찾아 상호작용을 시도
- 테스트 케이스가 삽입된 후 팝업이 실제로 트리거되는지를 철저히 평가하는 데 도움을 주며, 이를 통해 XSS 취약점을 확인

---

# Results & Conclusion

---

## Results

### 실험 대상

- 20개의 실제 PHP 웹 애플리케이션
- WordPress, Dolibarr, GLPI, OpenEMR 등 인기 프로젝트 포함
- 기존 정적 분석 도구 TChecker가 보고한 source-sink path를 기반으로 평가

| 항목 | 결과 |
| --- | --- |
| 분석한 source-sink path | 7,005개 |
| PUT 변환 성공 | 6,997개 |
| PUT 변환 성공률 | 99.89% |
| 발견한 XSS 취약점 | 60개 |
| sanitizer가 있었지만 우회된 취약점 | 31개 |
| 기존 baseline이 못 찾은 취약점 | 18개 |
| Precision | 81.08% |
| Recall | 100.00% |
- 7,005개 source-sink path 중 6,997개를 PUT로 변환했고, 20개 PHP 애플리케이션에서 60개의 XSS 취약점을 발견했으며, 그중 31개는 sanitizer가 이미 존재했지만 우회된 사례였다고 보고

---

## Comparison with Exisitng Tools

| 도구 | TP | FP | FN | Precision | Recall |
| --- | --- | --- | --- | --- | --- |
| XSSky | 60 | 14 | 0 | 81.08% | 100.00% |
| TChecker | 32 | 261 | 28 | 10.92% | 53.33% |
| XSSky-w3af | 22 | 10 | 38 | 68.75% | 36.67% |
| XSSky-bw | 24 | 9 | 36 | 72.73% | 40.00% |
| XSSky-webFuzz | 25 | 11 | 35 | 69.44% | 41.67% |
| XSSky-Burp | 29 | 11 | 31 | 72.50% | 48.33% |
- TChecker는 정적 분석 도구라 전체 코드를 넓게 볼 수 있지만, custom sanitizer와 sanitizer evasion 문제로 오탐과 미탐이 많다.
- Burp, w3af, webFuzz 같은 동적 분석 도구는 실제 실행 기반이지만, XSSky만큼 source-sink path를 깊게 검증하지 못한다.
- XSSky는 정적 분석의 넓은 탐색 능력과 동적 fuzzing의 실제 검증 능력을 결합했기 때문에 recall이 높다.
- 논문은 XSSky가 기존 SOTA 기법 대비 precision을 11.48%~642.49%, recall을 87.51%~172.70% 향상시켰다고 설명한다.

---

## Limitations

- **정적 분석 도구 의존성**
    - XSSky는 TChecker가 찾은 source-sink path를 입력으로 사용한다. 따라서 TChecker가 경로를 잘못 보고하거나 놓치면 XSSky의 결과에도 영향을 줄 수 있다.
- **Control Flow Constraint 문제**
    - PUT에서는 취약해 보이지만 실제 애플리케이션에서는 특정 조건 때문에 도달 불가능한 경로일 수 있다.
- **Dead Code 문제**
    - 실제로 사용되지 않는 코드에서 취약점이 발견될 경우 현실적인 취약점으로 보기 어렵다.
- **방어 설정 미반영**
    - CSP 같은 HTTP 보안 헤더 기반 defense-in-depth 메커니즘은 XSSky의 분석 범위 밖이다. 논문도 XSSky가 코드 보안에 초점을 맞추기 때문에 CSP 같은 운영 환경 방어 정책은 범위 밖이라고 설명
- **탐지 범위 제한**
    - 현재 XSSky는 reflected server-side XSS 중심이며, stored XSS나 client-side DOM XSS는 직접적인 평가 범위가 아님

---

# Conclusion

- **연구 성과**
    - XSSky는 기존 정적 분석이 sanitizer가 있는 경로를 제대로 판단하지 못하는 문제를 해결하기 위해, 정적 분석과 동적 fuzzing을 결합한 XSS 탐지 시스템을 제안했다.
- **핵심 발견**
    - sanitizer가 존재한다고 해서 source-sink path가 안전한 것은 아니다. 출력 문맥에 맞지 않게 사용된 sanitizer나 잘못 구현된 custom sanitizer는 우회될 수 있다. XSSky는 이를 실제 payload 생성과 브라우저 기반 검증으로 확인한다.
- **연구 의의**
    - 이 논문은 XSS 탐지를 단순한 source-sink 연결 문제가 아니라, **sink context와 sanitizer evasion을 고려한 실제 PoC 생성 문제**로 재정의했다는 점에서 의미가 크다.
- **최종 정리**

> XSSky는 정적 분석으로 찾은 XSS 의심 경로를 PUT로 변환하고, sink context 기반 exploit grammar와 PHP interpreter feedback을 활용한 path-persistent fuzzing으로 sanitizer 우회 가능성을 실제 PoC 수준에서 검증하는 XSS 탐지 시스템이다.
> 

---

## 느낀점

가장 인상 깊었던 점은 sanitizer가 존재한다고 해서 안전하다고 단정하지 않는 것 입니다. 

실제 웹 취약점 진단에서도 필터링 함수를 사용했다고 해서 공격 가능성이 사라지는 것이 아니고 출력 문맥이 HTML 본문인지, URL인지, attribute인지, JavaScript 내부인지에 따라 같은 입력값도 다른 위험을 만들 수 있고

또한 실제 진단에서는 단순히 해당 파라미터가 출력되는 것 아니라, 해당 파라미터가 어떤 문맥에 출력되고, 어떤 필터를 거치며, 그 필터를 우회할 수 있는지를 확인해야 하는데, XSSky는 이 과정을 자동화한 연구라고 생각합니다.

XSSky는 XSS 탐지를 단순한 source-sink 연결 문제가 아니라, 실제 PoC 생성 문제로 확장했다는 점에서 실용적이다고 느꼈습니다. 

 PHP interpreter feedback을 이용해 sanitizer가 막은 문자열을 확인하고, 그 부분을 중심으로 payload를 변형하는 방식은 아주 효과적인 아이디어라고 생각했습니다.

## 앞으로 해볼 것

- **sanitizer** 우회 테스트 모듈 제작
    - `htmlspecialchars()`, `strip_tags()`, `preg_replace()`를 통과한 입력값이 어떤 형태로 출력되는지 확인하고, context별로 위험 여부를 판단하는 실험
- **간단한 XSS fuzzing payload generator**를 구현
    - HTML context, URL context, attribute context, JavaScript context에 맞는 payload를 따로 만들고, 대소문자 변형, 키워드 중복 삽입, invisible character 삽입 같은 mutation 전략을 적용해볼 수 있다.
- XSSky의 아이디어를 PHP가 아닌 다른 웹 프레임워크에 적용
    - 실제 서비스에서는 다양한 언어와 프레임워크가 사용되기 때문에, source-sink path를 추출하고 로컬 테스트 코드로 변환하는 방식을 확장