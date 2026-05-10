---
title: "Learngitbranching Remote"
summary: "Learngitbranching"
date: "2026-04-29"
category: "dev"
section: "dev"
miscGroup: "archive"
badge: "Learngitbranching Remote"
badgeTone: "dev"
tags:
  - Git
statLabel: "Git"
statValue: "Remote"
heroEyebrow: "$ cat content/posts/Learngitbranching_Remote.md"
heroAvatar: "DEV"
---

# Learngitbranching Remote

# Git Remote

- 원격 저장소는 **내 로컬 저장소의 복사본이 다른 컴퓨터(서버)에 있는 것**

### 1. 백업

- 로컬 데이터 날아가도 복구 가능
- GitHub, GitLab 등이 대표적인 원격 저장소

### 2. 협업

- 여러 사람이 같은 프로젝트 작업 가능
- 다른 사람의 변경사항 가져오기 (`pull`)
- 내 변경사항 공유 (`push`)

## 1. Git clone

![image.png](/images/git2/image.png)

### 정의

- **원격 저장소를 내 컴퓨터로 그대로 복사하는 명령어**

### 사용법

```bash
git clone <저장소 주소>
```

## 2. Git 원격 브랜치

![image.png](/images/git2/image%201.png)

- 원격 브랜치는 체크 아웃을 하게 되면 분리된 `HEAD` 모드로 가게되는 특별한 속성 존재 있습니다.
- Git은 여러분이 이 브랜치들에서 직접 작업할 수 없기 때문에 일부로 이렇게 동작
- 다른곳에 작업을 하고 원격 저장소와 여러분의 작업을 공유해야 함(그 이후에 원격 브랜치가 갱신)

### `<remote name>/<branch name>`

- `<remote name>`: 원격 저장소의 이름
- `o/`  : origin

## 3. Git Fetch

![image.png](/images/git2/image%202.png)

```bash
git fetch
```

- 원격 저장소의 최신 커밋 정보를 로컬로 가져오는 명령어
    - 원격 저장소에 새로 생긴 커밋을 다운로드
    - 로컬의 원격 추적 브랜치 포인터를 업데이트
    - 하지만 현재 작업 중인 로컬 브랜치는 바꾸지 않음
    - 작업 디렉터리 파일도 바꾸지 않음

<aside>
💡

원격 상태 확인 + 데이터 다운로드 까지만 하고, 내 작업 브랜치에는 직접 반영 X

</aside>

## 4. Git Pull

![image.png](/images/git2/image%203.png)

```bash
git pull
```

- 원격 저장소의 변경사항을 가져와서 현재 로컬 브랜치에 바로 반영하는 명령어
    - `git fetch` + `git merge`
        
        1. 원격 저장소에서 최신 커밋을 가져옴
        
        2. origin/main 같은 원격 추적 브랜치를 업데이트함
        
        3. 가져온 변경사항을 현재 로컬 main에 병합함
        

## 5. Git fakeTeamwork

![image.png](/images/git2/image%204.png)

- 원격 저장소가 변경된 상황을 "가짜로 생성"
    - `git clone`: origin/main 추적 시작
    - `git fakeTeamwork 2`: 원격(main)에 커밋 2개 추가됨
    - `git commit`:  로컬에서 작업 진행
    - `git pull`: 원격 변경 + 내 작업 합침

## 6. Git push

![image.png](/images/git2/image%205.png)

- 변경을  원격저장소에 업로드하고 그 원격 저장소가 새 커밋들을 합치고 갱신하게 합니다

## 7. 엇갈린 히스토리

- 원격 저장소에 내가 모르는 새 커밋이 생긴 상태에서 바로 push하면 거부
- 업을 원격 브랜치의 최신상태를 기반으로 하게 만들면 됨

### `git fetch;` `git rebase o/main` `git push`

![image.png](/images/git2/image%206.png)

- `git fetch`: 원격 저장소의 최신 커밋을 가져와서 `origin/main`을 업데이트
- `git rebase o/main` : 내 로컬 커밋을 원격 최신 커밋 위로 다시 올림
- `git push` :  `main`은 원격 최신 커밋을 포함하고 있으므로 push 가능

> `git pull --rebase; git push` : fetch와 리베이스를 하는 작업의 줄임 명령어로 같은 작업 수행
> 

### `git fetch;` `git merge o/main` `git push`

