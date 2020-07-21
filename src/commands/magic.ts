import { commandInt } from "../interfaces/commandInt";
import { MessageEmbed } from "discord.js";
import { magicInt } from "../interfaces/magicInt";
import fetch from "node-fetch";

export const magic: commandInt = {
  //prefix and description - prefix is necessary to trigger command, description is for the record.
  prefix: "magic",
  description:
    "Returns a Magic: The Gathering card by name. Use the format 'magic <cardname>'.",
  command: async function (message) {
    const query = message.content.substring(7, message.content.length);
    if (!query) {
      if (message.id !== "test")
        message.channel.send(
          `ERROR 400: ${message.author}, missing card name.`
        );
      return "failed";
    }
    if (message.id !== "test") message.channel.send("STATUS 202: Searching...");
    const data = await fetch(
      `https://api.magicthegathering.io/v1/cards?name=${query}&pageSize=1`
    );
    const card: magicInt = await data.json();
    let flavour = card.cards[0].flavor;
    if (!flavour) {
      flavour = "ERROR 404: No flavour text found.";
    }
    let ability = card.cards[0].text;
    if (!ability) {
      ability = "ERROR 404: No abilities found.";
    }
    let image = card.cards[0].imageUrl;
    if (!image) {
      image =
        "https://gamepedia.cursecdn.com/mtgsalvation_gamepedia/thumb/f/f8/Magic_card_back.jpg/250px-Magic_card_back.jpg?version=56c40a91c76ffdbe89867f0bc5172888";
    }
    const cardEmbed = new MessageEmbed()
      .setColor("#ab47e6")
      .setTitle(card.cards[0].name)
      .setDescription(flavour)
      .addFields(
        {
          name: "Types",
          value: card.cards[0].types,
        },
        {
          name: "Cost",
          value: card.cards[0].manaCost,
        },
        {
          name: "Abilities",
          value: ability,
        }
      )
      .setImage(image);
    if (message.id !== "test") message.channel.send(cardEmbed);
    return "success";
  },
};
