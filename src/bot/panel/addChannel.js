const { Markup } = require("telegraf");
const pool = require("../../db");

const waitingForChannel = new Map();  

// waitingForChannel structure => :

async function addChannel(ctx) {
    waitingForChannel.set(ctx.from.id, { step: "username" });
    ctx.reply(
        "Kanal usernameni yuboring\n Masalan: @kanalusername",
        Markup.inlineKeyboard([
            Markup.button.callback("Orqaga", "back_to_panel"),
        ]),
    );
}

async function addChannelMessage(ctx) {
    if (!waitingForChannel.has(ctx.from.id)) return;

    const state = waitingForChannel.get(ctx.from.id);
    const text = ctx.message.text.trim();

    // Bekor qilish
    if (text === "❌ Bekor qilish") {
        waitingForChannel.delete(ctx.from.id);
        return ctx.reply("❌ Bekor qilindi");
    }

    if (state.step === "username") {
        if (!text.startsWith("@")) {
            return ctx.reply(
                "❌ Username @ bilan boshlanishi kerak\nMasalan: @mychannel",
            );
        }

        try {
            const chat = await ctx.telegram.getChat(text);

            waitingForChannel.set(ctx.from.id, {
                step: "name",
                channel_id: chat.id,
                username: text,
            });

            await ctx.reply(
                `✅ Kanal topildi: ${chat.title}\n\n✏️ 2/4 — Kanal nomini yuboring\nMasalan: Mening kanalim`,
                Markup.inlineKeyboard([
                    [
                        Markup.button.callback(
                            "❌ Bekor qilish",
                            "cancel_action",
                        ),
                    ],
                ]),
            );
        } catch (e) {
            console.log(e);
            await ctx.reply(
                "❌ Kanal topilmadi. Bot kanalda admin bo'lganligini tekshiring",
            );
        }
    } else if (state.step === "name") {
        if (text.length < 2) {
            return ctx.reply("❌ Kanal nomi juda qisqa");
        }

        waitingForChannel.set(ctx.from.id, {
            ...state,
            step: "link",
            channel_name: text,
        });

        await ctx.reply(
            "🔗 3/4 — Kanal linkini yuboring\nMasalan: https://t.me/mychannel yoki https://t.me/+xxxxxx",
            Markup.inlineKeyboard([
                [Markup.button.callback("❌ Bekor qilish", "cancel_action")],
            ]),
        );
    } else if (state.step === "link") {
        if (!text.startsWith("https://t.me/")) {
            return ctx.reply("❌ Link https://t.me/ bilan boshlanishi kerak");
        }

        waitingForChannel.set(ctx.from.id, {
            ...state,
            step: "type",
            channel_link: text,
        });

        await ctx.reply(
            "🔒 4/4 — Kanal turini tanlang",
            Markup.inlineKeyboard([
                [
                    Markup.button.callback(
                        "🌐 Ochiq (public)",
                        "channel_type_public",
                    ),
                ],
                [
                    Markup.button.callback(
                        "🔒 Yopiq (private)",
                        "channel_type_private",
                    ),
                ],
            ]),
        );
    }
}

async function addChannelType(ctx) {
    await ctx.answerCbQuery();

    const state = waitingForChannel.get(ctx.from.id);

    if (!state || state.step !== "type") {
        return ctx.reply("❌ Avval kanal qo'shish jarayonini boshlang");
    }

    const isPrivate = ctx.callbackQuery.data === "channel_type_private";

    try {
        const existing = await pool.query(
            `SELECT id FROM channels WHERE channel_id = $1`,
            [state.channel_id],
        );

        if (existing.rows.length > 0) {
            await pool.query(
                `UPDATE channels 
         SET channel_name = $1, channel_link = $2, is_private = $3 
         WHERE channel_id = $4`,
                [
                    state.channel_name,
                    state.channel_link,
                    isPrivate,
                    state.channel_id,
                ],
            );
        } else {
            await pool.query(
                `INSERT INTO channels (channel_id, channel_name, channel_link, is_private) 
         VALUES ($1, $2, $3, $4)`,
                [
                    state.channel_id,
                    state.channel_name,
                    state.channel_link,
                    isPrivate,
                ],
            );
        }

        waitingForChannel.delete(ctx.from.id);

        await ctx.editMessageText(
            `✅ Kanal muvaffaqiyatli qo'shildi!\n\n +
                📛 Nomi: ${state.channel_name}\n +
                🔗 Link: ${state.channel_link}\n +
                🔒 Turi: ${isPrivate ? "Yopiq (private)" : "Ochiq (public)"}`,
        );
    } catch (e) {
        console.log(e);
        await ctx.reply("❌ Xatolik yuz berdi");
    }
}

module.exports = {
    addChannel,
    addChannelMessage,
    addChannelType,
    waitingForChannel,
};
