---
title: "test"
summary: "dreamhack"
date: "2026-04-10"
category: "ctf"
section: "security"
badge: "Wargame"
badgeTone: "ctf"
ctfGroup: "wargame"
tags:
  - wargame
  - web
statLabel: "tier"
statValue: "2"
heroEyebrow: "$ cat content/posts/login1-tier-2.md"
heroAvatar: "CTF"
---

# Fuzzing & Fuzzer

# Fuzzing이란?

- Fuzzing은 프로그램에 다양한 입력값을 자동으로 넣어보면서 프로그램이 어떻게 반응하는지 관찰하는 소프트웨어 테스트 기법이다.
- 즉, 퍼저는 입력을 생성하거나 변형한 뒤 대상 프로그램에 전달하고, 실행 중 다음과 같은 이상 동작이 발생하는지 확인
    
    ```
    입력 생성 또는 변형
            ↓
    Target Program 실행
            ↓
    Crash / Hang / Timeout / Sanitizer Error 관찰
            ↓
    문제가 발생한 입력 저장
            ↓
    원인 분석 및 취약점 가능성 확인
    ```
    
    - 현대적인 **coverage-guided fuzzing**은 단순히 많이 실행하는 것이 아니라,
    **새로운 코드 경로를 발견한 입력을 저장하고 이를 다시 변형**하면서 점점 더 깊은 로직을 탐색한다.

---

# Fuzzing이 찾는 버그 유형

- Fuzzing의 최족 목적은 입력 처리 과정에서 발생하는 버그를 자동으로 찾는 것
- 프로그램은 외부에서 들어오는 입력을 처리한다. 파일, 문자열, HTTP 요청, JSON, XML, 이미지, 압축 파일, URL 등이 모두 입력이 될 수 있다. 문제는 개발자가 모든 비정상 입력을 직접 예상하기 어렵다는 점
- 퍼징으로 찾을 수 있는 대표적인 문제
    
    
    | 결함 유형 | 설명 |
    | --- | --- |
    | Crash | 프로그램이 비정상적으로 종료되는 상태 |
    | Hang | 프로그램 실행이 종료되지 않고 멈추는 상태 |
    | Timeout | 입력 처리 시간이 허용 범위를 초과하는 상태 |
    | Buffer Overflow | 버퍼 경계를 벗어난 읽기 또는 쓰기 |
    | Use-after-free | 해제된 메모리를 다시 참조하는 오류 |
    | Double-free | 동일한 메모리 영역을 두 번 해제하는 오류 |
    | Invalid free | 유효하지 않은 메모리 주소를 해제하려는 오류 |
    | Integer Overflow | 정수 연산 결과가 표현 가능한 범위를 초과하는 오류 |
    | Undefined Behavior | 언어 명세상 동작이 정의되지 않은 실행 상태 |
    | Memory Leak | 할당된 메모리가 적절히 해제되지 않는 문제 |
    | Resource Exhaustion | CPU, 메모리, 디스크 등 시스템 자원이 과도하게 소모되는 상태 |
    | Logic Error | 프로그램이 종료되지는 않지만 의도와 다른 결과를 내는 오류 |

---

# Fuzzing의 기본 동작 원리

- 동작 흐름

```
[Seed Corpus]
      ↓
[입력 선택]
      ↓
[Mutation / Generation]
      ↓
[Target Program 실행]
      ↓
[Crash / Hang / Sanitizer Error 관찰]
      ↓
[Coverage Feedback 분석]
      ↓
[의미 있는 입력 저장]
      ↓
[반복]
```

- 퍼저는 입력을 생성한 뒤 단순히 실행 결과만 확인하지 않고, 해당 입력이 새로운 코드 경로를 실행했는지 확인
- 새로운 coverage를 유발한 입력은 다시 corpus에 저장되고, 이후 변이의 재료로 사용
- 입력을 무작위로 변형한 뒤, 해당 입력이 target binary에서 새로운 path로 처리되었는지 평가

## 1. Seed Corpus

- 퍼징을 시작하기 위해 사용하는 초기 입력 집합
- ex) JSON parser를 퍼징한다면 , 다음과 같은 JSON 파일을 seed로 사용 가능

```json
{"name":"test","age":20}
```

