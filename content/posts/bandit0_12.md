---
title: "bandit write up 1"
summary: "bandit"
date: "2026-04-15"
category: "ctf"
section: "security"
badge: "Wargame"
badgeTone: "ctf"
ctfGroup: "wargame"
tags:
  - CLI
  - WSL
statLabel: "Level"
statValue: "0-12"
heroEyebrow: "$ cat content/posts/bandit0_12.md"
heroAvatar: "CTF"
---

# bandit 0~12

# WSL 설치

- WSL 기존에 이미 설치되어 있었기에 생략 하겠습니다.

# write up

## Level 0

![image.png](/images/bandit1/image.png)

- Ssh를 사용하여 로그인 하라고 합니다.
- WLS에서 ssh -p 2220 [bandit0@bandit.labs.overthewire.org] 입력
- 게임 접속이 가능해지고 비밀번호 bandit0를 입력하면 해결

![image.png](/images/bandit1/image%201.png)

## Level 0 > 1

![image.png](/images/bandit1/image%202.png)

- 홈 디렉터리에 있는 **readme** 라는 파일을 읽으면 되는 문제이다.
- Cat 명령어를 사용해서 readme의 내용을 출력하면 된다.

![image.png](/images/bandit1/image%203.png)

## Level 1 > 2

![image.png](/images/bandit1/image%204.png)

- 이전 문제와 같이 파일 내용을 읽으면 되는 문제이다.
- 하지만 파일 이름이 – 로 되어 있어 파일로 인식이 안되고 명령어로 인식된다

![image.png](/images/bandit1/image%205.png)

![image.png](/images/bandit1/image%206.png)

- 이를 해결하기 위해서는 현재 경로에서 파일로 받아들이게 하는 ./ 를 먼저 쓰고 – 를 써 cat 명령어를 실행시키면 된다.
    
    ![image.png](/images/bandit1/image%207.png)
    
- 또한 < 기호를 사용하여 – 파일 출력을 cat 명령어로 전달하면 된다.
    
    ![image.png](/images/bandit1/image%208.png)
    

## Level 2 > 3

![image.png](/images/bandit1/image%209.png)

- 이전 문제와 동일하게 파일 내용을 읽는 문제이다

![image.png](/images/bandit1/image%2010.png)

- 해당 파일 또한  -- 가 앞에 있어 명령어로 취급되어 실행 되지 않는다.

![image.png](/images/bandit1/image%2011.png)

- 이전 문제에서 사용했던 방법을 사용하였지만 파일 이름에 공백이 있어서 명령어가 제대로 실행되지 않는다.
- 쉘은 **공백을 인자 구분자**로 본다.
- 공백 앞에 \를 넣으면 공백이 **구분자 역할을 하지 않고 문자 자체**로 취급된다.

![image.png](/images/bandit1/image%2012.png)

- 추가로 ./ 입력 후 tap을 두 번 누르면 현재 디렉토리에서 가능한 파일/디렉토리 목록을 보여준다
- 파일명 앞 부분까지 입력 후 Tab 누르면 bash가 현재 디렉토리에서 그 문자열로 시작하는 파일명을 찾아 자동 완성해 준다.

![image.png](/images/bandit1/image%2013.png)

## Level 3 > 4

![image.png](/images/bandit1/image%2014.png)

- Inhere 디렉토리에 숨겨진 파일을 읽는 문제이다.

![image.png](/images/bandit1/image%2015.png)

- Inhere 디렉토리에서 ls을 쳐 봤지만 아무런 파일도 나오지 않는다
- 그렇기 때문에 ls에서 모든 현재 디렉토리의 파일을 **숨김 파일까지 포함해서 자세히 보여주는 옵션 -al 를 붙여서 명령어를 실행하면** 숨겨진 파일이 보인다.

![image.png](/images/bandit1/image%2016.png)

- Cat 명령어 이용해 파일 내용 추출

![image.png](/images/bandit1/image%2017.png)

## Level 4 > 5

![image.png](/images/bandit1/image%2018.png)

- the only human-readable file 사람이 읽을 수 있는 파일을 읽으라고 한다.

![image.png](/images/bandit1/image%2019.png)

- 많은 파일 중에서 the only human-readable file을 찾아내는 문제이다
- File 명령어를 사용하면 해당 파일의 내용이 어떤 걸로 이루어져 있는지 나타내 준다(data, ASCII 등)
    
    ![image.png](/images/bandit1/image%2020.png)
    
- 따라서 현재 디렉토리에 있는 모든 파일을 확인해야 하는데
- ./-*는 현재 디렉토리에서 -로 시작하는 모든 파일을 나타내기 때문에
- file ./-* 통해 디렉토리에 모든 파일을 검색할 수 있다.

