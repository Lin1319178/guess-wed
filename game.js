import * as DB from "./db.js";

let user = null;
let timer = null;
let timeNum = 60;
let hasBet = false;
let nowNum = { n1: "?", n2: "?", n3: "?", sum: 0 };
let betCount = 0;
let lastBetTime = 0;
let cheated = false;

window.onload = function () {
  if (sessionStorage.getItem("game_online")) {
    try {
      const u = JSON.parse(localStorage.getItem("nowUser"));
      if (u && u.account) {
        DB.addCheatLog(u.account, u.nickname, "违规多开页面作弊");
        DB.banAccount(u.account);
      }
    } catch (e) {}
    alert("禁止多开标签页，已封禁账号");
    location.href = "index.html";
    return;
  }
  sessionStorage.setItem("game_online", "1");

  let userData = localStorage.getItem("nowUser");
  if (!userData) {
    location.href = "index.html";
    return;
  }
  user = JSON.parse(userData);

  if (DB.isBanned(user.account)) {
    alert("账号已封禁，禁止游戏");
    location.href = "index.html";
    return;
  }

  document.getElementById("nickname").innerText = user.nickname;
  document.getElementById("score").innerText = user.score;

  const list = DB.getUserList();
  const check = list.find(x => x.id === user.id);
  if (!check || check.score !== user.score) {
    cheated = true;
    DB.addCheatLog(user.account, user.nickname, "篡改积分作弊");
    alert("数据篡改，账号封禁");
    DB.banAccount(user.account);
    location.href = "index.html";
    return;
  }

  startTimer();
  refreshGameData();
  refreshPublicBetTable();
  setInterval(refreshPublicBetTable,2000);
};

function startTimer() {
  timeNum = 60;
  document.getElementById("time").innerText = timeNum;
  clearInterval(timer);
  timer = setInterval(() => {
    timeNum--;
    document.getElementById("time").innerText = timeNum;
    if (timeNum <= 0) {
      clearInterval(timer);
      openAward();
    }
  }, 1000);
}

function refreshGameData() {
  let set = DB.getGameSet();
  if (set.setSum) {
    let n1, n2, n3;
    do {
      n1 = Math.floor(Math.random() * 10);
      n2 = Math.floor(Math.random() * 10);
      n3 = set.setSum - n1 - n2;
    } while (n3 < 0 || n3 > 9);
    nowNum = { n1, n2, n3, sum: set.setSum };
  } else {
    nowNum = { n1: "?", n2: "?", n3: "?", sum: 0 };
  }
  document.getElementById("n1").innerText = nowNum.n1;
  document.getElementById("n2").innerText = nowNum.n2;
  document.getElementById("n3").innerText = nowNum.n3;
  if (nowNum.sum > 0) {
    document.getElementById("calcStr").innerText = `${nowNum.n1}+${nowNum.n2}+${nowNum.n3}=${nowNum.sum}`;
  }
}

function refreshPublicBetTable(){
  let publicList = DB.getPublicBet();
  let html = "";
  if(publicList.length === 0){
    html = "<tr><td colspan='9'>暂无玩家下注</td></tr>";
  }else{
    publicList.forEach(item=>{
      html += `<tr>
        <td>${item.nickname}</td>
        <td>${item.big}</td>
        <td>${item.small}</td>
        <td>${item.odd}</td>
        <td>${item.even}</td>
        <td>${item.bigOdd}</td>
        <td>${item.bigEven}</td>
        <td>${item.smallOdd}</td>
        <td>${item.smallEven}</td>
      </tr>`;
    })
  }
  document.getElementById("publicBetBody").innerHTML = html;
}

function getBetInfo() {
  return {
    big: Number(document.getElementById("big").value) || 0,
    small: Number(document.getElementById("small").value) || 0,
    odd: Number(document.getElementById("odd").value) || 0,
    even: Number(document.getElementById("even").value) || 0,
    bigOdd: Number(document.getElementById("bigOdd").value) || 0,
    bigEven: Number(document.getElementById("bigEven").value) || 0,
    smallOdd: Number(document.getElementById("smallOdd").value) || 0,
    smallEven: Number(document.getElementById("smallEven").value) || 0
  };
}

