const { Telegraf } = require("telegraf");
const startCommand = require("./modules/startCommand");
const panelCommand = require("./modules/panelCommand");
require("dotenv").config();
const bot = new Telegraf(process.env.TOKEN);

bot.command("start", startCommand);
bot.command("panel", panelCommand);

bot.launch();

console.log("bot ishladi....");
