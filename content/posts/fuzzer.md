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

# Fuzzing & Fuzzer 정리

---

## 1. Fuzzing이란?

Fuzzing은 프로그램에 다양한 입력값을 자동으로 넣어보면서 프로그램이 어떻게 반응하는지 관찰하는 소프트웨어 테스트 기법이다.

기본 흐름은 다음과 같다.

```text
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

여기서 중요한 점은 퍼징이 단순히 “아무 입력이나 넣어보는 것”으로 끝나지 않는다는 것이다. 현대적인 퍼저는 프로그램 실행 중 어떤 코드가 실행되었는지 관찰하고, 기존에 보지 못한 코드 경로를 발견한 입력을 다시 seed corpus에 저장한다. 이후 그 입력을 다시 변형하면서 점점 더 많은 분기와 깊은 로직을 탐색한다.

---

## 2. Fuzzing이 찾는 버그 유형

Fuzzing의 최종 목적은 입력 처리 과정에서 발생하는 버그를 자동으로 찾는 것이다. 프로그램은 파일, 문자열, HTTP 요청, JSON, XML, 이미지, 압축 파일, URL, 네트워크 패킷 등 다양한 외부 입력을 처리한다. 문제는 개발자가 모든 비정상 입력을 직접 예상하기 어렵다는 점이다.

퍼징으로 찾을 수 있는 대표적인 문제는 다음과 같다.

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

단, logic error는 crash처럼 자동으로 관찰되기 어렵다. 예를 들어 “정상 사용자는 접근하면 안 되는 기능에 접근 가능하다” 같은 문제는 프로그램이 비정상 종료되지 않을 수 있다. 이런 문제를 퍼징으로 찾으려면 assertion, invariant check, expected output 같은 **oracle**이 필요하다.

예를 들면 다음과 같다.

```c
assert(user_role != GUEST || admin_feature_enabled == false);
```

이런 검증 조건을 넣어두면 퍼저가 의도와 다른 상태를 만들었을 때 crash처럼 관찰할 수 있다.

---

## 3. Fuzzing의 기본 동작 원리

Coverage-guided fuzzing의 기본 루프는 다음과 같다.

```text
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

퍼저는 입력을 생성한 뒤 실행 결과만 확인하지 않는다. 해당 입력이 새로운 코드 블록, 분기, 함수, edge를 실행했는지 확인한다. 새로운 coverage를 유발한 입력은 의미 있는 입력으로 간주되어 corpus에 저장되고, 이후 변이의 재료로 다시 사용된다.

### 3.1 Seed Corpus

Seed corpus는 퍼징을 시작하기 위해 사용하는 초기 입력 집합이다. 예를 들어 JSON parser를 퍼징한다면 다음과 같은 JSON 파일을 seed로 사용할 수 있다.

```json
{"name":"test","age":20}
```

Seed corpus의 품질은 퍼징 효율에 직접적인 영향을 준다. 다양한 실행 경로를 유도할 수 있는 seed가 포함되어 있을수록 퍼저는 더 빠르게 넓은 코드 영역을 탐색할 수 있다.

나쁜 seed 예시는 다음과 같다.

```text
AAAA
```

좋은 seed 예시는 다음과 같다.

```json
{"name":"admin","age":20,"role":"user"}
```

대상이 JSON parser라면 두 번째 입력이 더 많은 parser 로직을 실행할 가능성이 높다.

### 3.2 Mutation

Mutation-based fuzzing은 기존 seed input을 조금씩 변형해 새로운 입력을 만드는 방식이다.

```text
원본 입력:
name=admin&age=20

변형 입력:
name=AAAAAA&age=20
name=admin&age=-1
name=admin&age=999999999999
name=%00%00%00&age=20
```

장점은 구현이 단순하고 범용성이 높다는 것이다. 단점은 입력 형식이 엄격한 대상에서는 변형 결과가 쉽게 무효 입력이 될 수 있다는 점이다.

### 3.3 Generation

Generation-based fuzzing은 입력 문법, 스키마, 프로토콜 명세를 기반으로 입력을 생성하는 방식이다. JSON, XML, JavaScript, SQL, 네트워크 프로토콜처럼 구조가 엄격한 입력은 단순 byte mutation만으로는 대부분 무효 입력이 될 수 있다. 이런 경우 grammar나 schema 기반 생성 방식이 더 효과적이다.

예를 들어 HTTP 요청을 퍼징한다면 단순히 랜덤 바이트를 만드는 것보다 다음과 같은 구조를 유지하면서 변형하는 편이 유리하다.

