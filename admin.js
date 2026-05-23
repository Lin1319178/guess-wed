import * as DB from "./db.js";

function setSum() {
  let num = Number(document.getElementById("sumInput").value);
  if (isNaN(num) || num < 0 || num > 27) {
    document.getElementById("adminTip").innerText = "数值范围0-27";
    return;
  }
  DB.saveGameSet({ setSum: num });
  document.getElementById("adminTip").innerText = "开奖数值设置成功";
}

function refreshUser() {
  let userList = DB.getUserList();
  let html = "";
  userList.forEach(item => {
    html += `<tr>
      <td>${item.nickname}</td>
      <td>${item.account}</td>
      <td>${item.score}</td>
    </tr>`;
  });
  document.getElementById("userTable").innerHTML = html;
}

function addScore() {
  let account = document.getElementById("targetAccount").value.trim();
  let num = Number(document.getElementById("changeScore").value);
  if (!account || isNaN(num) || num <= 0) {
    document.getElementById("scoreTip").innerText = "填写正确账号与正数积分";
    return;
  }
  let userList = DB.getUserList();
  let idx = userList.findIndex(item => item.account === account);
  if (idx === -1) {
    document.getElementById("scoreTip").innerText = "未找到该账号";
    return;
  }
  userList[idx].score += num;
  DB.saveUserList(userList);
  document.getElementById("scoreTip").innerText = "加分成功";
  refreshUser();
}

function reduceScore() {
  let account = document.getElementById("targetAccount").value.trim();
  let num = Number(document.getElementById("changeScore").value);
  if (!account || isNaN(num) || num <= 0) {
    document.getElementById("scoreTip").innerText = "填写正确账号与正数积分";
    return;
  }
  let userList = DB.getUserList();
  let idx = userList.findIndex(item => item.account === account);
  if (idx === -1) {
    document.getElementById("scoreTip").innerText = "未找到该账号";
    return;
  }
  if (userList[idx].score < num) {
    document.getElementById("scoreTip").innerText = "积分不足无法扣除";
    return;
  }
  userList[idx].score -= num;
  DB.saveUserList(userList);
  document.getElementById("scoreTip").innerText = "扣分成功";
  refreshUser();
}

window.refreshApplyList = function(){
  let applyList = DB.getScoreApplyList();
  let userList = DB.getUserList();
  let html = "";
  if(applyList.length === 0){
    html = "<tr><td colspan='6'>暂无申请</td></tr>";
  }else{
    applyList.forEach((item,index)=>{
      html += `<tr>
        <td>${item.account}</td>
        <td>${item.nickname}</td>
        <td>${item.applyType}</td>
        <td>${item.score}</td>
        <td>${item.applyTime}</td>
        <td>
          <button class="btn btn-green" style="padding:4px 8px;font-size:12px" onclick="passApply(${index})">通过</button>
          <button class="btn btn-gray" style="padding:4px 8px;font-size:12px" onclick="rejectApply(${index})">驳回</button>
        </td>
      </tr>`;
    })
  }
  document.getElementById("applyTable").innerHTML = html;
}

window.passApply = function(idx){
  let applyList = DB.getScoreApplyList();
  let item = applyList[idx];
  let userList = DB.getUserList();
  let uIdx = userList.findIndex(u=>u.id === item.userId);
  if(uIdx === -1) return;
  if(item.applyType === "申请加分"){
    userList[uIdx].score += item.score;
  }else{
    if(userList[uIdx].score >= item.score){
      userList[uIdx].score -= item.score;
    }
  }
  DB.saveUserList(userList);
  applyList.splice(idx,1);
  DB.saveScoreApplyList(applyList);
  refreshApplyList();
  refreshUser();
  alert("审核处理完成");
}

window.rejectApply = function(idx){
  let applyList = DB.getScoreApplyList();
  applyList.splice(idx,1);
  DB.saveScoreApplyList(applyList);
  refreshApplyList();
  alert("已驳回申请");
}

window.onload = function(){
  refreshUser();
  refreshApplyList();
}

window.setSum = setSum;
window.addScore = addScore;
window.reduceScore = reduceScore;