![image.png](/images/git2/image%207.png)

- `git fetch`: 원격 저장소의 최신 커밋을 가져와서 `origin/main`을 업데이트
- `git merge o/main` : 원격(C2) + 내 작업(C3) 합침
- `git push` :  merge 결과를 원격에 반영

> `git pull`이 fetch와 merge의 줄임 명령어로 같은 작업 수행
> 

<aside>
💡

`merge`는 합치는 방식, `rebase`는 재배치하는 방식

- 둘 다 최신 상태 맞추는 방법이지만 히스토리 구조가 다름
</aside>

## 8. **Remote Rejected**

- 원격 저장소는 자신의 `main` 브랜치에 대한 직접적인 커밋을 제한합니다.
- 원격 저장소의 `main` 브랜치에는 직접 push할 수 없고, Pull Request를 통해서만 변경사항을 넣을 수 있다
    - 실수로 `main` 에 직접 커밋, main은 보호되어 있어 `push` 불가 상황
    - 실수로 만든 커밋을 다른 브렌치에 옮기고 main을 되돌림
        
        ![image.png](/images/git2/image%208.png)
        
    - `git branch -f main o/main` :`main` 브랜치를 **강제로(o/main 위치로) 이동**
    - 실수로 만든  커밋을 feature 브랜치로 옮김
    - `git push origin feature`:  `feature` 브랜치를 원격 저장소에 업로드

<aside>
💡

main에서 잘못 커밋했으면 → feature로 분리하고 main은 원래 상태로 되돌린다

</aside>

# 고급 Git remote

## 1.  **feature 브랜치 병합**

- 여러 feature 브랜치를 `main`에 순서대로 통합한 뒤, 최종 `main`만 원격에 push
    - feature 브랜치의 작업을 main 브랜치로 통합
    - 원격저장소에서 push하고 pull하는 작업

### rebase

![image.png](/images/git2/image%209.png)

### merge

![image.png](/images/git2/image%2010.png)

- `rebase`의 일반적인 장 / 단점:
    - 장점: 커밋 그래프를 볼 때 흐름이 깔끔하고, 어떤 작업이 어떤 순서로 반영됐는지 보기 쉽다.
    - 단점: 기존 커밋을 그대로 옮기는 것이 아니라, **새 기준 위에 다시 적용해서 새 커밋으로 재생성**
    
    > 원래는 `C1`이 먼저 만들어졌더라도, `C3` 위로 rebase하면 결과적
    `C3` → `C1'`처럼 보임 
    실제 작업 순서와 다르게 **C1의 작업이 C3 이후에 만들어진 것처럼 보일 수 있음**
    > 
- `merge`는 실제 분기와 병합 이력을 그대로 남김.
- `rebase`는 히스토리를 깔끔하게 만들지만, 기존 커밋의 위치와 해시가 바뀜

<aside>
💡

`merge`는 실제 작업 흐름을 보존하는 방식이고, `rebase`는 히스토리를 깔끔하게 재구성하는 방식
이력 보존 중요 → `merge` 사용
깔끔한 커밋 트리 중요 → `rebase` 사용

</aside>

## 2. **원격-추적 브랜치**

- 로컬 브랜치 → 어떤 원격 브랜치를 기준으로 삼을지 연결하는 것
- main → o/main 추적
    - `git pull` → o/main 기준으로 merge/rebase
    - `git push` → o/main으로 push
- 다른 브랜치도 원격 `main`을 추적하게 만들 수 있음

![image.png](/images/git2/image%2011.png)

- `git checkout -b side o/main` :
    - `side` 브랜치 생성
    - `o/main`위치 에서 시작
    - `side` → `o/main` 추적 설정
- `git pull --rebase` :
    - 원격 최신 가져오고
    - 내 작업을 그 위로 올림
- `git push` :
    - `side` → `o/main`을 추적하고 있기 때문에 `side` → `origin/main`으로 push 됨

## 3. Git push 인자들

- `push` 하면 git이 push를 할 대상으로 원격 저장소, 브래치를 현재 작업중인 브랜치에 설정된 속성을 통해 알아냄
- push에 인자를 직접 줄 수 있음 : `git push <remote> <place>`
    - `<place>`: 어떤 브랜치의 내용을 기준으로 push할지 지정하는 이름
    
    > `git push origin main` :
    로컬 main 브랜치의 커밋을 origin 원격 저장소의 main 브랜치로 올린다.
    > 

