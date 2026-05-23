const SECRET_SALT = 'Lk9j%2fXy7qWeRtYvUioPlmNbSaGfHdJgK';

const DB_KEY_USER = "guess_user_list";
const DB_KEY_RECORD = "guess_open_record";
const DB_KEY_BET = "guess_bet_data";
const DB_KEY_PUBLIC_BET = "guess_public_bet";
const DB_KEY_SET = "guess_game_set";
const DB_KEY_BAN = "guess_ban_list";
const DB_KEY_CHEAT_LOG = "guess_cheat_log";
const DB_KEY_SCORE_APPLY = "guess_score_apply";

function md5(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
function signData(data) {
  return md5(JSON.stringify(data) + SECRET_SALT);
}
function saveWithSign(key, data) {
  const obj = { data, sig: signData(data) };
  localStorage.setItem(key, JSON.stringify(obj));
}
function loadWithSign(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (!obj || !obj.data || !obj.sig) return null;
    if (obj.sig !== signData(obj.data)) return { data: null, cheated: true };
    return { data: obj.data, cheated: false };
  } catch (e) {
    return { data: null, cheated: true };
  }
}

function getUserList() {
  const res = loadWithSign(DB_KEY_USER);
  if (res.cheated) {
    localStorage.removeItem(DB_KEY_USER);
    return [];
  }
  return res.data || [];
}
function saveUserList(list) {
  saveWithSign(DB_KEY_USER, list);
}

function getOpenRecord() {
  const res = loadWithSign(DB_KEY_RECORD);
  if (res.cheated) {
    localStorage.removeItem(DB_KEY_RECORD);
    return [];
  }
  return res.data || [];
}
function saveOpenRecord(list) {
  saveWithSign(DB_KEY_RECORD, list);
}

function getBetData() {
  const res = loadWithSign(DB_KEY_BET);
  if (res.cheated) {
    localStorage.removeItem(DB_KEY_BET);
    return [];
  }
  return res.data || [];
}
function saveBetData(list) {
  saveWithSign(DB_KEY_BET, list);
}

function getPublicBet() {
  const res = loadWithSign(DB_KEY_PUBLIC_BET);
  return res.data || [];
}
function savePublicBet(list) {
  saveWithSign(DB_KEY_PUBLIC_BET, list);
}

function getGameSet() {
  const res = loadWithSign(DB_KEY_SET);
  if (res.cheated) return { setSum: null };
  return res.data || { setSum: null };
}
function saveGameSet(obj) {
  saveWithSign(DB_KEY_SET, obj);
}

function getBanList() {
  const res = loadWithSign(DB_KEY_BAN);
  return res.data || [];
}
function saveBanList(list) {
  saveWithSign(DB_KEY_BAN, list);
}
function banAccount(account) {
  let list = getBanList();
  if (!list.includes(account)) list.push(account);
  saveBanList(list);
}
function isBanned(account) {
  return getBanList().includes(account);
}

function getCheatLog() {
  const res = loadWithSign(DB_KEY_CHEAT_LOG);
  return res.data || [];
}
function saveCheatLog(logList) {
  saveWithSign(DB_KEY_CHEAT_LOG, logList);
}
function addCheatLog(account, nick, cheatType) {
  let logs = getCheatLog();
  logs.unshift({
    account, nickname: nick, cheatType,
    cheatTime: new Date().toLocaleString()
  });
  saveCheatLog(logs);
}

function getScoreApplyList() {
  const res = loadWithSign(DB_KEY_SCORE_APPLY);
  return res.data || [];
}
function saveScoreApplyList(list) {
  saveWithSign(DB_KEY_SCORE_APPLY, list);
}
function submitScoreApply(userInfo, applyType, scoreNum) {
  let list = getScoreApplyList();
  list.unshift({
    userId: userInfo.id,
    account: userInfo.account,
    nickname: userInfo.nickname,
    applyType,
    score: scoreNum,
    applyTime: new Date().toLocaleString(),
    status: "待审核"
  });
  saveScoreApplyList(list);
}

export {
  getUserList, saveUserList,
  getOpenRecord, saveOpenRecord,
  getBetData, saveBetData,
  getPublicBet, savePublicBet,
  getGameSet, saveGameSet,
  isBanned, banAccount,
  getCheatLog, addCheatLog, saveCheatLog,
  getScoreApplyList, saveScoreApplyList,
  submitScoreApply
};