- 퍼저는 seed corpus를 바탕으로 입력을 조금씩 변형
- Seed corpus의 품질은 퍼징 효율에 직접적인 영향 줌
- 다양한 실행 경로를 유도할 수 있는 입력이 포함되어 있을수록 퍼저는 더 빠르게 넓은 코드 영역을 탐색가능하게 함

## 2. Mutation / Generation

- 퍼저가 새로운 입력을 만드는 방식은 크게 두 가지로 나눌 수 있다.

### Mutation

- 기존 seed input을 조금씩 변형하는 방식

```json
원본 입력:
name=admin&age=20

변형 입력:
name=AAAAAA&age=20
name=admin&age=-1
name=admin&age=999999999999
name=%00%00%00&age=20
```

### Generation

- 입력 문법, 스키마, 프로토콜 명세를 기반으로 새로운 입력을 생성하는 방식
- JSON, XML, JavaScript, SQL, 네트워크 프로토콜처럼 구조가 엄격한 입력은 단순 byte mutation만으로는 대부분 무효 입력이 될 수 있다.
    - 이런 경우에는 grammar나 schema를 기반으로 입력을 생성하는 방식이 더 효과적이다.

## 3. Target Execution

- 생성된 입력을 실제 테스트 대상 프로그램에 전달해 실행하는 단계
- 프로그램이 crash, hang, timeout, sanitizer error를 일으키는지 관찰

## 4. Coverage Feedback

- Coverage feedback은 퍼징 중 수집되는 코드 실행 범위 정보를 의미
    - Coverage: 특정 입력이 프로그램 내부의 어떤 코드 영역을 실행했는지를 의미
- 입력이 어떤 코드 블록, 분기, 함수, 경로를 실행했는지 추적한다. 새로운 coverage를 유발한 입력은 의미 있는 입력으로 간주되어 corpus에 저장
- Seed corpus는 퍼징의 출발점이고, coverage feedback은 퍼저가 어느 방향으로 더 탐색해야 하는지 알려주는 기준이다.

## 5. Crash / Hang / Sanitizer Error

- 실행 결과에서 다음과 같은 문제를 확인

```bash
Crash: 프로그램 비정상 종료
Hang: 프로그램이 멈춤
Timeout: 처리 시간이 초과됨
Sanitizer Error: 메모리 오류, undefined behavior 등 탐지
```

---

# Fuzzing의 분류

- 해당 분류들이 서로 배타적인 개념이 아님
- ex) AFL++는 **grey-box fuzzer**이면서 동시에 일반적으로 **mutation-based fuzzer**로 동작 가능

## 1. 내부 정보 활용 정도에 따른 분류

| 종류 | 설명 | 장점 | 한계 |
| --- | --- | --- | --- |
| Black-box Fuzzing | 대상 내부 구조를 모른 채 입력과 결과만 보고 테스트 | 소스코드가 없어도 가능 | coverage 정보를 알 수 없어 효율이 낮을 수 있음 |
| Grey-box Fuzzing | coverage 같은 일부 실행 정보를 활용 | 효율과 현실성의 균형이 좋음 | 프로그램 의미를 깊게 이해하지는 못함 |
| White-box Fuzzing | 소스코드, 조건식, 제어 흐름, symbolic execution 등을 활용 | 깊은 경로 탐색에 유리 | 분석 비용이 크고 확장성이 낮을 수 있음 |

## 2. 입력 생성 방식에 따른 분류

| 종류 | 설명 | 장점 | 한계 |
| --- | --- | --- | --- |
| Mutation-based Fuzzing | 기존 seed를 변형해 새로운 입력 생성 | seed corpus를 기반으로 동작하며, 구현이 단순하고 범용성이 높음 | 입력 형식이 복잡한 대상에서는 변형 결과가 쉽게 무효 입력이 될 수 있다는 한계 존재 |
| Generation-based Fuzzing | 문법, 스키마, 프로토콜 명세 기반으로 입력 생성 | 구조가 엄격한 파일 포맷, 직렬화 포맷, 프로토콜, 스크립트 언어 입력 등을 대상으로 할 때 효과적 | 입력 모델이나 grammar를 정의해야 하므로 초기 준비 비용이 큼 |

---

# Fuzz Target과 Sanitizer

## 1. Fuzz Target

