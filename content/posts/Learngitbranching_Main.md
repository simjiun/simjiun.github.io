---
title: "Learngitbranching Main"
summary: "Learngitbranching"
date: "2026-04-29"
category: "misc"
section: "misc"
miscGroup: "archive"
badge: "Learngitbranching Main"
badgeTone: "cert"
tags:
  - Git
statLabel: "Git"
statValue: "main"
heroEyebrow: "$ cat content/posts/Learngitbranching_Main.md"
heroAvatar: "MISC"
---

# Learngitbranching Main

![image.png](/images/git1/image.png)

# Git 기본

## 1. Git commit

### 정의

- Git 저장소에 여러분의 디렉토리에 있는 모든 파일에 대한 스냅샷을 기록하는 것

### 기능

- 각 커밋은 저장소의 이전 버전과 다음 버전의 변경내역("delta"라고도 함)을 저장
- 대부분의 커밋이 그 커밋 위의 부모 커밋을 가리킴

![image.png](/images/git1/image%201.png)

- `git commit`을 한 번 칠 때마다 새로운 커밋이 1개 생성되고, 현재 브랜치가 그 새 커밋으로 이동 한다.
    - 현재 브랜치(main) 는 가장 최신 커밋 C3 위에 있음
    - **커밋(commit)**: 프로젝트의 특정 시점 저장본
    - **브랜치(branch)**: “현재 작업 위치”를 가리키는 포인터

<aside>
💡

> 실제 Git에서는 commit할 변경 사항이 있어야만 commit 만들어짐
> 
</aside>

## 2. Git branch

### 정의

- 특정 커밋에 대한 참조(reference)

### 기능

- 많이 만들어도 메모리나 디스크 공간에 부담이 되지 않음
- 작업을 작은 단위로 나누는 것이 효과적
- 하나의 커밋과 그 부모 커밋들을 포함하는 작업 내역

![image.png](/images/git1/image%202.png)

- `git branch bugFix` 실행 시 새로운 브랜치 bugFix 생성

![image.png](/images/git1/image%203.png)

- `git checkout bugFix` 를 실행하면 **현재 작업 브랜치가 `bugFix`로 바뀜**
- 그 상태에서 `git commit` 을 하면 **새 커밋은 `bugFix` 브랜치 위에 추가됨**
- 이때 **`bugFix` 포인터만 새 커밋으로 이동**하고, 다른 브랜치 예를 들어 `main` 은 그대로 있음

<aside>
💡

> checkout은 작업할 브랜치를 바꾸는 명령이고, commit은 현재 체크아웃된 브랜치 위에 쌓인다.
> 
</aside>

## 3. git merge

### 정의

- 한 브랜치의 변경 내용을 다른 브랜치에 통합하는 Git 명령

### 기능

- Git의 합치기(merge)는 두 개의 부모(parent)를 가리키는 특별한 커밋을 만들어냄
    - 두개의 부모가 있는 커밋이라는 것은 "한 부모의 모든 작업내역과 나머지 부모의 모든 작업, *그리고* 그 두 부모의 모든 부모들의 작업 내역을 포함한다"라는 의미
- 즉, 브랜치의 작업 결과 통합

![image.png](/images/git1/image%204.png)

- `git merge bugFix` 를 실행 시켜 `bugFix` 브랜치의 변경사항을 현재 브랜치(`main`)에 합침
- 그 결과 새로운 **머지 커밋(merge commit) `C4`가** 생성
- 즉, `C4`는 부모를 두 개 가지는 커밋
    - 하나는 `main`의 이전 커밋 `C3`
    - 다른 하나는 `bugFix`의 최신 커밋 `C2`

<aside>
💡

> Merge란 한 브랜치의 변경 이력을 현재 브랜치에 통합하는 기능이다. 서로 분기된 작업 내용을 하나로 합칠 수 있으며, 필요 시 merge commit을 생성해 두 브랜치의 결합 이력을 보존한다.
> 
</aside>

## 4. Git Rebase

### 정의

- 기본적으로 커밋들을 모아서 복사한 뒤, 다른 곳에 떨궈 놓는 것
- 현재 브랜치의 커밋들을 다른 브랜치의 최신 커밋 뒤로 다시 배치하는 명령

### 기능

- 커밋들의 흐름을 보기 좋게 한 줄로 만들 수 있다는 장점
- 브랜치 이력을 합치되 **merge처럼 갈라진 흔적을 남기지 않고 일직선 히스토리처럼 정리**하는 방식

![image.png](/images/git1/image%205.png)

