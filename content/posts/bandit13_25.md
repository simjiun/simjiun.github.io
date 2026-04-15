---
title: "bandit write up 2"
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
statValue: "13-25"
heroEyebrow: "$ cat content/posts/bandit13_25.md"
heroAvatar: "CTF"
---

# bandit 13~25

## Level 13 > 14

![image.png](/images/bandit2/image.png)

- /etc/bandit_pass/bandit14에 비밀번호가 저장되어 있고, `bandit14` 사용자만 읽을 수 있다고 한다.
- 해당 레벨에선 비밀번호를 받지 못하지만, 다음 레벨에 로그인하는 데 사용할 수 있는 개인 SSH 키를 받게되고, 키를 사용하는 방법을 알아보라고 한다.
- 즉, 개인 SSH 키를 통해 bandit14에 접속 해야 한다.
- bandit14로 접속하기 위해 bandit13에 존재하는 키 파일 sshkey.private를 wsl로 가져와야 한다
    
    ![image.png](/images/bandit2/image%201.png)
    
- scp 명령어를 통해 키를 wsl 현재 폴더로 가져오게 하면 됨
    - scp 명령어 : SSH를 이용해서 파일을 복사하는 명령어
    (scp [옵션] [원본 대상] [가져올 위치])
    - `scp -P 2220 bandit13@bandit.labs.overthewire.org:/home/bandit13/sshkey.private .`
    
    ![image.png](/images/bandit2/image%202.png)
    
- 개인 SSH 키를 획득 했음으로 해당 키를 통해 bandit14로 접속
    - `ssh -i sshkey.private -p 2220 bandit14@bandit.labs.overthewire.org`
- 하지만 bad permissions로 접속에 실패함
    
    ![image.png](/images/bandit2/image%203.png)
    
    - 이는 키 파일 권한이 너무 열려 있어 SSH가 보안상 키를 무시한 상태
- chmod 통해 키 파일의 권한을 설정
    - chmod : 파일 권한을 변경하는 명령어
    - 파일 소유자만 읽고 쓸 수 있게 변경 
    `chmod 600 sshkey.private`
- 성공적으로 bandit14로 접속
    
    ![image.png](/images/bandit2/image%204.png)
    

## Level 14 > 15

![image.png](/images/bandit2/image%205.png)

- 다음 레벨의 비밀번호는 현재 레벨의 비밀번호를 **localhost의 30000번 포트** 로 전송하면 얻을 수 있다고 한다.
- 이전 문제에서 /etc/bandit_pass/bandit14에 현제 레벨의 비밀번호가 존재함을 알려줬다.
    
    ![image.png](/images/bandit2/image%206.png)
    
