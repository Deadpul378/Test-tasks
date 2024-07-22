import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const botToken = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const weatherApiKey = "b4614c7c96369265bf5a92c70c916dc7";

const bot = new TelegramBot(botToken, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Choose a city:", {
    reply_markup: {
      inline_keyboard: [[{ text: "Weather forecast in London", callback_data: "London" }], [{ text: "Weather forecast in New York", callback_data: "New York" }]],
    },
  });
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const [interval, city] = query.data.includes("_") ? query.data.split("_") : [null, query.data];

  if (!interval) {
    bot.sendMessage(chatId, `Choose the interval for ${city}:`, {
      reply_markup: {
        inline_keyboard: [[{ text: "With a 3-hour interval", callback_data: `3_${city}` }], [{ text: "With a 6-hour interval", callback_data: `6_${city}` }]],
      },
    });
    return;
  }

  const intervalHours = interval === "3" ? 3 : 6;

  try {
    const response = await axios.get("http://api.openweathermap.org/data/2.5/forecast", {
      params: {
        q: city,
        units: "metric",
        cnt: intervalHours === 3 ? 8 : 4,
        appid: weatherApiKey,
      },
    });

    if (response.data && response.data.list) {
      const forecasts = response.data.list
        .filter((_, index) => index % (intervalHours / 3) === 0)
        .map((forecast) => {
          const date = new Date(forecast.dt * 1000);
          return `${date.getHours()}:00 - ${forecast.main.temp}°C, ${forecast.weather[0].description}`;
        })
        .join("\n");

      bot.sendMessage(chatId, `Weather forecast for ${city} with a ${intervalHours}-hour interval:\n\n${forecasts}`);
    } else {
      bot.sendMessage(chatId, "Sorry, no weather data available.");
    }
  } catch (error) {
    console.error("Error retrieving weather data:", error);
    bot.sendMessage(chatId, "Sorry, there was an error retrieving the weather data.");
  }
});