```http
GET /search?q=test HTTP/1.1
Host: example.com
User-Agent: fuzz
```

### 3.4 Target Execution

Target execution은 생성된 입력을 실제 테스트 대상 프로그램에 전달해 실행하는 단계이다. 입력 전달 방식은 대상에 따라 다르다.

| 방식 | 예시 |
| --- | --- |
| 파일 입력 | `./target input.txt` |
| AFL++ 파일 치환 | `./target @@` |
| 표준 입력 | `cat input.txt | ./target` |
| 함수 호출 | `LLVMFuzzerTestOneInput(data, size)` |
| 네트워크 입력 | socket, HTTP request, protocol message |

### 3.5 Coverage Feedback

Coverage feedback은 퍼징 중 수집되는 코드 실행 범위 정보를 의미한다. 특정 입력이 어떤 코드 블록, 분기, 함수, edge를 실행했는지 추적하고, 새로운 coverage를 유발한 입력을 corpus에 저장한다.

Seed corpus가 퍼징의 출발점이라면, coverage feedback은 퍼저가 어느 방향으로 더 탐색해야 하는지 알려주는 기준이다.

### 3.6 Crash / Hang / Sanitizer Error

퍼저는 실행 결과에서 다음과 같은 문제를 확인한다.

```text
Crash: 프로그램 비정상 종료
Hang: 프로그램이 멈춤
Timeout: 처리 시간이 초과됨
Sanitizer Error: 메모리 오류, undefined behavior 등 탐지
```

여기서 sanitizer error가 중요한 이유는, 모든 메모리 오류가 즉시 crash로 이어지지는 않기 때문이다. Sanitizer를 결합하면 조용히 지나갈 수 있는 메모리 오류를 퍼저가 관찰 가능한 오류로 바꿀 수 있다.

---

## 4. Fuzzing의 분류

퍼징 분류는 서로 배타적인 개념이 아니다. 예를 들어 AFL++는 일반적으로 coverage-guided grey-box fuzzer이면서 mutation-based fuzzer로 사용할 수 있다.

### 4.1 내부 정보 활용 정도에 따른 분류

| 종류 | 설명 | 장점 | 한계 |
| --- | --- | --- | --- |
| Black-box Fuzzing | 대상 내부 구조를 모른 채 입력과 결과만 보고 테스트 | 소스코드가 없어도 가능 | coverage feedback이 없어 탐색 효율이 낮을 수 있음 |
| Grey-box Fuzzing | coverage 같은 일부 실행 정보를 활용 | 효율과 현실성의 균형이 좋음 | 제어 흐름 정보는 활용하지만 프로그램의 의미나 조건식을 완전히 해석하지는 못함 |
| White-box Fuzzing | 소스코드, 조건식, 제어 흐름, symbolic execution 등을 활용 | 깊은 경로 탐색에 유리 | 분석 비용이 크고 확장성이 낮을 수 있음 |

### 4.2 입력 생성 방식에 따른 분류

| 종류 | 설명 | 장점 | 한계 |
| --- | --- | --- | --- |
| Mutation-based Fuzzing | 기존 seed를 변형해 새로운 입력 생성 | 구현이 단순하고 범용성이 높음 | 입력 형식이 복잡한 대상에서는 무효 입력이 많이 생성될 수 있음 |
| Generation-based Fuzzing | 문법, 스키마, 프로토콜 명세 기반으로 입력 생성 | 구조가 엄격한 입력에 효과적 | 입력 모델이나 grammar를 정의해야 하므로 초기 준비 비용이 큼 |

---

## 5. Fuzz Target과 Harness

Fuzz target은 퍼저가 생성한 입력을 테스트 대상 코드에 전달하는 진입점이다. Harness는 퍼저의 입력 형식과 실제 테스트 대상 API 사이를 연결하는 코드이다.

### 5.1 AFL++에서의 target

AFL++는 보통 실행 파일을 대상으로 한다. 입력은 파일 또는 stdin으로 전달할 수 있다.

| 방식 | 예시 | 설명 |
| --- | --- | --- |
| 파일 기반 target | `afl-fuzz -i seeds -o out -- ./target @@` | `@@` 자리에 AFL++가 생성한 입력 파일 경로가 들어감 |
| stdin 기반 target | `afl-fuzz -i seeds -o out -- ./target` | target이 표준 입력으로 데이터를 읽을 때 사용 |
| harness 기반 target | `./harness @@` | 파일을 읽어서 특정 라이브러리/API에 전달하는 중간 프로그램 작성 |

