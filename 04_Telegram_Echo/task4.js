import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const token = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`Message from ${msg.from.username}: ${text}`);

  if (text.toLowerCase() === "photo") {
    try {
      const response = await axios.get("https://picsum.photos/200/300", {
        responseType: "arraybuffer",
      });
      const photoBuffer = Buffer.from(response.data, "binary");

      await bot.sendPhoto(chatId, photoBuffer, {
        caption: "Here is your random photo!",
      });
      console.log("Photo sent successfully");
    } catch (error) {
      console.error("Error sending photo:", error);
    }
  } else {
    try {
      await bot.sendMessage(chatId, `You said: ${text}`);
      console.log("Echo message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
});