- 퍼저가 생성한 입력을 테스트 대상 코드에 전달하는 진입점
- 퍼저와 테스트 대상 API 사이를 연결하는 **중간 연결 코드**
- libFuzzer 공식문서는 fuzz target을 “byte 배열을 받아 테스트 대상 API에 의미 있는 동작을 수행하는 함수”로 설명한다. 이 함수는 일반적으로 `LLVMFuzzerTestOneInput` 형태를 가진다
    - **libFuzzer**에서 **fuzz target** : 퍼저가 생성한 byte 배열 입력을 테스트 대상 API에 전달하는 진입점
    - libFuzzer는 기본적으로 `LLVMFuzzerTestOneInput`이라는 함수를 반복적으로 호출
    - 함수 내부에서 parser, decoder, validator와 같은 실제 테스트 대상 함수를 실행
    - fuzz target은 libFuzzer와 테스트 대상 코드 사이를 연결하는 harness 역할

## 2. Sanitizer

- 퍼징은 crash만 찾는 것이 아니라 sanitizer와 결합해 숨어 있는 메모리 오류를 crash처럼 관찰 가능하게 만든다
    - 모든 메모리 오류가 즉시 crash로 이어지는 것이 아님 
       →  버그 존재하지만 crash가 안 나 못 잡는 상황 발생
    - `Sanitizer` : 프로그램 실행 중에 메모리 접근, 정수 연산, undefined behavior 등을 감시하는 도구
       →  숨어 있는 오류를 관찰 가능하게 만들 수 있다
        
        
        | Sanitizer | 탐지 대상 |
        | --- | --- |
        | AddressSanitizer, ASan | buffer overflow, use-after-free, invalid free 등 |
        | UndefinedBehaviorSanitizer, UBSan | integer overflow, 잘못된 포인터 정렬, undefined behavior |
        | MemorySanitizer, MSan | 초기화되지 않은 메모리 읽기 |
        | LeakSanitizer, LSan | memory leak |
        | ThreadSanitizer, TSan | data race |

---

# 주요 퍼저 비교: AFL++, libFuzzer, Jackalope

| 구분 | AFL++ | libFuzzer | Jackalope |
| --- | --- | --- | --- |
| 분류 | Coverage-guided grey-box fuzzer | In-process coverage-guided fuzzer | Binary coverage-guided fuzzer |
| 주요 대상 | Native program, file parser, CLI 프로그램 | Library function, API, parser | Black-box binary |
| 소스코드 필요성 | 있으면 유리, 일부 binary-only 가능 | 일반적으로 소스코드 또는 빌드 제어권 필요 | 소스코드 없이 사용 가능 |
| 입력 전달 방식 | file, stdin, `@@` | byte array entrypoint | file 또는 shared memory |
| 강점 | 범용성 높고 기능 다양 | 함수 단위 테스트가 빠름 | closed-source binary 대상 가능 |
| 한계 | target 구성과 harness 필요 | entrypoint 작성 필요 | 설정과 target 구성이 비교적 어려움 |
- AFL++ : edge coverage를 활용해 새로운 상태 전이를 발견한 입력을 queue에 저장하고 반복적으로 변이하는 방식으로 동작
- libFuzzer : 테스트 대상 라이브러리와 같은 프로세스 안에서 동작하며, 특정 fuzzing entrypoint를 통해 입력을 전달
- Jackalope : Google Project Zero에서 공개한 customizable, distributed, coverage-guided fuzzer이며 black-box binary를 대상으로 사용할 수 있게 함

---

# 심층 분석 - AFL++

