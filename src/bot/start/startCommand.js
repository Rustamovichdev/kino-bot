const pool = require("../../db");
const { Markup } = require("telegraf");

async function startCommand(ctx) {
    const chatId = ctx.from.id;

    try {
        const result = await pool.query("SELECT * FROM channels;");
        const channels = result.rows;

        let isCheck = true;
        const f = [];

        for (let i = 0; i < channels.length; i++) {
            const member = await ctx.telegram.getChatMember(
                channels[i].channel_id,
                chatId,
            );
            const status = ["creator", "member", "administrator"];

            if (!status.includes(member.status)) {
                isCheck = false;
                f.push(channels[i]);
                break;
            }
        }

        if (isCheck) {
            ctx.deleteMessage();
            ctx.reply("Kino kodini yuboring");
        } else {
            let buttons = channels.map((item, index) => [
                Markup.button.url(`Kanal-${index + 1}`, item.channel_link),
            ]);

            buttons.push([Markup.button.callback("Tekshirish", "check_sub")]);

            await ctx.reply(
                "Barcha kanallarga azo bo'ling",
                Markup.inlineKeyboard(buttons),
            );
        }
    } catch (e) {
        console.log(e);
        ctx.reply("Nimadir xato ketti...");
    }
}

module.exports = startCommand;
