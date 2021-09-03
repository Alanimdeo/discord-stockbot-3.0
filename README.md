# 한국 주식 봇 v3
 한국 증시를 바탕으로 한 디스코드용 봇입니다.

## 목차
- [사용 방법](#사용-방법)
- [명령어](#명령어)
- [개발 동기](#개발-동기)

## 사용 방법
 일반적인 경우 [봇 초대](#봇-초대)를 이용하시면 됩니다.

### 봇 초대
 [이 링크](https://discord.com/api/oauth2/authorize?client_id=797027394216001536&permissions=67356736&scope=bot)로 들어가시면 봇을 서버로 초대하실 수 있습니다.

### 직접 봇 생성
 직접 봇을 생성하여 사용하실 경우, [다음 페이지](https://stockbot.alan.imdeo.kr/how-to-install)를 참조해 주세요.

## 명령어
 자세한 설명은 [이 사이트](https://stockbot.alan.imdeo.kr)에서 확인하실 수 있습니다.
- 기본
    - `/가입`
    - `/도움말`
- 돈
    - `/돈 확인`
    - `/돈 송금`
    - `/용돈`
- 주식
    - `/주식 확인`
    - `/주식 내주식`
    - `/주식 구매`
    - `/주식 판매`
- 로또
    - `/로또 회차`
    - `/로또 최근회차`
    - `/로또 확인`
    - `/로또 구매 자동`
    - `/로또 구매 수동`
- 기타
    - `/한강`

## 개발 동기
 원래 Python 기반의 [주식봇 2.0](https://github.com/alanimdeo/discord-stockbot-2.0)을 개발 중이었으나, 2021년 8월 28일 갑작스럽게 discord.py의 제작자가 [discord.py의 개발 중단을 선언](https://gist.github.com/Rapptz/4a2f62751b9600a31a0d3c78100287f1)함에 따라 node.js 기반의 discord.js로 다시 개발을 하게 되었습니다.