예를 들어 어떤 라이브러리의 `parse()` 함수를 테스트하고 싶다면, AFL++가 만든 입력 파일을 읽어서 `parse()`에 넘기는 작은 harness를 작성할 수 있다.

```c
#include <stdio.h>
#include <stdlib.h>

extern int parse(const unsigned char *data, size_t size);

int main(int argc, char **argv) {
    if (argc < 2) return 1;

    FILE *fp = fopen(argv[1], "rb");
    if (!fp) return 1;

    fseek(fp, 0, SEEK_END);
    long size = ftell(fp);
    rewind(fp);

    if (size <= 0 || size > 1024 * 1024) {
        fclose(fp);
        return 0;
    }

    unsigned char *buf = malloc(size);
    if (!buf) {
        fclose(fp);
        return 1;
    }

    fread(buf, 1, size, fp);
    fclose(fp);

    parse(buf, size);

    free(buf);
    return 0;
}
```

### 5.2 libFuzzer에서의 target

libFuzzer는 테스트 대상 라이브러리와 같은 프로세스 안에서 동작하는 in-process coverage-guided fuzzer이다. 입력은 파일 경로가 아니라 byte array 형태로 target function에 전달된다.

기본 형태는 다음과 같다.

```c
#include <stdint.h>
#include <stddef.h>

extern int parse(const uint8_t *data, size_t size);

extern "C" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    parse(data, size);
    return 0;
}
```

즉, AFL++의 target은 실행 파일 중심이고, libFuzzer의 target은 특정 함수/API 중심이라고 이해하면 된다.

| 구분 | AFL++ | libFuzzer |
| --- | --- | --- |
| 실행 방식 | 별도 프로세스 실행 중심 | in-process 실행 |
| 입력 전달 | 파일, stdin, `@@` | `LLVMFuzzerTestOneInput(data, size)` |
| 적합 대상 | CLI 프로그램, file parser, native binary | 라이브러리 함수, parser API |
| 장점 | 범용성이 높음 | 함수 단위 반복 실행이 빠름 |

---

## 6. Sanitizer

퍼징은 crash만 찾는 것이 아니다. Sanitizer와 결합하면 숨어 있는 메모리 오류를 crash처럼 관찰 가능하게 만들 수 있다.

모든 메모리 오류가 즉시 crash로 이어지는 것은 아니다. 예를 들어 out-of-bounds read가 발생했지만 우연히 접근 가능한 메모리 영역을 읽었다면 프로그램은 계속 실행될 수 있다. 이 경우 sanitizer가 없다면 퍼저는 문제를 놓칠 수 있다.

Sanitizer는 프로그램 실행 중 메모리 접근, 정수 연산, undefined behavior, thread race 등을 감시하는 도구이다.

| Sanitizer | 탐지 대상 |
| --- | --- |
| AddressSanitizer, ASan | buffer overflow, use-after-free, invalid free 등 |
| UndefinedBehaviorSanitizer, UBSan | undefined behavior, 잘못된 포인터 정렬, 일부 정수 관련 문제 등 |
| MemorySanitizer, MSan | 초기화되지 않은 메모리 읽기 |
| LeakSanitizer, LSan | memory leak |
| ThreadSanitizer, TSan | data race |

주의할 점은 보안 웹 분야에서 말하는 sanitizer와 퍼징에서 말하는 sanitizer가 다르다는 것이다.

| 구분 | 의미 |
| --- | --- |
| 웹 보안의 sanitizer | XSS 방지를 위해 HTML/JavaScript/URL 입력을 정제하는 필터 |
| 퍼징의 sanitizer | 프로그램 실행 중 메모리 오류나 undefined behavior를 감지하는 런타임 검사 도구 |

둘 다 “위험한 상태를 줄이거나 드러낸다”는 공통점은 있지만, 역할은 다르다.

---

## 7. 주요 Fuzzer 비교

| 구분 | AFL++ | libFuzzer | Jackalope |
| --- | --- | --- | --- |
| 분류 | Coverage-guided grey-box fuzzer | In-process coverage-guided fuzzer | Binary coverage-guided fuzzer |
| 주요 대상 | Native program, file parser, CLI 프로그램 | Library function, API, parser | Black-box binary |
| 소스코드 필요성 | 있으면 유리, QEMU/Frida 등으로 일부 binary-only 가능 | 일반적으로 소스코드 또는 빌드 제어권 필요 | 소스코드 없이 사용 가능 |
| 입력 전달 방식 | file, stdin, `@@` | byte array entrypoint | file 또는 shared memory |
| 강점 | 범용성 높고 기능 다양 | 함수 단위 테스트가 빠름 | closed-source binary 대상 가능 |
| 한계 | target 구성과 harness가 필요할 수 있음 | entrypoint 작성 필요 | 설정과 target 구성이 비교적 어려움 |