function submitBet() {
  if (cheated) return;
  if (DB.isBanned(user.account)) {
    document.getElementById("msgTip").innerText = "账号已封禁";
    return;
  }
  const now = Date.now();
  if (now - lastBetTime < 10000) {
    document.getElementById("msgTip").innerText = "操作频繁";
    return;
  }
  lastBetTime = now;
  betCount++;
  if (betCount > 10) {
    DB.addCheatLog(user.account, user.nickname, "高频投注作弊");
    DB.banAccount(user.account);
    alert("异常操作，账号封禁");
    location.href = "index.html";
    return;
  }
  if (hasBet) {
    document.getElementById("msgTip").innerText = "已投注不可重复提交";
    return;
  }
  let bet = getBetInfo();
  let total = Object.values(bet).reduce((a, b) => a + b, 0);
  if (total <= 0) {
    document.getElementById("msgTip").innerText = "请输入投注积分";
    return;
  }
  if (total > user.score) {
    document.getElementById("msgTip").innerText = "积分不足";
    return;
  }

  let betList = DB.getBetData();
  betList.push({userId:user.id, betInfo:bet, totalBet:total});
  DB.saveBetData(betList);

  let pubList = DB.getPublicBet();
  pubList = pubList.filter(p=>p.userId !== user.id);
  pubList.push({
    userId:user.id,
    nickname:user.nickname,
    ...bet
  });
  DB.savePublicBet(pubList);

  hasBet = true;
  document.getElementById("msgTip").innerText = "投注成功";
  refreshPublicBetTable();
}

function cancelBet() {
  if (cheated) return;
  if (!hasBet) {
    document.getElementById("msgTip").innerText = "暂无投注";
    return;
  }
  let betList = DB.getBetData().filter(item => item.userId !== user.id);
  DB.saveBetData(betList);

  let pubList = DB.getPublicBet().filter(p=>p.userId !== user.id);
  DB.savePublicBet(pubList);

  hasBet = false;
  document.getElementById("msgTip").innerText = "撤单成功";
  refreshPublicBetTable();
}

function openAward() {
  if (cheated) return;
  let set = DB.getGameSet();
  let sum = set.setSum || Math.floor(Math.random() * 28);
  let n1, n2, n3;
  do {
    n1 = Math.floor(Math.random() * 10);
    n2 = Math.floor(Math.random() * 10);
    n3 = sum - n1 - n2;
  } while (n3 < 0 || n3 > 9);

  let isBig = sum >= 14;
  let isOdd = sum % 2 !== 0;
  let type = "";
  if (isBig && isOdd) type = "bigOdd";
  else if (isBig && !isOdd) type = "bigEven";
  else if (!isBig && isOdd) type = "smallOdd";
  else type = "smallEven";

  let recordList = DB.getOpenRecord();
  recordList.unshift({
    time: new Date().toLocaleString(),
    num: `${n1}+${n2}+${n3}=${sum}`,
    res: (isBig ? "大" : "小") + " " + (isOdd ? "单" : "双")
  });
  DB.saveOpenRecord(recordList);

  let userList = DB.getUserList();
  let betList = DB.getBetData();
  betList.forEach(betItem => {
    let uIndex = userList.findIndex(u => u.id === betItem.userId);
    if (uIndex === -1) return;
    let profit = 0;
    if (sum !== 13 && sum !== 14) {
      if (betItem.betInfo.big > 0 && isBig) profit += betItem.betInfo.big * 1.6;
      if (betItem.betInfo.small > 0 && !isBig) profit += betItem.betInfo.small * 1.6;
      if (betItem.betInfo.odd > 0 && isOdd) profit += betItem.betInfo.odd * 1.6;
      if (betItem.betInfo.even > 0 && !isOdd) profit += betItem.betInfo.even * 1.6;
      if (betItem.betInfo.bigOdd > 0 && type === "bigOdd") profit += betItem.betInfo.bigOdd * 4.2;
      if (betItem.betInfo.bigEven > 0 && type === "bigEven") profit += betItem.betInfo.bigEven * 5;
      if (betItem.betInfo.smallOdd > 0 && type === "smallOdd") profit += betItem.