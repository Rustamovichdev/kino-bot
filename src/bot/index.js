const { Telegraf } = require("telegraf");
const startCommand = require("./start/startCommand");
const panelCommand = require("./panel/panelCommand");
const isAdmin = require("../middlewares/isAdmin");
const removeChannel = require("./panel/removeChannel");
const {
    addChannel,
    addChannelMessage,
    addChannelType,
    waitingForChannel,
} = require("./panel/addChannel");

require("dotenv").config();
const bot = new Telegraf(process.env.TOKEN);

bot.command("start", startCommand);
bot.command("panel", isAdmin, panelCommand);

bot.action("check_sub", startCommand);

bot.hears("Kanal qo'shish", addChannel);
bot.hears("Kanal o'chirish", removeChannel);

bot.action(/^channel_type_(public|private)$/, isAdmin, addChannelType);

bot.action("cancel_action", isAdmin, async (ctx) => {
    await ctx.answerCbQuery();
    waitingForChannel.delete(ctx.from.id);
    await ctx.editMessageText("❌ Bekor qilindi");
});

bot.on("text", async (ctx, next) => {
    if (waitingForChannel.has(ctx.from.id)) {
        return addChannelMessage(ctx);
    }
    return next();
});

module.exports = bot;