### 7.1 AFL++

AFL++는 coverage-guided grey-box fuzzer이다. 타겟 프로그램에 계측을 삽입하거나, QEMU/Frida 같은 동적 계측 방식을 사용해 coverage를 수집한다. 새로운 edge coverage를 발견한 입력을 queue에 저장하고, 이후 그 입력을 다시 변형하면서 새로운 경로를 탐색한다.

### 7.2 libFuzzer

libFuzzer는 LLVM 프로젝트의 in-process coverage-guided fuzzing engine이다. 테스트 대상 라이브러리와 같은 프로세스 안에서 동작하며, `LLVMFuzzerTestOneInput` 같은 특정 fuzzing entrypoint를 통해 입력을 전달한다. 함수 단위 fuzzing에 적합하다.

### 7.3 Jackalope

Jackalope는 Google Project Zero에서 공개한 customizable, distributed, coverage-guided fuzzer이다. black-box binary를 대상으로 사용할 수 있다는 점이 특징이다. Windows, macOS, Linux, Android 같은 다양한 환경의 바이너리 퍼징을 목표로 한다.

---

## 8. 심층 분석 - AFL++

AFL++는 대표적인 coverage-guided grey-box fuzzer이다. 프로그램의 내부 의미를 완전히 해석하는 것은 아니지만, 실행 중 수집되는 coverage 정보를 이용해 더 많은 코드 경로를 탐색한다.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                              AFL++ 퍼징 루프                                  │
│                                                                              │
│  ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐     │
│  │   시드 코퍼스    │ ───▶ │   입력 스케줄러  │ ───▶ │    변이 엔진     │     │
│  │ 초기 입력 파일들 │       │ 파워 스케줄 선택 │       │ Havoc/Splice/CMP │     │
│  └─────────────────┘       └─────────────────┘       └─────────────────┘     │
│          ▲                                               │                   │
│          │                                               ▼                   │
│          │        ┌──────────────────────────────────────────────┐           │
│          │        │              계측 레이어                      │           │
│          │        │ Instrumentation / QEMU / Frida / Unicorn     │           │
│          │        └──────────────────────────────────────────────┘           │
│          │                    │                         │                   │
│          │                    ▼                         ▼                   │
│          │        ┌─────────────────┐      ┌─────────────────┐              │
│          │        │   타겟 프로세스  │      │    오류 감지     │              │
│          │        │ forkserver      │      │ ASan/UBSan/Signal│              │
│          │        │ persistent      │      └─────────────────┘              │
│          │        └─────────────────┘                │                      │
│          │                    │                      ▼                      │
│          │                    ▼          ┌──────────────────────┐           │
│          │        ┌─────────────────┐    │  큐 & 크래시 저장     │           │
│          └─────── │ 공유 메모리      │    │ queue/crashes/hangs  │           │
│   feedback loop   │ coverage bitmap │    └──────────────────────┘           │
│                   └─────────────────┘                │                      │
│                              ▲                       │                      │
│                              └──────── feedback ─────┘                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 핵심 동작 원리

AFL++의 기본 흐름은 다음과 같다.

```text
계측(Instrumentation) → 실행(Target Execution) → 피드백(Coverage Feedback) → 변이(Mutation) → 반복
```

1. 타겟 바이너리를 컴파일할 때 분기(edge)마다 coverage 계측 코드를 삽입한다.
2. 퍼저가 입력을 실행할 때마다 어떤 edge가 실행되었는지 공유 메모리 bitmap에 기록한다.
3. 기존에 보지 못한 coverage를 발견하면 해당 입력을 queue에 저장한다.
4. 저장된 입력은 이후 mutation의 seed로 사용된다.

### 8.2 Instrumentation

Instrumentation은 타겟 프로그램의 실행 정보를 수집하기 위해 코드나 실행 환경에 계측을 삽입하는 과정이다.