- nc 명령어 사용하여 /etc/bandit_pass/bandit14를 [localhost](http://localhost) 30000번 포트에 전송하면 된다
    - nc(netcat) : TCP/UDP 포트에 직접 연결해서 데이터를 보내고 받는 도구
- `cat /etc/bandit_pass/bandit14 | nc [localhost](http://localhost) 30000`
    - cat 통해 현재 비밀번호 출력하여 | 로 출력을 다음 명령에 전달
        
        ![image.png](/images/bandit2/image%207.png)
        

## Level 15 > 16

![image.png](/images/bandit2/image%208.png)

- 현재 레벨의 비밀번호를 SSL/TLS 암호화를 사용하여 localhost의 30001 포트 로 전송하면 비밀번호를 얻을 수 있다고 한다.
- 즉 현재 레벨 비밀번호를 SSL/TLS 암호화된 연결을 써 localhost:30001로 보내야 한다는 것이다.
- 이를 위해 openssl 사용
    - openssl : SSL/TLS 및 각종 암호화 기능을 다룰 수 있는 오픈소스 암호화 라이브러리이자 명령줄 도구
- openssl s_client 명령어를 사용해 [localhost:30001](http://localhost:30001)로 TLS 서버에 연결.
    - s_client : SSL/TLS를 사용하는 원격 호스트에 클라이언트로 접속할 때 사용하는 OpenSSL 명령어
    - 이 명령은 비밀번호를 평문으로 전송하는 것이 아닌, 먼저 **T**LS 핸드셰이크를 수행하여 암호화된 세션을 수립한 뒤, 그 세션을 통해 비밀번호를 전송한다.
    - 따라서 입력한 비밀번호는 자동으로 암호화된 채널 통해 전달 됨
    - `openssl s_client -connect localhost:30001`
    
    ![image.png](/images/bandit2/image%209.png)
    
- 연결 후 bandit15의 비밀번호 전송
    
    ![image.png](/images/bandit2/image%2010.png)
    
    ![image.png](/images/bandit2/image%2011.png)
    

## Level 16 > 17

![image.png](/images/bandit2/image%2012.png)

- 현재 비밀번호를 localhost의 31000~32000번대 포트 중 다음 레벨 자격을 증명하는 서버를 찾아 현재 비밀번호를 전송해 비밀번호를 얻으라고 한다
    - 31000~32000번대 포트 중 실행중이 포트를 찾고
    - 그 중 어떤 포트가 SSL/TLS 지원하는지 확인
    - 비밀 번호를 보내 다음 레벨 자격을 증명하는 진짜 서버를 찾아야 한다
- nmap 통해 31000~32000번대 포트 중 실행중인 포트를 찾는다
    - nmap : 포트 스캐너, 네트워크 탐색 도구
    - nmap의 -p 옵션을 통해 실행 중인 포트 탐색
    
    ![image.png](/images/bandit2/image%2013.png)
    
    - 5개의 실행 중인 포트 찾을 수 있음
- 실행 중인 포트 중 openssl s_client 통해 SSL/TLS 지원하는 포트 찾는다.
    - `31518`, `31790` 포트에서 SSL/TLS 지원함을 확인 가능
    
    ![image.png](/images/bandit2/image%2014.png)
    
    ![image.png](/images/bandit2/image%2015.png)
    
    - 지원하지 않는 포트에선 이러한 반응이 옴
        
        ![image.png](/images/bandit2/image%2016.png)
        
- 비밀 번호를 보내 다음 레벨 자격을 증명하는 진짜 서버를 찾는다.
    - `cat /etc/bandit_pass/bandit16 | openssl s_client -connect localhost:[포트번호] -quiet`
    - `31518` 포트 확인
        
        ![image.png](/images/bandit2/image%2017.png)
        
    - `31790` 포트 확인
        
        ![image.png](/images/bandit2/image%2018.png)
        
    - `31790` 포트가 진짜 서버임을 알 수 있음
- 해당 RSA 개인키를 복사하여 key 파일 저장
    
    ![image.png](/images/bandit2/image%2019.png)
    
- 해당 키 파일 권한 설정 후 접속 성공
    
    ![image.png](/images/bandit2/image%2020.png)
    

## Level 17 > 18

![image.png](/images/bandit2/image%2021.png)

- passwords.old와 [passwords.new](http://passwords.new) 파일이 존재하며 두 파일 사이 변경된 하나의 줄이 다음 레벨 비밀번호라고 한다
- diff 명령어를 통해 두 파일을 비교해서 달라진 부분을 찾으면 된다.
    - diff : 두 파일의 차이점을 비교해서 보여주는 명령어
        
        ![image.png](/images/bandit2/image%2022.png)
        
    - 42번째 줄에 내용이 다르다는 것을 확인할 수 있다.
- 해당 비밀번호로 다음 레벨 접속 성공

## Level 18~19

![image.png](/images/bandit2/image%2023.png)

- 비밀번호는 readme파일에 저장되어 있지만, .bashrc 파일을 수정하여 SSH 로그인할 때 로그아웃 되도록 설정되어 있다고 한다.
    
    ![image.png](/images/bandit2/image%2024.png)
    
- SSH로 로그인하면 쉘이 실행되고, bash가 시작될 때 .bashrc를 읽는데 로그인할 때 로그아웃 되도록 설정이 되어 있어 readme를 읽을 수 없다
- SSH는 로그인만 하는 게 아니라,원격 서버에 특정 명령 하나만 실행하라고 시킬 수도 있다
- 이를 이용하여  원격 로그인과 원격 명령 실행을 한 번에 시키면 readme파일을 읽어 올 수 있다

![image.png](/images/bandit2/image%2025.png)

## Level 19 > 20

![image.png](/images/bandit2/image%2026.png)

- setuid 바이너리가 있고 해당 파일을 이용해 /etc/bandit_pass에 접근해 비밀번호를 알아 내라고 한다.
- 사용 방법은 인자 없이 실행해보면 알려준다고 한다.
    
    ![image.png](/images/bandit2/image%2027.png)
    
    - 다른 사용자로 명령을 실행해 주는 프로그램인 것 같다.
- 따라서 해당 프로그램으로 비밀 번호를 읽어오면 된다.
    
    ![image.png](/images/bandit2/image%2028.png)
    

## Level 20 > 21

![image.png](/images/bandit2/image%2029.png)

- setuid 바이너리가 존재하고 명령줄 인수로 지정한 포트의 localhost에 연결해 연결을 통해 텍스트 한 줄을 읽어 bandit20의 암호와 비교하고 암호가 올바르면 bandit21의 암호를 전송하는 작업을 수행한다고 한다
- 또 하나의 터미널을 새로 만들고 nc 리스닝 모드를 통해 특정 포트를 열어 둔 후 비밀번호를 입력해 두고  다시 돌아와 setuid 바이너리를 실행 시키면, 입력해둔 비밀번호를 읽고 검증 후 일치 시 다음 레벨 비밀번호를 전송해준다.
- screen 통해 새로운 터미널 생성
    - screen : 하나의 터미널 안에서 여러 개의 가상 터미널 세션을 만들고, 분리(detach)했다가 다시 붙을 수 있게 해주는 터미널 멀티플렉서
        
        ![image.png](/images/bandit2/image%2030.png)
        
        ![image.png](/images/bandit2/image%2031.png)
        
- nc 리스닝 모드 실행 후 이전 비밀번호(bandit20) 입력
    
    ![image.png](/images/bandit2/image%2032.png)
    
- (Ctrl + a →  d ) 다시 돌아와 설정 포트로 setuid 바이너리 실행
    
    ![image.png](/images/bandit2/image%2033.png)
    
    - 검증에 성공했고 다음 레벨 비밀번호를 전송했다고 뜸
- 리스닝 모드를 켜놨던 터미널로 돌아가 보면 다름 레벨 비밀번호 확인 가능
    
    ![image.png](/images/bandit2/image%2034.png)
    
    ![image.png](/images/bandit2/image%2035.png)
    
- EeoULMCra2q0dSkYj561DX7s1CpBuOBt

## Level 21 > 22

![image.png](/images/bandit2/image%2036.png)

- `cron` 이 주기적으로 자동 실행하는 프로그램이 있고, 설정 파일이 /etc/cron.d/ 아래에 있고 어떤 명령이 실행되는지 확인하라고 한다.
- /etc/cron.d/ 아래에 설정 파일을 확인해 어떤 명령을 실행하는지 찾고 비밀번호를 찾아야 한다.
- /etc/cron.d/ 경로로 이동해 파일 확인
    
    ![image.png](/images/bandit2/image%2037.png)
    
    - cronjob_bandit22 파일이 해당 레벨 문제와 관련된 파일 인듯 하여 확인
        
        ![image.png](/images/bandit2/image%2038.png)
        
        - `*****`  : 매 분마다 실행
        - `bandit22` :  bandit22 사용자 권한으로 실행
        - `/usr/bin/cronjob_bandit22.sh`  : 실행되는 스크립트
        - `&> /dev/null`  : 실행 결과를 숨김
- 실행되는 스크립트 내용 확인
    
    ![image.png](/images/bandit2/image%2039.png)
    
    - `/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv`  해당 파일의 권한 644로 설정
    - bandit22 비밀번호를 `/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv`  파일에 저장
- `/tmp/t7O6lds9S0RqQh9aMcz6ShpAoZKF7fgv`  파일 내용 출력하여 비밀번호 획득
    
    ![image.png](/images/bandit2/image%2040.png)
    
- tRae0UfB9v0UzbCdn9cY0gQnds9GF58Q

## Level 22 > 23

![image.png](/images/bandit2/image%2041.png)

- 해당 문제 또한 설정 파일 확인 후 스크립트를 확인하는 문제이다.
- /etc/cron.d/ 경로로 진입 후 파일 확인
    
    ![image.png](/images/bandit2/image%2042.png)
    
    - 이전 문제와 동일 하게 스크립트를 매 분 실행 시킨다.
- 스크립트 확인
    
    ![image.png](/images/bandit2/image%2043.png)
    
    - 파일 이름을 만들어서 그 파일 이름으로 비밀 번호를 보내는 작업을 수행하는 것 같다.
- `echo I am user $myname | md5sum | cut -d ' ' -f 1`  해당 명령어를 실행 시키면 파일 이름을 얻을 수 있다.
    
    ![image.png](/images/bandit2/image%2044.png)
    
- 해당 파일명 가진 파일 확인 하여 비밀번호 획득
    
    ![image.png](/images/bandit2/image%2045.png)
    

## Level 23 > 24

![image.png](/images/bandit2/image%2046.png)

- 이전 문제와 동일해 보이지만 참고에 직접 셸 스크립트를 작성해야 한다고 한다.

![image.png](/images/bandit2/image%2047.png)

- 이전 문제와 동일하게 특정 스크립트 주기적 실행 시킴
- 스크립트 확인
    
    ![image.png](/images/bandit2/image%2048.png)
    
    - `cd /var/spool/"$myname"/foo || exit` :  해당 경로로 이동, 실패 시 exit
    - for 문 :  현재 디렉터리 안의 일반 파일(`*` )및 숨김 파일(`.*`) 전체를 하나씩 순회하며 `stat`으로 소유자를 확인하고 소유자가 `bandit23` 이고 일반 파일 이면 실행, `rm -rf`통해 실행 여부 상관없이 파일 삭제
- 해당 스크립트를 활용
    - `cd /var/spool/"$myname"/foo` 해당 경로에 `bandit23`소유의 일반 파일로 비밀 번호를 얻을 수 있는 스크립트 작성하여 저장
    - cron이 cronjob_bandit24.sh 실행하면 삽입해 놓은 스크립트 실행 시켜줌
    - 이를 활용해서 비밀 번호 획득
- 스크립트 작성
    
    ```bash
    #!/bin/bash
    cat /etc/bandit_pass/bandit24 > /tmp/pass.txt
    ## bandit24의 비밀번호 추출 하여 pass.txt에 저장
    chmod 600 /tmp/pass.txt
    ```
    
    - 해당 스크립트를 `/var/spool/bandit24/foo` 경로에 삽입
        
        ```bash
        bandit23@bandit:/var/spool/bandit24/foo$ echo '#!/bin/bash
        cat /etc/bandit_pass/bandit24 > /tmp/pass.txt
        chmod 600 /tmp/pass.txt' > exx.sh
        ```
        
        ![image.png](/images/bandit2/image%2049.png)
        
    - 잘 생성된것으로 확인 가능
- 1분 후 [exx.sh](http://exx.sh) 는 사라지고 cat /tmp/pass.txt  결과 비밀번호가 나옴
    
    ![image.png](/images/bandit2/image%2050.png)
    

gb8KRRCsshuZXI0tUuR6ypOFjiZbf3G8

## Level 24 > 25

![image.png](/images/bandit2/image%2051.png)

- 데몬이 30002번 포트에서 실행 중이며 , bandit24 비밀번호와 4자리 PIN코드 입력하면 bandit25 비밀번호를 알려준다고 한다.
- PIN 코드는 brute-forcing외에는 얻을 수 있는 방법이 없다고 한다.

![image.png](/images/bandit2/image%2052.png)

- [bandit24 비밀번호]  [PIN코드] 이런식으로 입력하면 틀린지 맞는지 확인이 가능하다.
- brute-forcing으로 만들 수 있는 PIN 조합 만든 뒤 한 번에 nc로 보내면 된다.
    
    ```bash
    for i in {0000..9999}; do echo "$(cat /etc/bandit_pass/bandit24) $i"; done | nc localhost 30002
    ```
    
- 실행 결과 비밀 번호 획득 가능
    
    ![image.png](/images/bandit2/image%2053.png)