![image.png](/images/git2/image%2012.png)

- `git push origin foo` :  로컬 foo 브랜치 → 원격 origin/foo 브랜치
- `git push origin main` :  로컬 main 브랜치 → 원격 origin/main 브랜치

> remote와 place 직접 지정 시 : 현재 어떤 브랜치에 checkout되어 있는지 신경 X
> 

### **`<place>` 인자에 대한 세부사항들 (**`source:destination`)

```bash
git push origin <source>:<destination>
```

- 로컬의 <source> 위치를 원격 저장소의 <destination> 브랜치로 보낸다
    - `source`: 로컬에서 보낼 커밋 또는 브랜치
    - `destination`: 원격 저장소에서 갱신할 브랜치

![image.png](/images/git2/image%2013.png)

- `git push origin foo:main`
    - 로컬 foo 브랜치 → 원격 main 브랜치
- `git push origin main^:foo`
    - 로컬 main의 부모 → 원격 foo 브랜치

> `git push origin main:newBranch` :
로컬 main 브랜치의 내용을 원격 newBranch 브랜치로 push한다
원격에 `newBranch`가 없다면 Git이 새로 생성
> 

## 4. Git fetch 인자들

### **`<place>` 인자**

- `git fetch origin foo`
    - 원격(origin)의 foo 브랜치 → 로컬의 o/foo 브랜치
    - 커밋들을 `foo`브랜치에서만 내려받은 후 로컬의 `o/foo`브랜치에만 적용

### 왜 로컬 `foo`를 바로 바꾸지 않는가?

- 로컬 `foo`에는 내가 작업 중인 내용이 있을 수 있기 때문
- `fetch`가 로컬 브랜치를 마음대로 바꾸면 내가 작업한 내용이 꼬일 수 있음

### `<source>:<destination>`

```bash
git fetch origin <source>:<destination>
```

- 원격 source → 로컬 destination
- `<source>`는 이제 받아올 커밋이 있는 *원격*에 있는 place를 넣어줘야하고 `<destination>`은 그 커밋들을 받아올 *local*의 place를 인자로 넣어줘야함

![image.png](/images/git2/image%2014.png)

- `git fetch origin C3:foo`
    - 원격 C3 → 로컬 foo
- `git fetch origin C6:main`
    - 원격 C6 → 로컬 main

> `git fetch origin C2:<로컬에 없는 브랜치>` :
Git이 fetch를 수행하기전에 destination을 로컬에 만듦
> 

## 5. `<source>`의 이상함

### `<source>`에 "없음"을 지정

![image.png](/images/git2/image%2015.png)

- `git push origin :foo`
    - source = 없음, destination = foo
    - "없음"을 원격 브랜치로 push하면 원격저장소의 그 브랜치를 삭제
    
    > foo 브랜치를 '비어있는 상태'로 만들어야 함
    → 브랜치 삭제
    > 
- `git fetch origin :bar`
    - source = 없음, destination = bar
    - “없음"을 fetch하면 로컬에 새 브랜치를 만듦
    
    > source가 없음 → 가져올 데이터 없어도 destination은 있기 때문에
    Git은 "bugfix라는 브랜치만 만들어놓자”라고 작동
    > 

## 6. Git pull의 인자들

- `git pull origin foo` = `git fetch origin foo; git merge o/foo`
    - 원격 foo 가져옴 → o/foo
    - 현재 브랜치에 o/foo merge
- `git pull origin bar:bugFix`  = `git fetch origin bar:bugFix; git merge bugFix`
    - origin의 bar → 로컬 bugFix
    - 현재 브랜치 ← bugFix 합침

![image.png](/images/git2/image%2016.png)

- `git pull origin C3:foo`
    - 로컬에 이름이 `foo`인 새 브랜치를 만들고, 원격 저장소의 `C3`에서 이 브랜치 `foo`에 커밋들을 내려받음
    - 브랜치를 우리가 현재 체크 아웃한 브랜치로 병합(merge)
- `git pull origin C2:side`
    - 로컬에 이름이 `side`인 새 브랜치를 만들고, 원격 저장소의 `C2`에서 이 브랜치 `side`에 커밋들을 내려받음
    - 브랜치를 우리가 현재 체크 아웃한 브랜치로 병합(merge)

![image.png](/images/git2/image%2017.png)