| 모드 | 소스 코드 필요 여부 | 핵심 설명 | 장점 | 사용 상황 |
| --- | --- | --- | --- | --- |
| LLVM-PCGuard / LLVM mode | 필요 | Clang/LLVM으로 컴파일할 때 coverage 계측 코드 삽입 | 빠르고 coverage 정확도가 높음 | 소스코드가 있는 C/C++ 프로그램 |
| LTO mode | 필요 | Link Time Optimization 단계에서 계측 | 성능과 coverage 측면에서 권장되는 경우가 많음 | Clang/LLVM 기반 프로젝트 |
| GCC Plugin | 필요 | GCC plugin을 이용해 coverage 계측 코드 삽입 | GCC 기반 프로젝트에서도 AFL++ 사용 가능 | GCC 기반 프로젝트 |
| QEMU Mode | 불필요 | 이미 컴파일된 Linux ELF 바이너리를 QEMU user-mode로 실행하며 coverage 수집 | 소스코드 없이 가능 | binary-only Linux ELF |
| Frida Mode | 불필요 | Frida를 이용해 실행 중 동적 계측 삽입 | 모바일, 동적 라이브러리, 특정 함수 hook에 유리 | Android/iOS/macOS, 동적 라이브러리 |
| Unicorn Mode | 불필요 | Unicorn Engine으로 특정 CPU 명령어 범위를 에뮬레이션 | OS 없이 코드 조각 단위 퍼징 가능 | 펌웨어, 임베디드 코드 |
| Nyx / Snapshot | 보통 불필요 | VM/KVM 기반 snapshot을 저장하고 빠르게 복원 | 커널/OS 수준 퍼징에서 반복 실행 비용 감소 | 커널, OS, 드라이버 |

### 8.3 Forkserver

Forkserver는 타겟을 매번 `execve()`로 새로 실행하지 않고, 초기화가 끝난 프로세스를 기준으로 `fork()`해서 테스트 케이스를 실행하는 방식이다.

일반 실행 방식은 매번 다음 비용이 발생한다.

```text
execve() → dynamic linking → libc 초기화 → main 실행 → 입력 처리
```

Forkserver 방식은 초기화 비용을 한 번만 지불한 뒤, 이후에는 copy-on-write 기반으로 빠르게 복제한다.

```text
초기화 완료 상태
      ↓
fork()
      ↓
입력 처리
      ↓
종료 후 다음 입력에서 다시 fork()
```

이 방식은 프로세스 생성 오버헤드를 크게 줄여 퍼징 속도를 높인다.

### 8.4 Persistent Mode

Persistent mode는 하나의 fork된 프로세스 안에서 여러 입력을 연속 처리하는 방식이다.

```c
while (__AFL_LOOP(1000)) {
    // 입력 읽기
    // target function 호출
    // 상태 초기화
}
```

매 입력마다 fork하지 않아도 되기 때문에 forkserver보다 더 빠를 수 있다. 단, target function이 반복 호출되어도 내부 상태가 오염되지 않도록 reset/free 처리를 확실히 해야 한다. 상태 초기화가 부정확하면 false positive나 재현 불가능한 crash가 발생할 수 있다.

### 8.5 공유 메모리 Bitmap

AFL++는 타겟이 실행 중 기록한 coverage 정보를 shared memory bitmap을 통해 읽는다. 파일, 소켓, 복잡한 IPC를 사용하지 않고 메모리에 직접 기록하므로 coverage 전달 비용이 작다.

예전 AFL 문맥에서는 64KB map이 자주 언급되지만, AFL++에서는 `AFL_MAP_SIZE` 등으로 coverage map 크기를 조정할 수 있다. 따라서 고정적으로 “64KB edge map”이라고 단정하기보다는 “shared memory coverage bitmap”이라고 설명하는 것이 더 안전하다.

---

## 9. AFL++ Mutation 전략

### 9.1 Deterministic Mutations

Deterministic mutation은 입력을 정해진 순서대로, 정해진 방식으로 바꿔보는 단계이다.

| 변이 | 설명 | 특징 | 예시 |
| --- | --- | --- | --- |
| Bitflip | 입력의 특정 비트를 반전 | 작은 변화로 새로운 조건 만족 여부 확인 | `0x41(A)` → `0x40(@)` |
| Arithmetic | 일부 바이트를 정수로 보고 값을 증가/감소 | 길이, 개수, offset 필드 테스트에 효과적 | `len=16` → `len=17` |
| Interesting Values | 특수한 경계값 삽입 또는 덮어쓰기 | 경계값 테스트에 효과적 | `0`, `1`, `127`, `128`, `255`, `0xffff` |

### 9.2 Stochastic Mutations

Stochastic mutation은 무작위로 여러 변이를 조합하는 방식이다.

| 변이 | 설명 | 특징 | 예시 |
| --- | --- | --- | --- |
| Havoc | 여러 변이를 랜덤하게 조합 | 입력을 크게 흔들어 새로운 coverage 탐색 | 바이트 변경 + 블록 삭제 + 랜덤 삽입 |
| Splice | 서로 다른 두 seed input을 잘라 합침 | 기존 입력들의 유효한 구조 조합 | Seed A 앞부분 + Seed B 뒷부분 |

