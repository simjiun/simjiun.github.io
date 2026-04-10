---
title: "자동화 도구 실습"
summary: "KISA gym"
date: "2026-04-10"
category: "misc"
section: "misc"
badge: "Automation Tool Lab"
badgeTone: "misc"
tags:
  - Tool
statLabel: "study"
statValue: "bug"
heroEyebrow: "$ cat content/posts/Automation-Tool.md"
heroAvatar: "MISC"
---


## 자동화 도구 실습

# SQLMAP

- 자동화 sql Injection 및 데이터베이스 탈취 도구
- 다양한 데이터베이스 지원
- 옵션 설정 따라 파일 시스템, 운영체제 엑세스까지 가능

# SQLMAP 버그헌팅

![step1](/images/atool1.png)

- 서비스 부하를 줄이기 위해 delay 사용 가능
    - 쿼리 실행하는 간격 설정하여 서비스 부하 줄이는 역할
    - 방화벽, CDN서비스의해 차단을 방지하는데 이용

![step1](/images/atool2.png)

- 공격의 위험성 관리, SQLMAP의 동작을 제한하여 서버 안전위해 사용

![step1](/images/atool3.png)

- 공격자의 실제 위치 음폐, 탐지 회피 기능 제공
    - 네트워크 상 익명 방지, 방화벽, cdn의한 차단 방지

![step1](/images/atool4.png)

- 캡쳐된 HTTP 요청을 분석하는데 사용
    - 특히 json 형식 요청 다룰때 HTTP dump 파일을 로드 가능
    - 쿼리를 sudo로 조정하는것도 가능
    - 커멘드 창 내에 페이로드 넣기 까다로울때 유용
- sqlmap 자동화 도구로 쿼리 얻어낸 후에는 수동으로 쿼리 변조하는 것이 안전

## 1. SQLMAP - SQL Injection

![step1](/images/atool5.png)

- -u 옵션 : 테스트 대상 도메인 정보 입력
- - -data 옵션 : POST방식으로 전달 되는 HTTP 요청 본문의 데이터를 SQLMAP에 제공
- 제공받은 데이터에 쿼리 삽입하여 테스트 진행 함
- GET 방식 요청 테스트 하려면 유효 옵션에 파라미터 포함한 전체 url을 입력해야 함

## 2. SQLMAP - File Read

![step1](/images/atool6.png)

- - -file-read 옵션 :
    - sql injection이 가능한 상태에서 사용 가능
    - 읽어들일 파일 이름을 지정 
    → 지정 파일 이름 바탕으로 서버 내부에서 해당 파일 찾아 읽어오는 작업 수행
- 해당 방법 통해 서버 내부 정보 파악, 취약점 찾기 가능해짐
- 파일 읽어온 상황
    
    ![step1](/images/atool7.png)
    
    - mysql 데이터 베이스 사용
    - 파일 시스템에 접근해서 password 파일 다운로드 할건지 질문함 
    → sqlmap은 준비된 쿼리를 통해 파일시스템 접근하여 파일 추출

## 3. SQLMAP - RCE

![step1](/images/atool8.png)

- 쉘 접근 기능
- - -os-shell 옵션:
    - sql injection이 취약점 존재할 때만 사용 가능
    - 시스템의 쉘에 접근할 수 있게 함

![step1](/images/atool9.png)

- 서비스 벡엔드 프레임워크가 무엇으로 작성되어있는지, 쉘은 어떤 디렉토리에 올릴것인지 질의 함
    - 프레임워크 선택 시 sqlmap 해당 프레임워크에 맞는 쉘 파일 업로드 시도
    - 업로드 권한 있다면 쉘파일 업로드 되어 쉘 획득 가능

<aside>
💡

SQLMAP:
SQL Injection 취약점 발견 했을 때 데이터 베이스 테이블 자동으로 가져오는 옵션,
테이블 내 데이터 가져오는 옵션 등등 가지고 있음 
** 서비스 로직이나 sql 쿼리 고려하지 않고 고정된 쿼리 사용함 **
    → 탐지 못할 수 도 있음, 안정성 문제 

</aside>

## JWT Crack

- JWT (JSON Web Token)
    - JSON 구조의 콘텐츠를 Base64UrlSafe로 인코딩한 다음, 비밀 키 or 공개/개인 키 쌍을 사용하여 서명
- 인코딩과 서명을 통해 인코딩함
→ 원문 조작 위해 크랙이 필요함
- JWT 크랙도구 : jwtrack, jwt_tool 등이 있음

 

![step1](/images/atool10.png)

- 오픈소스등 많이 존재
- jwt token 집어넣고 코드 실행하면 브루트 포스 방식등으로 크랙 가능

## Hashcat

- 해싱된 비밀번호의 원문 얻어내기 위해 사용되는 해시 크래킹 도구

# 1. 공격 방식

- 사전 공격 : 사전에 존재하는 비밀번호
- 콤비네이터 공격: 두 단어를 합친 비밀번호
- 마스크 공격 : 이전에 누출도니 비밀번호 패턴 이용해 생성 규칭으로 만든 비밀번호
- 규칙 기반 공격 : 단어를 수정, 잘라내기, 확장한 비밀번호

# 2. 동작

- 문자열 길이, 형식등을 이용 or  hash analzy 도구 (CyberChef등등)  이용해 어떤 해시 알고리즘인지 유추 가능
    
    ![step1](/images/atool11.png)
    
    - 해당 정보 통해 hashcat 도구 사용 할 때 hash mode 사용 가능
    - 어떤 해싱인지 선택 가능하여 더 빠르고 정확한 크랙킹 가능해짐
        
        ![step1](/images/atool12.png)
        
        - -m 옵션 : hash 유형 지정 옵션, 크랙하고자 하는 해쉬 유형 입력
        - -a 옵션 : 검증 모드 지정 하는 옵션