![image.png](/images/bandit1/image%2021.png)

- 7번째 파일이 ASCII text기 때문에 cat 명령어를 이용해 추출

![image.png](/images/bandit1/image%2022.png)

## Level 5 > 6

![image.png](/images/bandit1/image%2023.png)

- 사람이 읽을 수 있고, 1033바이트에 실행 불가능한 파일을 찾아 읽으라고 한다.
- Find 명령어는 파일 시스템에서 특정 조건(이름, 크기, 시간, 권한 등)에 맞는 파일이나 디렉터리를 검색하는 기능을 한다.
- -help 를 통해 옵션들을 살펴 보면 size와 -perm 옵션이 있다
    
    ![image.png](/images/bandit1/image%2024.png)
    
    - size : 뒤에 입력한 사이즈 값에 파일을 찾겠다
    - perm : 뒤에 입력한 권한의 파일을 찾겠다
- 따라서 두 옵션을 사용하여 요구에 맞는 파일을 찾아주면 된다.
    
    ![image.png](/images/bandit1/image%2025.png)
    
    - -size 1033c : 1033바이트
    - ! -perm /111 : 실행 권한 없음
    
    ![image.png](/images/bandit1/image%2026.png)
    

## Level 6 > 7

![image.png](/images/bandit1/image%2027.png)

- 서버 어딘가에 해당 조건에 맞는 파일을 찾는 문제이다
    - 사용자 bandit7 소유
    - 그룹 bandit6 소유
    - 크키 33바이트
- find 명령어의 옵션에서 3개의 옵션을 확인해보면
    
    ![image.png](/images/bandit1/image%2028.png)
    
    - -user : 뒤에 입력한 사용자가 소유한 파일 찾겠다
    - -group : 뒤에 입력한 그룹이 소유한 파일 찾겠다
    - -size : 뒤에 입력한 크기에 파일 찾겠다
- home 디렉토리에는 찾지 못하였음으로 루트로 이동해 명령어 입력
    
    ![image.png](/images/bandit1/image%2029.png)
    
- **현재 위치에서 읽을 권한이 없는 디렉터리나 파일에 들어가 검색하기 `Permission denied` 이 뜸**
- `2>/dev/null` 를 뒤에 입력하여  권한 에러 숨겨서 보기 쉽게한다.
- `find -user bandit7 -group bandit6 -size 33 2>/dev/null`
    
    ![image.png](/images/bandit1/image%2030.png)
    
- cat을 통해 파일 내용 추출
    
    ![image.png](/images/bandit1/image%2031.png)
    

## Level 7 > 8

![image.png](/images/bandit1/image%2032.png)

- 비밀번호는 data.txt 파일의 “millionth”라는 단어 옆에 저장되어 있다고 한다.
- data.txt 파일에 경우 많은 내용이 저장되어 있기 때문에 직접 찾는것은 힘들다
    
    ![image.png](/images/bandit1/image%2033.png)
    
- grep 명령어 : 파일이나 출력 안에서 문자열 패턴을 찾는 명령어
    - 해당 명령어 통해 내용 추출 하면된다.
    - `grep “millionth” data.txt` 입력 시 data.txt에서 millionth가 들어간 줄을 찾아준다.

![image.png](/images/bandit1/image%2034.png)

## Level 8>9

![image.png](/images/bandit1/image%2035.png)

- 문제에서 data.txt에서 딱 한 번만 등장하는 줄이 비밀번호라고 한다.
- data.txt 열어보면 반복되는 여러 개의 줄이 존재한다. 이중에서 딱 한 번만 나타난 줄을 찾는 문제 이다.
    
    ![image.png](/images/bandit1/image%2036.png)
    
- uniq, sort 명령어 활용
    - uniq : 연속해서 붙어 있는 같은 줄 처리
    - sort :  줄 단위 정렬
- sort를 통해 같은 줄끼리 붙도록 정렬하고, uniq를 통해 한 번만 나온 줄만 출력하게 하면 된다.
- `sort data.txt | uniq -u`
    - uniq -u옵션 : 한 번만 나온 줄만 출력

![image.png](/images/bandit1/image%2037.png)

## Level 9 > 10

![image.png](/images/bandit1/image%2038.png)