### 9.3 CmpLog / RedQueen

CmpLog와 RedQueen은 비교 연산을 넘기기 위해 유용한 기능이다. 프로그램 내부에는 다음과 같은 조건문이 자주 존재한다.

```c
if (memcmp(buf, "MAGIC", 5) == 0) {
    deep_function(buf);
}
```

단순 mutation만으로 `MAGIC`이라는 정확한 문자열을 맞히기는 어렵다. CmpLog는 `cmp`, `strcmp`, `memcmp` 같은 비교 연산에서 어떤 값과 비교하는지 기록하고, 이 정보를 mutation에 활용한다. 이를 통해 magic bytes, protocol header, command keyword 같은 장벽을 더 빠르게 통과할 수 있다.

---

## 10. AFL++ Power Schedule

Power schedule은 어떤 seed에 mutation 기회를 얼마나 줄지 결정하는 알고리즘이다. 이때 mutation 기회를 흔히 energy라고 부른다.

주의할 점은 AFL++의 기본 schedule은 `explore`라는 점이다. `fast`도 많이 쓰이는 schedule이지만 기본값으로 설명하면 안 된다.

| 설정 | 의미 | 사용 상황 |
| --- | --- | --- |
| `-p explore` | 기본 schedule. 넓은 탐색을 목표로 함 | 일반적인 기본 선택 |
| `-p fast` | 저빈도 path에 더 많은 energy를 부여 | 희귀 경로 탐색 |
| `-p coe` | cut-off exponential schedule | 고빈도 seed 편중 완화 |
| `-p quad` | quadratic schedule | 실험적 schedule 비교 |
| `-p lin` | linear schedule | 실험적 schedule 비교 |
| `-p exploit` | AFL 방식의 exploitation 중심 schedule | 이미 발견한 유망 seed 집중 |
| `-p mmopt` | runtime weighting을 줄이고 최근 queue 항목에 더 높은 가중치 부여 | 새 queue 중심 탐색 |
| `-p rare` | rare edge를 hit한 queue에 집중 | 잘 안 가는 edge 탐색 |
| `-p seek` | runtime/size 부담을 덜 고려 | 속도보다 경로 탐색 중심 |

기존 글에서 `mmopt`를 강화학습 기반 전략이라고 표현하면 부정확하다. 공식 설명 기준으로는 최근 queue entry에 더 많은 가중치를 주는 experimental schedule로 이해하는 것이 적절하다.

---

## 11. AFL++ 병렬 퍼징

AFL++는 하나의 main 인스턴스와 여러 secondary 인스턴스를 같은 output directory에 연결하여 병렬화할 수 있다.

```bash
# main fuzzer
afl-fuzz -i seeds -o out -M main -- ./target @@

# secondary fuzzer 1
afl-fuzz -i seeds -o out -S sec01 -p fast -- ./target @@

# secondary fuzzer 2
afl-fuzz -i seeds -o out -S sec02 -p explore -- ./target @@
```

각 인스턴스는 독립적으로 입력을 변이하고 coverage를 탐색한다. 생성된 queue는 같은 `-o` 디렉터리를 통해 동기화된다. 인스턴스별로 서로 다른 power schedule, sanitizer, CmpLog, dictionary 등을 적용하면 탐색 다양성을 높일 수 있다.

주의할 점은 인스턴스 이름이 충돌하면 안 된다는 것이다. `main`, `sec01`, `sec02`처럼 고유한 이름을 사용해야 한다.

---

## 12. AFL++ 주요 사용 설정

### 12.1 계측 빌드 설정

소스코드가 있는 경우 AFL++ compiler wrapper로 target을 빌드한다.

| 설정 종류 | 대표 설정 | 의미 | 사용 상황 |
| --- | --- | --- | --- |
| LTO mode | `CC=afl-clang-lto` | Link Time Optimization 기반 계측 | Clang/LLVM 기반 프로젝트 |
| LLVM mode | `CC=afl-clang-fast` | LLVM 기반 coverage 계측 | LTO가 어렵지만 Clang 빌드 가능할 때 |
| GCC Plugin mode | `CC=afl-gcc-fast` | GCC plugin 기반 계측 | GCC 기반 프로젝트 |
| C++ LTO mode | `CXX=afl-clang-lto++` | C++ target용 LTO 계측 | C++ 프로젝트 |
| C++ LLVM mode | `CXX=afl-clang-fast++` | C++ target용 LLVM 계측 | C++ 프로젝트 |
| 모드 직접 지정 | `AFL_CC_COMPILER=LTO` | `afl-cc`에 계측 모드 지정 | symlink 대신 환경변수로 제어할 때 |

