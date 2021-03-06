import config from "../../config.json";
import { commandInt } from "../interfaces/commandInt";
import { TextChannel, MessageEmbed } from "discord.js";

export const restrict: commandInt = {
  //prefix and description - prefix is necessary to trigger command, description is for the record.
  prefix: "restrict",
  description:
    "Restrict a user's permissions. Use the format 'restrict <user> <reason>'. Only available to server moderators.",
  command: async function suspend(message) {
    //check for appropriate permissions
    if (!message.member?.hasPermission("KICK_MEMBERS")) {
      message.channel.send(`ERROR 401: Missing permissions.`);
      return "failed";
    }
    //check for log channel setting
    const modChannel = message.guild?.channels.cache.find(
      (channel) => channel.name === config.log_channel
    ) as TextChannel;
    if (!modChannel) {
      message.channel.send(`ERROR 404: Log channel not found.`);
      return "failed";
    }
    //check for suspend category setting
    const suspendCategory = config.silence_category;
    const category = message.guild?.channels.cache.find(
      (c) => c.name === suspendCategory && c.type === "category"
    );
    if (!category) {
      message.channel.send(`ERROR 404: Missing suspend category.`);
      return "failed";
    }
    //check for suspend role setting
    const suspend = message.guild?.roles.cache.find(
      (role) => role.name == config.silence_role
    );
    if (!suspend) {
      message.channel.send(`ERROR 404: Missing suspend role.`);
      return "failed";
    }
    const mod = message.author;
    const msgArguments = message.content.split(" ");
    const user = message.mentions.members?.first();
    //check for valid user tag
    if (!user) {
      message.channel.send(`ERROR 404: Invalid user tag.`);
      return "failed";
    }
    //cannot target self
    if (message.mentions.users.first() === mod) {
      message.channel.send(`ERROR 400: Cannot target self.`);
      return "failed";
    }
    const reasonArg = msgArguments.slice(2, msgArguments.length);
    //check for reason provided, if none then create one.
    let reason = reasonArg.join(" ");
    if (reason == "") {
      reason = "ERROR 404: No reason provided.";
    }
    //logging embed
    const restrictEmbed = new MessageEmbed()
      .setColor("#FF0000")
      .setTitle(`Access Restricted!`)
      .addFields(
        {
          name: "Event:",
          value: `<@!${mod}> has suspended <@!${user}>.`,
        },
        {
          name: "Reason:",
          value: `${reason}`,
        }
      )
      .setFooter("BEEP BOOP: Please remember to follow our rules!");
    modChannel.send(restrictEmbed);
    //assign roles
    user.roles.set([suspend]);
    //create suspend channel
    const channelName = `suspended-${user.user.username}`;
    message.guild?.channels.create(channelName, {
      type: "text",
      permissionOverwrites: [
        {
          id: user.id,
          allow: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
        },
        {
          id: message.guild?.id,
          deny: ["VIEW_CHANNEL", "READ_MESSAGE_HISTORY", "SEND_MESSAGES"],
        },
      ],
      parent: category,
    });
    user.send(
      `BEEP BOOP: Suspension protocol initiated for: ${reason} - Appeal channel creation complete.`
    );
    return "success";
  },
};