- 사람이 읽을 수 없는 내용에서 사람이 읽을 수 있는 문자열을 구하는 문제이다
(문자 앞에 `=` 문자가 여러개 붙어 있다고 한다)
- grep을 통해 “=” 문자열을 찾아보았지만
    
    [https://www.notion.so](https://www.notion.so)
    
- grep이 data.txt파일을 **텍스트 파일이 아니라 바이너리 파일**로 판단하여 나오지 않는다.
- 해당 문제는 strings 명령어를 사용하면 된다.
    
    ![image.png](/images/bandit1/image%2039.png)
    
    - strings :  바이너리 파일 안에서 사람이 읽을 수 있는 문자열만 뽑아주는 명령어
- 최종적으로 strings를 통해 data.txt에서 사람이 읽을 수 있는 문자열을 뽑고 그 중에서 “=” 문자열이 앞에 붙은 문자열을 찾으면 된다
- `strings data.txt | grep “==”`
    
    ![image.png](/images/bandit1/image%2040.png)
    

## Level 10 > 11

![image.png](/images/bandit1/image%2041.png)

- 비밀 번호가 base64로 인코딩되어 있다고 한다.

![image.png](/images/bandit1/image%2042.png)

- base64 명령어를 통해 디코딩 하면 되는 문제 이다
    - base64 : 데이터를 Base64 형식으로 인코딩하거나 디코딩하는 명령어
- 최종적으로 base64 의  -d 옵션을 사용하여 디코딩 하면 된다.
    
    ![image.png](/images/bandit1/image%2043.png)
    
    ![image.png](/images/bandit1/image%2044.png)
    

## Level 11 > 12

![image.png](/images/bandit1/image%2045.png)

- 모든 알파벳이 **13칸씩 밀려서 바뀌어 있다고 한다.**
- 예를 들면 a → n, b → o 이런 식으로 바뀌어 있는 것이다
- 13칸 회전된 문자들을 다시 돌려 놓으면 된다
- tr 명령어 : 문자를 다른 문자로 바꾸거나, 삭제하거나, 압축하는 명령어
- tr 명령어를 통해 바뀐 문자를 원본 문자열로 바꾸면 문제가 풀린다.
    - A-Za-z → N-ZA-Mn-za-m
- `cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'`
- 7x16WNeHIi5YkIhWsfFIqoognUTyj9Q4

![image.png](/images/bandit1/image%2046.png)

## Level 12 > 13

![image.png](/images/bandit1/image%2047.png)

- **hexdump(16진수 덤프)** 상태, 여러 번 압축되어있음
- Tip, mktemp -d  사용하여 디렉터리 만든 후 cp로 원본 복사해서 진행하라고 나와있음
- mktemp -d 디렉터리 생성 후 이동
    
    ![image.png](/images/bandit1/image%2048.png)
    
- 원본 파일 복사
    
    ![image.png](/images/bandit1/image%2049.png)
    
- xxd 이용해 hexdump를 원래 파일로 복구
    - xxd : 파일을 16진수(hex) 형태로 보여주거나, 반대로 hex dump를 원래 바이너리로 복원하는 명령어
        
        ![image.png](/images/bandit1/image%2050.png)
        
    - -r 옵션 사용하여 원래 바이너리로 복원
        
        ![image.png](/images/bandit1/image%2051.png)
        
- file 이용해 파일 타입 확인
    
    ![image.png](/images/bandit1/image%2052.png)
    
    - 기존 data2.bin 파일이 gzip으로 압축 되어있는 것을 알 수 있음
- mv 사용하여 redata 확장자 gz로 변경 후 gunzip으로 압축 해제
    
    ![image.png](/images/bandit1/image%2053.png)
    
    - gunzip한 결과 원본 파일이 나오지 않아 다시 file 통해 파일 타입 확인 결과 bzip2로 압축되어 있음
- mv 사용하여 redata 확장자 bz2로 변경 후 bunzip2 통해 압축 해제
    
    ![image.png](/images/bandit1/image%2054.png)
    
    - bunzip2한 결과 원본 파일 나오지 않음, 파일 타입 확인 결과 gzip으로 압축되어 있음
- gzip 압축 해제 과정 다시 진행
    
    ![image.png](/images/bandit1/image%2055.png)
    
    - 결과 원본 파일 없음, 파일 타입 확인 결과 tar 압축 묶음 파일임을 알 수 있음
- tar 통해 파일을 풀어줌
    
    ![image.png](/images/bandit1/image%2056.png)
    
    - -xf 옵션 : 모든 파일을 추출
    
    ![image.png](/images/bandit1/image%2057.png)
    
- 결과 data5.bin이라는 바이너리 파일 획득 file로 확인 결과 tar 압축 묶음
    
    ![image.png](/images/bandit1/image%2058.png)
    
- 텍스트 파일이 나올 때 까지 위에 과정 반복
    
    ![image.png](/images/bandit1/image%2059.png)
    
- 최종 결과 data8이라는 ACII text 파일 획득 가능
- cat 명령어 통해 출력