예시는 다음과 같다.

```bash
CC=afl-clang-lto ./configure
make
```

ASan까지 같이 쓰고 싶다면 빌드 시점에 다음처럼 설정한다.

```bash
AFL_USE_ASAN=1 CC=afl-clang-lto ./configure
AFL_USE_ASAN=1 make
```

여기서 `CC=afl-clang-lto`는 C compiler를 AFL++의 compiler wrapper로 지정한다는 뜻이다. `AFL_USE_ASAN=1`은 AFL++ wrapper가 AddressSanitizer 옵션을 함께 넣어 빌드하도록 지시한다. 즉, 첫 번째 명령은 “AFL++ 계측만 넣어 빌드 준비”이고, 두 번째 명령은 “AFL++ 계측 + ASan 런타임 검사를 함께 넣어 빌드 준비”라고 이해하면 된다.

### 12.2 Binary-only 계측 설정

소스코드가 없는 경우 컴파일 타임 계측을 넣을 수 없으므로 QEMU, Frida, Unicorn, Nyx 같은 방식을 사용한다.

| 설정 종류 | 대표 설정 | 의미 | 사용 상황 |
| --- | --- | --- | --- |
| QEMU mode | `afl-fuzz -Q ...` | Linux 바이너리를 QEMU user-mode로 실행하며 coverage 수집 | 소스코드 없는 Linux ELF 바이너리 |
| Frida mode | `afl-fuzz -O ...` | Frida 기반 동적 계측 | macOS, Android, iOS, 동적 라이브러리 |
| Nyx mode | Nyx mode 설정 | KVM/QEMU 기반 snapshot fuzzing | OS, 커널, 드라이버 수준 |
| Unicorn mode | Unicorn mode 설정 | 특정 코드 범위를 에뮬레이션 | 펌웨어, 임베디드 코드 |

### 12.3 기본 실행 설정

| 설정 | 사용 예시 | 의미 |
| --- | --- | --- |
| Seed corpus | `-i seeds` | 초기 입력 파일들이 들어 있는 디렉터리 |
| Output directory | `-o out` | queue, crashes, hangs가 저장되는 디렉터리 |
| 파일 입력 치환 | `./target @@` | `@@` 자리에 AFL++가 생성한 입력 파일 경로가 들어감 |
| stdin 입력 | `afl-fuzz -i seeds -o out -- ./target` | target이 표준 입력으로 데이터를 읽을 때 사용 |
| 파일 기반 실행 | `afl-fuzz -i seeds -o out -- ./target @@` | 파일 기반 target 퍼징의 기본 형태 |

### 12.4 Sanitizer 설정

| 설정 종류 | 대표 설정 | 탐지 대상 | 사용 상황 |
| --- | --- | --- | --- |
| AddressSanitizer | `AFL_USE_ASAN=1` | buffer overflow, use-after-free 등 | C/C++ 메모리 오류 탐지 |
| UndefinedBehaviorSanitizer | `AFL_USE_UBSAN=1` | undefined behavior | UB 탐지 |
| MemorySanitizer | `AFL_USE_MSAN=1` | uninitialized memory read | 초기화되지 않은 메모리 사용 탐지 |
| ThreadSanitizer | `AFL_USE_TSAN=1` | thread race condition | 멀티스레드 target |
| LeakSanitizer | `AFL_USE_LSAN=1` | memory leak | 누수 탐지 |
| Control Flow Integrity Sanitizer | `AFL_USE_CFISAN=1` | CFI violation, type confusion 등 | CFI 위반 확인 |
| Hardening | `AFL_HARDEN=1` | 일부 non-crashing memory bug | stack protector, FORTIFY_SOURCE 적용 |

### 12.5 Dictionary 설정

AFL++ dictionary는 입력 포맷의 token 힌트를 제공한다. HTTP, SQL, JSON, XML처럼 특정 키워드나 구분자가 중요한 포맷에서 효과적이다.

| 설정 | 사용 예시 | 왜 많이 쓰는가 |
| --- | --- | --- |
| 수동 dictionary | `-x http.dict` | 문법이 있는 입력에서 유효한 token을 넣기 위해 사용 |
| LTO autodictionary | `afl-clang-lto` 빌드 시 자동 활용 | 문자열 비교 기반 dictionary 자동 생성으로 coverage 향상 가능 |
| 자동 dictionary 비활성화 | `AFL_NO_AUTODICT=1` | 자동 dictionary를 쓰고 싶지 않을 때 사용 |

