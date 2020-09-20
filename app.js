// JD-Sign-Bot
const fs = require("fs")
const download = require('download')
const exec = require('child_process').execSync
const fetch = require('node-fetch')

const JD_COOKIE = process.env.JD_COOKIE
const WEICHAT_CORPID = process.env.WEICHAT_CORPID
const WEICHAT_AGENTID = Number(process.env.WEICHAT_AGENTID)
const WEICHAT_CORPSECRET = process.env.WEICHAT_CORPSECRET

async function downFile() {
  const url = `https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js`

  await download(url, "./")
}

async function ReplaceCookie() {
  let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8');
  content = content.replace(/var Key = ''/, `var Key = '${JD_COOKIE}'`);

  await fs.writeFileSync('./JD_DailyBonus.js', content, 'utf8')
}

async function sendNotify(content) {
  (async () => {
    const body = {
      corpid: WEICHAT_CORPID,
      agentid: WEICHAT_AGENTID,
      corpsecret: WEICHAT_CORPSECRET,
      message: content
    };

    const response = await fetch('https://api.yqqy.top/qiye_weichat', {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();

    console.log(json);
  })();
}

async function start() {
  if (!JD_COOKIE) {
    console.log('请写入 JD_COOKIE 后再继续');
    return
  }

  // 下载最新代码
  await downFile();
  console.log("下载代码完毕");

  // 替换变量
  await ReplaceCookie();
  console.log("替换变量完毕");

  // 执行
  await exec("node JD_DailyBonus.js >> result.txt");
  console.log("执行完毕");

  // 微信通知
  if (WEICHAT_CORPID) {
    let path = "./result.txt";
    let content = "";

    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
    }

    // 发送签到数据
    await sendNotify(content.split("【签到概览】")[0]);
    // 发送签到统计
    await sendNotify("【签到概览】" + content.split("【签到概览】")[1]);
    console.log("发送结果完毕");
  }
}

start()