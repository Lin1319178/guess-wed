import { getUserList, saveUserList, isBanned, banAccount } from "./db.js";
let isLogin = true;

function switchPage() {
  isLogin = !isLogin;
  document.getElementById("pageTitle").innerText = isLogin ? "账号登录" : "账号注册";
  document.getElementById("loginBox").style.display = isLogin ? "block" : "none";
  document.getElementById("regBox").style.display = isLogin ? "none" : "block";
  document.getElementById("tipText").innerText = "";
  document.getElementById("regTip").innerText = "";
}

function register() {
  let nick = document.getElementById("nick").value.trim();
  let acc = document.getElementById("regAcc").value.trim();
  let pwd = document.getElementById("regPwd").value.trim();
  if (!nick || !acc || !pwd) {
    document.getElementById("regTip").innerText = "信息不能为空";
    return;
  }
  if (isBanned(acc)) {
    document.getElementById("regTip").innerText = "账号已被封禁，无法注册";
    return;
  }
  let userList = getUserList();
  let exist = userList.find(item => item.account === acc);
  if (exist) {
    document.getElementById("regTip").innerText = "账号已存在";
    return;
  }
  let newUser = {
    id: Date.now(),
    nickname: nick,
    account: acc,
    password: pwd,
    score: 1000
  };
  userList.push(newUser);
  saveUserList(userList);
  document.getElementById("regTip").innerText = "注册成功";
  setTimeout(switchPage, 1200);
}

function login() {
  let acc = document.getElementById("acc").value.trim();
  let pwd = document.getElementById("pwd").value.trim();
  if (!acc || !pwd) {
    document.getElementById("tipText").innerText = "请填写账号密码";
    return;
  }
  if (isBanned(acc)) {
    document.getElementById("tipText").innerText = "账号已封禁，禁止登录";
    return;
  }
  let userList = getUserList();
  let user = userList.find(item => item.account === acc && item.password === pwd);
  if (!user) {
    document.getElementById("tipText").innerText = "账号密码错误";
    return;
  }
  localStorage.setItem("nowUser", JSON.stringify(user));
  location.href = "game.html";
}

window.switchPage = switchPage;
window.register = register;
window.login = login;