### 12.6 성능 최적화 설정

| 설정 | 사용 예시 | 왜 많이 쓰는가 |
| --- | --- | --- |
| Forkserver | 기본 사용 | target을 매번 처음부터 실행하지 않고 fork 기반으로 빠르게 반복 실행 |
| Persistent mode | `__AFL_LOOP(1000)` | 하나의 프로세스에서 여러 입력을 처리해 실행 속도 향상 |
| Testcase cache | `AFL_TESTCACHE_SIZE=100` | RAM 여유가 있을 때 testcase 캐싱으로 I/O 부담 감소 |
| RAM disk / tmpdir | `AFL_TMPDIR=/ramdisk` | 많은 파일 I/O를 RAM으로 돌려 디스크 부담 감소 |

---

## 13. 어떤 상황에서 어떤 Fuzzer를 선택할까?

| 상황 | 추천 도구 | 이유 |
| --- | --- | --- |
| C/C++ CLI 프로그램, 파일 파서 퍼징 | AFL++ | 파일 입력 기반 target에 강하고 기능이 많음 |
| 라이브러리 함수/API 단위 퍼징 | libFuzzer | in-process 방식이라 함수 단위 반복 실행이 빠름 |
| 소스코드가 없는 Linux ELF 바이너리 | AFL++ QEMU mode | binary-only target에 coverage-guided fuzzing 적용 가능 |
| 모바일 앱, 동적 라이브러리 | AFL++ Frida mode | 동적 계측과 hook에 유리 |
| closed-source binary 중심 퍼징 | Jackalope | black-box binary 대상으로 설계됨 |
| 구조가 엄격한 입력 포맷 | grammar-based fuzzer 또는 dictionary 적용 AFL++ | 단순 mutation만으로는 유효 입력 생성이 어려움 |

개인적으로 정리하면 다음과 같다.

- 처음 퍼징을 공부한다면 AFL++로 CLI target을 퍼징해보는 것이 좋다.
- 라이브러리 내부 함수를 직접 호출할 수 있다면 libFuzzer가 효율적이다.
- 소스코드가 없다면 AFL++ QEMU/Frida mode나 Jackalope 같은 binary fuzzing 도구를 고려한다.
- JSON, XML, JavaScript, SQL처럼 구조가 중요한 입력은 dictionary나 grammar를 함께 사용하는 것이 좋다.

---

## 14. 정리

Fuzzing은 단순히 랜덤 입력을 넣어 crash를 찾는 기법이 아니다. 현대적인 fuzzing은 coverage feedback을 이용해 새로운 코드 경로를 발견한 입력을 저장하고, 이를 다시 변이하면서 더 깊은 로직을 탐색한다.

또한 sanitizer와 결합하면 일반 실행에서는 조용히 지나갈 수 있는 memory corruption, undefined behavior, memory leak 등을 관찰 가능한 오류로 만들 수 있다.

AFL++는 범용성이 높고 다양한 instrumentation mode, mutation strategy, power schedule, sanitizer 연동을 지원하는 대표적인 coverage-guided grey-box fuzzer이다. libFuzzer는 함수/API 단위의 in-process fuzzing에 강하고, Jackalope는 black-box binary fuzzing에 초점을 둔 도구이다.

이번 정리를 통해 퍼징을 다음처럼 이해할 수 있었다.

```text
좋은 seed를 준비하고,
coverage feedback을 기준으로 의미 있는 입력을 저장하며,
sanitizer로 숨어 있는 오류를 드러내고,
crash를 재현한 뒤 원인을 분석하는 과정
```

따라서 좋은 퍼징 결과물은 “crash를 찾았다”에서 끝나지 않는다. 어떤 입력이 어떤 경로를 열었고, 어떤 코드에서 어떤 오류가 발생했으며, 이것이 실제 취약점으로 이어질 수 있는지를 설명할 수 있어야 한다.

---

## 참고자료

- AFL++ 공식 문서 - Power Schedules: https://aflplus.plus/docs/power_schedules/
- AFL++ 공식 문서 - Environment Variables: https://aflplus.plus/docs/env_variables/
- AFL++ 공식 문서 - Notes for using ASAN with afl-fuzz: https://aflplus.plus/docs/notes_for_asan/
- AFL++ GitHub - Fuzzing in Depth: https://github.com/AFLplusplus/AFLplusplus/blob/stable/docs/fuzzing_in_depth.md
- LLVM 공식 문서 - libFuzzer: https://llvm.org/docs/LibFuzzer.html
- Google Project Zero GitHub - Jackalope: https://github.com/googleprojectzero/Jackalope
