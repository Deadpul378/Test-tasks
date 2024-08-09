import TelegramBot from "node-telegram-bot-api";
const token = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
  console.log(msg);
  const chatId = msg.chat.id;
  console.log("Your chat id is:", chatId);
});
//juuu
