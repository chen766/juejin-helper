const JuejinHelper = require("juejin-helper");
const utils = require("./utils/utils");
const pushMessage = require("./utils/pushMessage");
const env = require("./utils/env");

class Task {
  constructor(juejin) {
    this.juejin = juejin;
  }

  taskName = "";

  async run () { }

  toString () {
    return `[${this.taskName}]`;
  }
}



class MockVisitTask extends Task {
  taskName = "模拟访问";

  async run () {
    console.log("--------模拟访问---------");
    try {
      const browser = this.juejin.browser();
      await browser.open();
      try {
        await browser.visitPage("/");
        console.log("掘金首页：页面访问成功");
      } catch (e) {
        console.log("掘金首页：页面访问失败");
      }
      await utils.wait(utils.randomRangeNumber(2000, 5000));
      try {
        await browser.visitPage("/user/center/signin");
        console.log("掘金每日签到：页面访问成功");
      } catch (e) {
        console.log("掘金每日签到：页面访问失败");
      }
      await utils.wait(utils.randomRangeNumber(2000, 5000));
      try {
        await browser.visitPage("/user/center/bugfix");
        console.log("掘金bugfix：页面访问成功");
      } catch (e) {
        console.log("掘金每日签到：页面访问失败");
      }
      await utils.wait(utils.randomRangeNumber(2000, 5000));
      await browser.close();
    } catch {
      console.log("浏览器API异常");
    }
    console.log("-------------------------");
  }
}

class CheckIn {
  cookie = "";
  username = "";

  constructor(cookie) {
    this.cookie = cookie;
  }

  async run () {
    const juejin = new JuejinHelper();
    try {
      await juejin.login(this.cookie);
    } catch (e) {
      console.error(e.message);
      throw new Error("登录失败, 请尝试更新Cookies!");
    }

    this.username = juejin.getUser().user_name;

    this.mockVisitTask = new MockVisitTask(juejin);

    await this.mockVisitTask.run();
  }

  toString () {

    return `掘友: ${this.username},访问fixbug页面成功`
  }
}

async function run (args) {
  const cookies = utils.getUsersCookie(env);
  let messageList = [];
  for (let cookie of cookies) {
    const checkin = new CheckIn(cookie);

    await utils.wait(utils.randomRangeNumber(1000, 5000)); // 初始等待1-5s
    await checkin.run(); // 执行

    const content = checkin.toString();
    console.log(content); // 打印结果

    messageList.push(content);
  }

  const message = messageList.join(`\n${"-".repeat(15)}\n`);
  pushMessage({
    subject: "掘金每日签到",
    text: message
  });
}

run(process.argv.splice(2)).catch(error => {
  pushMessage({
    subject: "掘金每日签到",
    html: `<strong>Error</strong><pre>${error.message}</pre>`
  });

  throw error;
});