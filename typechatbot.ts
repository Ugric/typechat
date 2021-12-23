import * as discord from "discord.js";
import { Client } from "discord.js";
import { generate } from "randomstring";
import db from "./app";
const client = new Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "DIRECT_MESSAGES",
    "GUILD_MEMBERS",
    "GUILD_INVITES",
    "GUILD_INTEGRATIONS",
    "GUILD_PRESENCES",
  ],
  partials: ["CHANNEL"],
});

const linkaccount = (member: { id: any }) => {
  if (db.linkurls.discordID[member.id]) {
    delete db.linkurls.linkID[db.linkurls.discordID[member.id]];
    delete db.linkurls.discordID[member.id];
  }
  const id = generate(20);
  db.linkurls.linkID[id] = member.id;
  db.linkurls.discordID[member.id] = id;
  return new discord.MessageEmbed()
    .setColor("#5656ff")
    .setTitle("Link your TypeChat account!")
    .setDescription(
      "Link your Discord and TypeChat account to get the best experience with the Platform!"
    )
    .setURL(`https://tchat.us.to/link/${id}`);
};

const serverID =
  process.env.NODE_ENV === "development"
    ? "891619528205795358"
    : "891393852068470804";
const roleID =
  process.env.NODE_ENV === "development"
    ? "891622093286940702"
    : "891410369241808936";
const unlinkedroleID =
  process.env.NODE_ENV === "development"
    ? "891677851647086652"
    : "891673538480701440";
const DMCommandsList = [
  {
    name: "!link",
    value: "link your discord account to your typechat account! 🔒",
  },
  {
    name: "!unlink",
    value: "unlink your discord account from your typechat account! 🔓",
  },
];

client.on("ready", () => {
  console.log(`Logged into discord as ${client.user.tag}!`);
  client.user.setActivity("TypeChat💬", { type: "PLAYING" });
});

client.on("messageCreate", async (message) => {
  if (message.author.id == client.user.id || message.author.bot) return;
  const link = await db.db.get(
    "SELECT * FROM discordAccountLink WHERE discordID=:discordID",
    { ":discordID": message.author.id }
  );
  const msg = message.content.trim()
  const command = msg.split(" ")
  if (command[0] === "!profile") {
    command.shift()
    let account = link
    if (command[0]) {
      account = await db.db.get(
        "SELECT * FROM discordAccountLink WHERE discordID=:discordID",
        { ":discordID": command[0].replace(/[\\<>@#&!]/g, "") }
      );
    }
    if (account) {
      const accountdata = await db.db.get(
        "SELECT * FROM accounts WHERE accountID=:accountID",
        {
          ":accountID": account.accountID,
        }
      );
      const embed = new discord.MessageEmbed().setTitle(accountdata.username + "#" + accountdata.tag).setColor("#5656ff").setThumbnail(`https://tchat.us.to/files/${accountdata.profilePic}`)
      if (accountdata.backgroundImage) {
        embed.setImage(`https://tchat.us.to/files/${accountdata.backgroundImage}`)
      }
      message.reply({ embeds: [embed] });

    }
    else {
      message.reply({
        embeds: [
          new discord.MessageEmbed()
            .setColor("#5656ff")
            .setTitle(command[0] ? "Requested Discord account not linked to TypeChat" : "Not Linked").setDescription(command[0] ? "You must link your account to a typechat account to access the profile command. do `!link`" : "Please type in an account that is linked with TypeChat.")
        ],
      });
    }
  }
  if (!message.guild) {
    if (["!unlink", "!link"].includes(msg)) {
      if (msg === "!unlink") {
        if (link) {
          await db.db.run(
            "DELETE FROM discordAccountLink WHERE discordID=:discordID",
            { ":discordID": message.author.id }
          );
          const member = client.guilds.cache
            .get(serverID)
            .members.cache.get(message.author.id);
          await member.setNickname("", "unlink account").catch(() => { });
          await member.roles.remove(roleID, "unlink account").catch(() => { });
          await member.roles
            .add(unlinkedroleID, "unlink account")
            .catch(() => { });
          message.reply({
            embeds: [
              new discord.MessageEmbed()
                .setColor("#5656ff")
                .setTitle("Unlinked 🔓"),
            ],
          });
        } else {
          message.reply({
            embeds: [
              new discord.MessageEmbed()
                .setColor("#5656ff")
                .setTitle("Not Linked"),
            ],
          });
        }
      } else if (msg === "!link") {
        if (!link) {
          message.reply({ embeds: [linkaccount(message.author)] });
        } else {
          message.reply({
            embeds: [
              new discord.MessageEmbed()
                .setColor("#5656ff")
                .setTitle("Already Linked"),
            ],
          });
        }
      }
    } else if (msg === "!help") {
      message.reply({
        embeds: [
          new discord.MessageEmbed()
            .setColor("#5656ff")
            .setTitle("DM Commands")
            .addFields(DMCommandsList),
        ],
      });
    }
  } else {
    if (msg === "!help") {
      message.reply({
        embeds: [
          new discord.MessageEmbed()
            .setColor("#5656ff")
            .setTitle("Server Commands")
            .setDescription("NO SERVER COMMANDS HAVE BEEN CREATED YET!"),
        ],
      });
    }
  }
});

client.on("guildMemberAdd", async (member) => {
  const link = await db.db.get(
    "SELECT * FROM discordAccountLink WHERE discordID=:discordID",
    { ":discordID": member.id }
  );
  if (!link) {
    member.send({
      embeds: [
        new discord.MessageEmbed()
          .setColor("#5656ff")
          .setTitle(`hello ${member.displayName} 👋`)
          .setDescription("Welcome to the TypeChat Discord Server!")
          .setThumbnail("https://tchat.us.to/logo.png"),
        linkaccount(member),
      ],
    });
    member.roles.add(unlinkedroleID, "not linked").catch(() => { });
  } else {
    const accountdata = await db.db.get(
      "SELECT * FROM accounts WHERE accountID=:accountID",
      {
        ":accountID": link.accountID,
      }
    );
    member.send({
      embeds: [
        new discord.MessageEmbed()
          .setColor("#5656ff")
          .setTitle(`hello ${member.displayName} 👋`)
          .setDescription("Welcome back to the TypeChat Discord Server!")
          .setThumbnail("https://tchat.us.to/logo.png"),
        new discord.MessageEmbed()
          .setColor("#5656ff")
          .setTitle(`${accountdata.username}#${accountdata.tag}`)
          .setDescription(
            `your account has been linked with \`${accountdata.username}#${accountdata.tag}\`, type \`!unlink\` to unlink your discord account from your typechat account!`
          )
          .setThumbnail(`https://tchat.us.to/files/${accountdata.profilePic}`),
      ],
    });
    await member.setNickname(accountdata.username, "rejoin").catch(() => { });
    await member.roles.add(roleID, "rejoin").catch(() => { });
    await member.roles.remove(unlinkedroleID, "rejoin").catch(() => { });
  }
});

client.login(process.env.NODE_ENV === "development" ? require("./devdiscordtoken.json") : require("./discordtoken.json"));
export { serverID, client, roleID, unlinkedroleID };