- 기존에 분기 되어 있던 기록들
- `git rebase main`
    - `bugFix` 작업 내용은 유지됨
    - 하지만 위치가 `C1` 기준이 아니라 `C3` 기준으로 바뀜
    - 결과적으로 히스토리가 더 **직선형** 으로 정리됨
- merge와 달리 merge commit 없이 히스토리를 직선형으로 정리할 수 있음
- rebase는 커밋을 새로 쓰기 때문에, 이미 다른 사람과 공유한 브랜치에서 함부로 쓰면 위험
    - 기존 커밋 ID가 바뀌고
    - 다른 사람의 히스토리와 충돌할 수 있음

<aside>
💡

> Rebase는 현재 브랜치의 커밋을 대상 브랜치 최신 커밋 뒤로 재배치하는 기능이다. merge와 달리 merge commit 없이 히스토리를 직선형으로 정리할 수 있지만, 기존 커밋이 새 커밋으로 재작성되므로 공유 브랜치에서는 주의해서 사용해야 한다.
> 
</aside>

---

# Git ramp up

## 1. HEAD 분리

### HEAD란?

- 현재 체크아웃된 커밋, “현재 내가 작업 중인 위치”를 가리키는 Git의 참조 포인터
- 작업트리의 가장 최근 커밋

> 
> 
> 
> EX)  `main` 브랜치에서 작업 중
> 
> ```bash
> HEAD -> main -> C2
> ```
> 
> - HEAD는 직접 커밋을 가리키는 게 아니라 먼저 `main` 브랜치를 가리키고`main`이 다시 최신 커밋을 가리킴
> - **attached HEAD 상태**

### HEAD 분리

```bash
git checkout [특정 커밋]
```

- HEAD를 브랜치 대신 커밋에 붙이는 것을 의미
- 브랜치가 아니라 **커밋 해시(또는 커밋 이름)** 로 이동
- 즉 , HEAD가 더 이상 **브랜치를 거치지 않고 직접 커밋을 가리키는 상태**

### 사용

- 과거 커밋 확인: `git checkout <commit-hash>`
- 특정 커밋 위에서 테스트 or 빌드 할 때 사용
- 브랜치 없이 특정 지점 탐색

<aside>
💡

HEAD는 현재 체크아웃한 작업 위치를 가리키는 포인터이다. 일반적으로는 현재 브랜치를 가리키지만, 특정 커밋을 직접 checkout하면 HEAD가 브랜치와 분리되어 해당 커밋을 직접 가리키는 detached HEAD 상태가 된다. 이 상태에서 생성한 커밋은 브랜치가 가리키지 않을 수 있으므로 필요하면 새 브랜치를 만들어 보존해야 한다

</aside>

## 2. 상대 참조

### 정의

- 커밋 해시를 직접 다 쓰지 않고, 현재 커밋이나 브랜치를 기준으로 상대적인 위치를 표현하는 방법
- 즉, “정확한 커밋 ID를 모르더라도, 기준점에서 몇 단계 위인지”로 커밋을 지정

### 기능

- 기억할 만한 지점(브랜치 `bugFix`라든가 `HEAD`라든가)에서 출발해서 이동하여 다른 지점에 도달해 작업을 할 수 있음
    - 한번에 한 커밋 위로 이동 :  `^`
    - 한번에 여러 커밋 위로 이동 : `~<num>`

![image.png](/images/git1/image%206.png)

<aside>
💡

상대 참조(Relative Refs)는 브랜치나 HEAD를 기준으로 상대적인 위치의 커밋을 표현하는 방식,  `^`는 부모 커밋을 의미하며, 예를 들어 `bugFix^`는 `bugFix`가 가리키는 커밋의 바로 이전 부모 커밋을 뜻한다. 이를 통해 긴 커밋 해시 없이도 특정 커밋으로 쉽게 이동 가능

</aside>

### 브랜치 강제로 옮기기

- 브랜치 강제(`-f`)를 통해 브랜치 포인터 이동 가능

```bash
git branch -f [브랜치명] [커밋or상대참조]
```

![image.png](/images/git1/image%207.png)

## 3. Git 작업 되돌리기

### Git reset

- 브랜치로 하여금 예전의 커밋을 가리키도록 이동시키는 방식
- 현재 브랜치를 특정 커밋으로 이동시켜, 그 이후 커밋들을 브랜치 히스토리에서 제외하는 명령
- 즉, `git reset`은 마치 애초에 커밋하지 않은 것처럼 예전 커밋으로 브랜치를 옮기는 것

### Git revert

- 기존 커밋을 없애지 않고, 그 커밋의 반대 내용을 새 커밋으로 추가하는 방식
- 어떤 커밋의 변경사항을 취소하는 새로운 커밋을 추가하는 명령
- 즉,`git revert` 는 가리키는 커밋의 내용을 “없었던 것처럼 되돌리는” 새 커밋 생성하는 것

