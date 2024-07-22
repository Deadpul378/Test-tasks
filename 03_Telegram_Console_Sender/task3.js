import { Command } from "commander";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import path from "path";

const program = new Command();
const token = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const chatId = "836240306";
const bot = new TelegramBot(token, { polling: false });

program.name("telegram-console-sender").description("CLI to send messages and photos to a Telegram bot").version("1.0.0");

program
  .command("message <text>")
  .description("Send a message to the Telegram bot")
  .action(async (text) => {
    try {
      await bot.sendMessage(chatId, text);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      process.exit();
    }
  });

program
  .command("photo <filePath>")
  .description("Send a photo to the Telegram bot")
  .action(async (filePath) => {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) {
      console.error("File does not exist:", absolutePath);
      process.exit(1);
    }
    try {
      await bot.sendPhoto(chatId, absolutePath);
      console.log("Photo sent successfully");
    } catch (error) {
      console.error("Error sending photo:", error);
    } finally {
      process.exit();
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
