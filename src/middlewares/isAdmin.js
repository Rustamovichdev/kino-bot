require("dotenv").config();

const adminIds = process.env.ADMIN.split(",").map((id) => parseInt(id.trim()));
async function isAdmin(ctx, next) {
    const userId = ctx.from.id;
    // Replace with your actual admin user IDs

    if (adminIds.includes(userId)) {
        await next();
    } else {
        await ctx.reply("Siz admin emassiz!");
    }
}

module.exports = isAdmin;