### reset, revert 적합한 경우

- `reset`  : 아직 로컬에서만 작업 중이고, 최근 커밋을 없애고 싶을 때 사용
- `revert`  : 이미 원격 저장소에 push했거나, 다른 사람과 공유 중인 히스토리에서 특정 커밋을 취소하고 싶을 때 사용

> `reset` 에 경우
> 
> - 브랜치가 가리키는 이력을 바꾸기 때문에, 이미 다른 사람이 받아간 커밋을 갑자기 없애는 효과 발생
>     - 다른 사람 로컬 히스토리와 달라지고
>     - push/pull 시 충돌과 혼란이 생김
> 
> `revert` 에 경우
> 
> - 기존 히스토리를 건드리지 않고, “이 커밋을 취소한다”는 새 기록만 추가

<aside>
💡

`git reset`은 브랜치 포인터를 이전 커밋으로 이동시켜 최근 커밋을 히스토리에서 제외하는 명령이며, 히스토리를 재작성하므로 주로 로컬 작업을 되돌릴 때 사용한다.

 `git revert`는 특정 커밋의 변경사항을 반대로 적용하는 새로운 커밋을 생성하여 작업을 취소하는 명령으로, 기존 히스토리를 보존하므로 이미 공유된 커밋을 되돌릴 때 더 안전

그러므로, 혼자 작업 중이면 `reset`, 이미 공유했으면 `revert`를 우선 고려

</aside>

---

# Git move

## 1. Git cherry-pick

`git cherry-pick <Commit1> <Commit2> <...>`

- 현재 위치(`HEAD`) 아래에 있는 일련의 커밋들에대한 복사본을 만들겠다는 것
- 특정 커밋의 변경사항만 선택해서 현재 브랜치에 적용하고, 그 결과를 새 커밋으로 만드는 명령

![image.png](/images/git1/image%208.png)

- `git cherry-pick C3 C5 C7`
    - C3, C5, C7 순서대로 새로운 커밋이 생성 됨

## 2. Git **Interactive Rebase**

`git rebase -i <기준 커밋 또는 브랜치>`

- `rebase` 명령어를 사용할 때 `-i` 옵션을 같이 사용한다는 것
- `rebase`가 “커밋들을 다른 기준 위로 재배치”하는 기능이라면, `interactive rebase`는  **사용자가 직접 개입해서 커밋 목록을 편집**할 수 있게 만든 형태
- `rebase` 할 커밋 목록을 보여주고, 그 순서나 포함 여부를 직접 편집할 수 있게 하는 기능
    - 적용할 커밋들의 순서를 UI를 통해 바꿀수 있음
    - 원하지 않는 커밋들을 뺄 수 있습니다. 이것은 `pick`을 이용해 지정할 수 있음
    - 마지막으로, 커밋을 스쿼시(squash)할 수 있음 (커밋을 합칠 수 있다)

![image.png](/images/git1/image%209.png)

![image.png](/images/git1/image%2010.png)

- **기존 커밋이 새로 재작성되므로 공유된 브랜치에서는 신중히 사용해야 한다.**

---

# Git mixed

## 1. **로컬에 쌓인 커밋들**

- 불필요한 디버그용 코들을 제외하고 일부 커밋들만 골라내는 작업
- `rebase -i`  : 어떤 커밋을 취하고 버릴지 선택 가능하고, 순서 변경 가능
    
    ![image.png](/images/git1/image%2011.png)
    
    ![image.png](/images/git1/image%2012.png)
    
- `cherry-pick`  : 개별 커밋을 골라서 HEAD 위에 떨어뜨릴 수 있음
    
    ![image.png](/images/git1/image%2013.png)
    
    ![image.png](/images/git1/image%2014.png)
    

## 2. 커밋들 갖고 놀기

- Git 히스토리에서 이미 한참 이전에 생성된 커밋(`newImage`)의 내용을 수정해야 하는 상황
- 새로운 커밋을 추가하는 것이 아니라, 기존 커밋 자체를 수정하여 히스토리를 재구성
- `git rebase -i` 명령으로 변경할 커밋(C3)을 가장 최신 커밋으로 올림
    
    ![image.png](/images/git1/image%2015.png)
    
    ![image.png](/images/git1/image%2016.png)
    
- `git commit --amend`  커밋 내용 정정
    
    ![image.png](/images/git1/image%2017.png)
    
- `git rebase -i` 명령으로 이 전의 커밋 순서대로 되돌려 놓음
    
    ![image.png](/images/git1/image%2018.png)
    