```bash
┌──────────────────────────────────────────────────────────────────────────────┐
│                              AFL++ 퍼징 루프                                  │
│                                                                              │
│  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐     │
│  │   시드 코퍼스    │ ───▶ │   입력 스케줄러  │ ───▶ │    변이 엔진     │     │
│  │ 초기 입력 파일들 │       │ 파워 스케줄 선택 │       │ Havoc/Splice/CMP │    │
│  └─────────────────┘       └─────────────────┘       └─────────────────┘     │
│          ▲                                               │                   │
│          │                                               ▼                   │
│          │        ┌──────────────────────────────────────────────┐          │
│          │        │              계측 레이어                      │          │
│          │        │           Instrumentation                    │          │
│          │        │ SanitizerCoverage · LLVM-PCGuard · GCC       │          │
│          │        │ QEMU · Unicorn · Frida                       │          │
│          │        └──────────────────────────────────────────────┘          │
│          │                    │                         │                   │
│          │                    ▼                         ▼                   │
│          │        ┌─────────────────┐      ┌─────────────────┐             │
│          │        │   타겟 프로세스  │      │    크래시 감지   │             │
│          │        │ forkserver      │      │ ASAN/UBSAN/Signal│             │
│          │        │ persistent      │      └─────────────────┘             │
│          │        └─────────────────┘                │                     │
│          │                    │                      ▼                     │
│          │                    ▼          ┌──────────────────────┐          │
│          │        ┌─────────────────┐    │  큐 & 크래시 저장     │          │
│          └─────── │ 공유 메모리      │    │ 새 경로 발견 시 저장  │          │
│   feedback loop   │ 비트맵          │    │ queue/crashes/hangs  │          │
│                   │ 64KB edge map   │    └──────────────────────┘          │
│                   └─────────────────┘                │                      │
│                              ▲                       │                      │
│                              └──────── feedback ─────┘                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **coverage-guided grey-box fuzzer**
- 프로그램의 내부 소스코드를 완전히 분석하는 것은 아니지만, 실행 중 수집되는 **coverage 정보**를 이용해 더 많은 코드 경로를 탐색하는 퍼저

## 1. 핵심 동작 원리

- 동작 흐름 : **계측(Instrumentation) → 실행 → 피드백** 루프
    - 타겟 바이너리를 컴파일할 때 분기(edge) 마다 계측 코드를 삽입
    - 퍼저가 입력을 실행할 때마다 어떤 분기가 실행됐는지를 공유 메모리 비트맵에 기록
    - 이전에 보지 못한 새로운 코드 경로를 발견하면 해당 입력을 큐에 저장하고 추후 변이의 seed로 활용

## 2. Instrumentation

- 타겟 프로그램의 실행 정보를 수집하기 위해 코드나 실행 환경에 계측을 삽입하는 과정
- 계측 방식 비교

| 모드 | 소스 코드 필요 여부 | 핵심 설명 | 장점 | 사용 상황 |
| --- | --- | --- | --- | --- |
| **LLVM-PCGuard** | 필요 | Clang/LLVM으로 컴파일할 때 프로그램 내부에 coverage 계측 코드를 삽입하는 방식 | 속도가 빠르고 coverage 정확도가 높음. AFL++에서 가장 기본적으로 권장되는 모드 | 소스코드가 있는 C/C++ 프로그램 |
| **GCC Plugin** | 필요 | GCC 컴파일 과정에서 plugin을 이용해 coverage 계측 코드를 삽입하는 방식 | GCC 기반 프로젝트에서도 AFL++ 사용 가능 | GCC 기반 프로젝트 |
| **QEMU Mode** | 불필요 | 소스 없이 이미 컴파일된 바이너리를 QEMU로 실행하면서 동적으로 coverage를 수집하는 방식 | 바이너리만 있어도 퍼징 가능. 설정이 비교적 간단함 | 소스 없는 Linux ELF 바이너리 |
| **Frida Mode** | 불필요 | Frida를 이용해 실행 중인 프로세스나 라이브러리에 동적 계측을 삽입하는 방식 | 모바일, 동적 라이브러리, 특정 함수 hook에 유리함 | 모바일 앱, 동적 라이브러리 |
| **Unicorn Mode** | 불필요 | Unicorn Engine으로 특정 CPU 명령어 범위를 에뮬레이션하면서 퍼징하는 방식 | OS 없이 코드 조각 단위로 퍼징 가능 | 펌웨어, 임베디드 코드 |
| **Nyx / Snapshot** | 보통 불필요 | VM/KVM 기반으로 시스템 상태를 snapshot으로 저장하고 빠르게 복원하며 퍼징하는 방식 | 커널/OS 수준 퍼징에서 매우 빠른 반복 실행 가능 | 커널, OS, 드라이버 퍼징 |

## 3. 성능 최적화 기법

### 3.1 포크서버(Forkserver)

- 타겟을 매번 `execve()`로 새로 실행하지 않고, 초기화가 끝난 프로세스를 기준으로 `fork()`해서 테스트 케이스를 실행
    - `execve()`, 동적 링킹, libc 초기화 비용을 한 번만 지불하고 이후에는 copy-on-write 기반으로 빠르게 복제
    - 프로세스 생성 오버헤드를 크게 줄여 초당 수천 번의 실행이 가능

### 3.2 퍼시스턴트 모드(Persistent Mode)

- 하나의 fork된 프로세스 안에서 `__AFL_LOOP(count)` 루프를 돌며 여러 입력을 연속 처리
    - 매 입력마다 `fork()`하지 않아도 되므로 Forkserver보다 더 빠름
- 타겟 함수가 반복 호출되어도 상태가 오염되지 않도록 reset/free 처리가 필요

### 3.3 공유 메모리 비트맵

- 타겟이 실행 중 edge coverage 정보를 shared memory map에 기록하고, AFL++가 이를 읽어 새로운 경로 여부를 판단
    - 파일, 소켓, 복잡한 IPC 없이 메모리에 직접 기록하므로 coverage 전달 비용이 매우 작음
- `AFL_MAP_SIZE`로 map 크기를 조정

## 4. 변이**(Mutation)** 전략

### 4.1 결정론적 단계(Deterministic Mutations)

- 입력을 **정해진 순서대로, 정해진 방식으로** 바꿔보는 단계

| 변이 | 설명 | 특징 | 예시 |
| --- | --- | --- | --- |
| Bitflip  | 입력의 특정 비트를 반전시키는 변이 | 작은 변화로 새로운 분기 조건을 만족하는지 확인 | `0x41(A)` → `0x40(@)` / `flag=0` → `flag=1` |
| Arithmetic  | 입력의 일부를 정수로 보고 값을 더하거나 빼는 변이. | 길이, 개수, offset 같은 필드 테스트에 효과적 | `len=16` → `len=17`, `len=15`, `len=32` |
| Interesting Values | 취약점을 유발하기 쉬운 특수 값을 삽입하거나 덮어쓴다. | 경계값 테스트에 자주 사용 | `0`, `1`, `127`, `128`, `255`, `0xffff` 삽입 |

### 4.2 확률론적 단계(Stochastic Mutations)

- 무작위로 여러 변이를 조합하는 방식

| 변이 | 설명 | 특징 | 예시 |
| --- | --- | --- | --- |
| Havoc | 여러 변이를 랜덤하게 조합하는 확률론적 변이  | 입력을 크게 흔들어 새로운 coverage를 찾는다. | 바이트 변경 + 블록 삭제 + 랜덤 삽입 + bitflip 동시 적용 |
| Splice | 서로 다른 두 seed input을 잘라서 합친다 | 기존 입력들의 유효한 구조를 조합 | `Seed A 앞부분` + `Seed B 뒷부분` |

### 4.3 CmpLog/RedQueen

- **AFL++에서 깊은 경로 탐색을 돕는 핵심 기능 중 하나**
- 타겟 프로그램 내부의 비교 연산 정보를 fuzzing에 활용
- 바이너리의 비교 명령어(`cmp`, `strcmp` 등)를 계측해, 어떤 값과 비교하는지를 로그로 기록
- 이 정보를 변이에 직접 활용해 매직 바이트, 체크섬, 프로토콜 헤더 같은 장벽을 훨씬 빠르게 통과할 수 있게 함

## 5. 파워 스케줄(Power Schedule)

- 어떤 씨앗 입력에 얼마나 많은 변이를 시도할지(에너지)를 결정하는 알고리즘

| 종류  | 설명 |
| --- | --- |
| `fast` (기본값) | 드물게 실행된 경로에 더 많은 에너지를 부여 |
| `explore` | 모든 경로를 균등하게 탐색 |
| `exploit` | 최근에 새 경로를 발견한 seed에 집중 |
| `coe` | 너무 자주 선택된 seed를 차단 |
| `mmopt` | 최근 큐 항목을 선호하는 강화학습 기반 전략 |
| `rare` | 희귀하게 실행된 튜플(엣지 쌍)을 더 탐색 |

## 6. 병렬 퍼징

- AFL++는 하나의 마스터 인스턴스와 여러 슬레이브 인스턴스를 공유 디렉터리(`-o`)를 통해 연결하는 방식으로 병렬화 가능
    - 하나의 main 인스턴스를 `-M`으로 실행하고, 나머지는 `-S` secondary 인스턴스로 실행
    - 각 인스턴스는 독립적으로 입력을 변이하고 coverage를 탐색
    - 생성된 queue는 같은 `-o` 디렉터리를 통해 동기화
- 각 인스턴스가 서로 다른 power schedule, sanitizer, CmpLog, LAF-Intel 등을 사용할 수 있어 탐색 다양성이 증가 함
- 같은 이름의 인스턴스를 쓰면 충돌할 수 있으므로 `main`, `sec01`, `sec02`처럼 고유 이름을 줘야 함

```bash
# main fuzzer
afl-fuzz -i seeds -o out -M main -- ./target @@

