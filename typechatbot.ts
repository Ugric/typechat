import * as discord from 'discord.js';
import { Client } from 'discord.js';
import db from "./app";
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_MEMBERS", "GUILD_INVITES", "GUILD_INTEGRATIONS", "GUILD_PRESENCES"], partials: ["CHANNEL"] });


const linkaccount = (member: { id: any; })=>new discord.MessageEmbed().setTitle("Link your TypeChat account!").setDescription("Link your Discord and TypeChat account to get the best experience with the Platform!").setURL(`https://tchat.us.to/link/${member.id}`)


client.on('ready', () => {
    console.log(`Logged into discord as ${client.user.tag}!`);
    client.user.setActivity('TypeChat💬', { type: 'PLAYING' })
});

client.on('messageCreate', async message => {
    if (message.author.id == client.user.id || message.author.bot) return
    console.log(message.guild)
    if(!message.guild) {
        if (["!unlink", "!link"].includes(message.content)) {
            const link = await db.db.get("SELECT * FROM discordAccountLink WHERE discordID=:discordID", { ":discordID": message.author.id })
            if (message.content === "!unlink") {
                if (link) {
                await db.db.run("DELETE FROM discordAccountLink WHERE discordID=:discordID", {":discordID": message.author.id})
                const member = client.guilds.cache.get("891393852068470804").members.cache.get(message.author.id)
                member.setNickname('', "unlink account")
                member.roles.remove(member.guild.roles.cache.find(role => role.name === "Online"), "unlink account")
                message.reply({ embeds: [new discord.MessageEmbed().setTitle("Unlinked 🔓")] })}
                else {
                    message.reply({ embeds: [new discord.MessageEmbed().setTitle("Not Linked")] })
                }
            } else if (message.content === "!link") {
                if (!link) {
                    message.reply({ embeds: [linkaccount(message.author)] })
                } else {
                    message.reply({ embeds: [new discord.MessageEmbed().setTitle("Already Linked")] })
                }
            }
        }
        
    }
})

client.on('guildMemberAdd', async member => {
    const link = await db.db.get("SELECT * FROM discordAccountLink WHERE discordID=:discordID", { ":discordID": member.id })
    if (!link) {
        member.send({
            embeds: [new discord.MessageEmbed().setTitle(`hello ${member.displayName} 👋`).setDescription("Welcome to the TypeChat Discord Server!").setThumbnail("https://tchat.us.to/logo.png"),
            linkaccount(member)]
        })
    } else {
        const accountdata = await db.db.get(
            "SELECT * FROM accounts WHERE accountID=:accountID",
            {
              ":accountID": link.accountID,
            }
        );
        member.send({
            embeds: [new discord.MessageEmbed().setTitle(`hello ${member.displayName} 👋`).setDescription("Welcome back to the TypeChat Discord Server!").setThumbnail("https://tchat.us.to/logo.png"),
            new discord.MessageEmbed().setTitle(`${accountdata.username}#${accountdata.tag}`).setDescription(`your account has been linked with \`${accountdata.username}#${accountdata.tag}\`, type \`!unlink\` to unlink your discord account from your typechat account!`).setThumbnail(`https://tchat.us.to/files/${accountdata.profilePic}`)]
        })
        member.setNickname(accountdata.username, "rejoin")
        member.roles.add(member.guild.roles.cache.find(role => role.name === "Online"), "rejoin")
    }
});

client.login(require("./discordtoken.json"));
export default client