- main을 현재 변경된 부분으로 이동
    
    ![image.png](/images/git1/image%2019.png)
    

<aside>
💡

 Interactive Rebase는 `git rebase -i` 옵션을 사용하여 리베이스할 커밋 목록을 사용자에게 보여주고, 그 순서나 포함 여부를 직접 편집할 수 있게 하는 기능이다. 이를 통해 커밋 순서를 변경하거나, 불필요한 커밋을 제거

</aside>

## 2.2 커밋들 갖고 놀기 - 2

- 이전과 같은 상황
- `rebase -i`를 통한 방법은 순서를 꽤 많이 바꿔야한다는 문제 때문에 리베이스중에 충돌이 날 수 있음
- `cherry-pick`은 브랜치 전체를 합치는 게 아니라, 특정 커밋만 선택해서 현재 브랜치에 복사 적용하는 명령으로 해결
- `git cherry-pick newImage`를 과거 커밋 newImage의 내용을 main 위에 다시 가져와 작업 수행
    
    ![image.png](/images/git1/image%2020.png)
    
- `git commit --amend`  통해 방금 만든 `C2'`를 수정
    
    ![image.png](/images/git1/image%2021.png)
    
- `git cherry-pick caption`  `caption`을 **수정된 newImage(C2'') 위에 이어서 적용**
    
    ![image.png](/images/git1/image%2022.png)
    

<aside>
💡

기존 커밋을 직접 수정하는 것이 아니라, 수정된 형태의 새 히스토리를 재구성

</aside>

## 3. Git 태그

- `git tag`  특정 커밋에 이름표를 붙이는 기능
- Git 태그는 특정 커밋들을 브랜치로 참조하듯이 영구적인 "milestone(이정표)"로 표시
- Git 태그는 커밋들이 추가적으로 생성되어도 절대 움직이지 않음
- 특정 커밋에 버전명 같은 고정 라벨을 붙여 나중에 쉽게 참조할 수 있게 하는 기능

![image.png](/images/git1/image%2023.png)

## 4. Git Describe

- 현재 커밋 또는 특정 브랜치가 어떤 태그를 기준으로 얼마나 떨어져 있는지 설명해주는 명령어
- `git describe <ref>`에서 `<ref>`는 브랜치, 태그, HEAD, 커밋 해시처럼 커밋을 가리키는 모든 값을 넣을 수 있고, 생략하면 기본값으로 현재 체크아웃된 위치인 `HEAD`가 사용
- 명령어 출력 `<tag>-<numCommits>-g<hash>`
    - `tag`는 가장 가까운 부모 태그를 나타냅니다.
    - `numCommits`은 그 태그가 몇 커밋 멀리있는지를 나타냅니다.
    - `<hash>`는 묘사하고있는 커밋의 해시를 나타냅니다.

![image.png](/images/git1/image%2024.png)

# Git advanced

## 1. 여러 브랜치 rebase

- 브랜치들의 모든 작업내역을 `main` 브랜치에 리베이스
    
    ![image.png](/images/git1/image%2025.png)
    
    - `git rebase main bugFix` 통해 `bugfix`를  `main` 위로 올림
    - `git rebase bugFix side` `side`를 방금 업데이트된 `bugFix` 위로 올림
    - **`git rebase side another`** `another`를 `side` 위로 올림
    - `git rebase another main` `main`을 가장 최신 브랜치 위치로 이동

## 2. 부모를 선택하기

- `git checkout main^` : 첫 부모를 따라 올라감
- `git checkout main^2` : 다른 부모를 선택해 올라감
- `git checkout HEAD~^2~2` : 수식을 같이 활용할 수 있음

![image.png](/images/git1/image%2026.png)

## 3. **브랜치 스파게티**

![image.png](/images/git1/image%2027.png)

- `main` 브랜치의 몇 번 이전 커밋에 `one`, `two`,`three` 총 3개의 브랜치가 있습니다.
- main의 최근 커밋 몇 개를 나머지 세 개의 브랜치에 반영하려고 합니다.
    - `one` 브랜치는 순서를 바꾸고 `C5`커밋을 삭제
        - `git rebase -i one C5` :`C5` 기준으로 `one` 브랜치 커밋들을 재정렬
        - `git rebase HEAD one` :`one`를 현재 라인 위로 붙임
    - `two`브랜치는 순서만 바꿈
        - `git rebase -i two C5` :`C5` 기준으로 `two`  브랜치 커밋들을 재정렬
        - `git rebase HEAD two` :`two`를 현재 라인 위로 붙임
    - `three`브랜치는 하나의 커밋만 가져옴
        - `git rebase C2 three`: `three`를 `C2` 위로 이동

![image.png](/images/git1/image%2028.png)