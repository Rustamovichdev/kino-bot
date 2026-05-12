async function panelCommand(ctx) {
    const buttons = [
        [{ text: "Kanal qo'shish", callback_data: "add_channel" }],
        [{ text: "Kanal o'chirish", callback_data: "delete_channel" }],
    ];
    ctx.reply("Admin", {
        reply_markup: {
            keyboard: buttons,
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    });
}

module.exports = panelCommand;