# secondary fuzzer 1
afl-fuzz -i seeds -o out -S sec01 -p fast -- ./target @@

# secondary fuzzer 2
afl-fuzz -i seeds -o out -S sec02 -p explore -- ./target @@
```

## 7. AFL++ 사용 설정

### 7.1 계측 방식 설정

- target을 어떤 방식으로 계측할 것인가
- 소스코드가 있는 경우에는 afl-clang-lto, afl-clang-fast, afl-gcc-fast 같은 AFL++ compiler wrapper로 target을 빌드

| 설정 종류 | 대표 설정 | 의미 | 사용 상황 |
| --- | --- | --- | --- |
| LTO mode | `CC=afl-clang-lto` | Link Time Optimization 기반 계측 | Clang/LLVM 11 이상 사용 가능할 때 |
| LLVM mode | `CC=afl-clang-fast` | LLVM 기반 coverage 계측 | LTO가 어렵지만 Clang 빌드가 가능할 때 |
| GCC_PLUGIN mode | `CC=afl-gcc-fast` | GCC plugin 기반 계측 | GCC 기반 프로젝트를 퍼징할 때 |
| C++ LTO mode | `CXX=afl-clang-lto++` | C++ target용 LTO 계측 | C++ 프로젝트 |
| C++ LLVM mode | `CXX=afl-clang-fast++` | C++ target용 LLVM 계측 | C++ 프로젝트 |
| 모드 직접 지정 | `AFL_CC_COMPILER=LTO` | `afl-cc`에 계측 모드 지정 | symlink 대신 환경변수로 제어할 때 |

### 7.2 Binary-only 계측 설정

- 소스코드가 없는 경우에는 컴파일 타임 계측을 넣을 수 없음
- binary-only target에 대해 QEMU, FRIDA, Nyx, Unicorn 등을 제시

| 설정 종류 | 대표 설정 | 의미 | 사용 상황 |
| --- | --- | --- | --- |
| QEMU mode | `afl-fuzz -Q ...` | Linux 바이너리를 QEMU user-mode로 실행하며 coverage 수집 | 소스코드 없는 Linux ELF 바이너리 |
| FRIDA mode | `afl-fuzz -O ...` | FRIDA 기반 동적 계측 | macOS, Android, iOS, 동적 라이브러리 |
| Nyx mode | Nyx mode 설정 | KVM/QEMU 기반 snapshot fuzzing | OS, 커널, 드라이버 수준 |
| Unicorn mode | Unicorn mode 설정 | 특정 코드 범위를 에뮬레이션 | 펌웨어, 임베디드 코드, 비리눅스 바이너리 |
| Shared library fuzzing | QEMU/FRIDA + harness | 동적 라이브러리를 로드해 함수 호출 | `.so`, `.dylib` 등 라이브러리 대상 |

### 7.3 기본 실행 설정

- AFL++가 입력을 어떻게 바꿀지와 관련된 기능

| 설정 | 사용 예시 | 의미 |
| --- | --- | --- |
| **Seed corpus** | `-i seeds` | 초기 입력 파일들이 들어 있는 디렉터리 |
| **Output directory** | `-o out` | queue, crashes, hangs가 저장되는 디렉터리 |
| **파일 입력 치환** | `./target @@` | `@@` 자리에 AFL++가 생성한 입력 파일 경로가 들어감 |
| **stdin 입력** | `afl-fuzz -i seeds -o out -- ./target` | target이 표준 입력으로 데이터를 읽을 때 사용 |
| **기본 실행** | `afl-fuzz -i seeds -o out -- ./target @@` | 파일 기반 target 퍼징의 가장 기본 형태 |

### 7.4 Sanitizer 설정

- Sanitizer는 일반 실행에서는 조용히 지나갈 수 있는 메모리 오류나 undefined behavior를 퍼저가 감지 가능한 오류로 바꿔주는 역할

| 설정 종류 | 대표 설정 | 탐지 대상 | 사용 상황 |
| --- | --- | --- | --- |
| AddressSanitizer | `AFL_USE_ASAN=1` | memory corruption, buffer overflow, use-after-free 등 | C/C++ 메모리 오류 탐지 |
| UndefinedBehaviorSanitizer | `AFL_USE_UBSAN=1` | undefined behavior | 정수 overflow, 잘못된 포인터 사용 등 확인 |
| MemorySanitizer | `AFL_USE_MSAN=1` | uninitialized memory read | 초기화되지 않은 메모리 사용 탐지 |
| ThreadSanitizer | `AFL_USE_TSAN=1` | thread race condition | 멀티스레드 target |
| LeakSanitizer | `AFL_USE_LSAN=1` | memory leak | 누수 탐지 |
| Control Flow Integrity Sanitizer | `AFL_USE_CFISAN=1` | CFI violation, type confusion 등 | CFI 위반 확인 |
| Hardening | `AFL_HARDEN=1` | 일부 non-crashing memory bug | stack protector, FORTIFY_SOURCE 적용 |

### 7.5 Dictionary 설정

- AFL++에게 입력 포맷의 힌트를 주는 설정

| 설정 | 사용 예시 | 왜 많이 쓰는가 |
| --- | --- | --- |
| **수동 dictionary** | `-x http.dict` | HTTP, SQL, JSON처럼 문법이 있는 입력에서 유효한 token을 넣기 위해 사용 |
| **LTO autodictionary** | `afl-clang-lto` 빌드 시 자동 활용 | LTO mode는 문자열 비교 기반 dictionary를 자동 생성할 수 있어 coverage 향상에 도움을 준다. ([GitHub](https://github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.lto.md)) |
| **자동 dictionary 비활성화** | `AFL_NO_AUTODICT=1` | 자동 dictionary를 쓰고 싶지 않을 때 사용 |

### 7.6 Power Schedule 설정

- 어떤 seed에 mutation 기회를 얼마나 줄지 결정하는 설정

| 설정 종류 | 대표 설정 | 의미 | 사용 상황 |
| --- | --- | --- | --- |
| explore | `-p explore` | 기본 schedule, 넓은 탐색 | 일반적인 기본 선택 |
| fast | `-p fast` | 저빈도 path를 더 탐색 | 희귀 경로 탐색 |
| coe | `-p coe` | cut-off exponential schedule | 고빈도 seed 편중 완화 |
| quad | `-p quad` | quadratic schedule | 실험적 schedule 비교 |
| lin | `-p lin` | linear schedule | 실험적 schedule 비교 |
| exploit | `-p exploit` | AFL식 exploitation 중심 | 이미 발견한 유망 seed 집중 |
| mmopt | `-p mmopt` | 최근 queue 항목 가중 | 새 queue 중심 탐색 |
| rare | `-p rare` | rare edge hit queue에 집중 | 잘 안 가는 edge 탐색 |
| seek | `-p seek` | runtime/size 부담을 덜 고려 | 속도보다 경로 탐색 중심 |

### 7.7 성능 최적화 설정

| 설정 | 사용 예시 | 왜 많이 쓰는가 |
| --- | --- | --- |
| **Forkserver** | 기본 사용 | target을 매번 처음부터 실행하지 않고 fork 기반으로 빠르게 반복 실행 |
| **Persistent mode** | `__AFL_LOOP(1000)` | 하나의 프로세스에서 여러 입력을 처리해 실행 속도를 크게 높임 |
| **Testcase cache** | `AFL_TESTCACHE_SIZE=100` | RAM 여유가 있을 때 test case 캐싱으로 I/O 부담 감소 |
| **RAM disk / tmpdir** | `AFL_TMPDIR=/ramdisk` | 많은 파일 I/O를 RAM으로 돌려 디스크 부담 감소 |