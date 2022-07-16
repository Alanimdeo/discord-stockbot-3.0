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
  - `/로또 회차확인`
  - `/로또 당첨확인`
  - `/로또 구매 자동`
  - `/로또 구매 수동`
- 금
  - `/금 시세`
  - `/금 확인`
  - `/금 구매`
  - `/금 판매`
- 도박
  - `/홀짝`
- 기타
  - `/한강`

## config.js 형식

```js
export default {
  token: "Bot token",
  adminPrefix: "=stock",
  adminIDs: ["ID as string"...],
  mysqlConfig: {
    host: "MySQL host",
    port: 3306,
    user: "MySQL username",
    password: "MySQL password",
    database: "stockbot",
  },
  exportCorpListAsFile: false,
}
```
