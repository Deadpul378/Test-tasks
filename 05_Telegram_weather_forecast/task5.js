import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const botToken = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const weatherApiKey = "b4614c7c96369265bf5a92c70c916dc7";

const bot = new TelegramBot(botToken, { polling: true });

const mainMenu = {
  reply_markup: {
    keyboard: [[{ text: "Weather forecast in London" }], [{ text: "Weather forecast in New York" }], [{ text: "Back to menu" }]],
    resize_keyboard: true,
  },
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Welcome! Use the menu below to choose a city and interval for the weather forecast.", mainMenu);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "Back to menu") {
    bot.sendMessage(chatId, "Back to main menu:", mainMenu);
  } else if (text === "Weather forecast in London" || text === "Weather forecast in New York") {
    const city = text.split(" in ")[1];
    bot.sendMessage(chatId, `Choose the interval for ${city}:`, {
      reply_markup: {
        keyboard: [[{ text: `3-hour interval for ${city}` }], [{ text: `6-hour interval for ${city}` }], [{ text: "Back to menu" }]],
        resize_keyboard: true,
      },
    });
  } else if (text.startsWith("3-hour interval for") || text.startsWith("6-hour interval for")) {
    const [intervalHours, city] = text.split(" for ");
    const interval = intervalHours.startsWith("3") ? 3 : 6;

    getWeatherForecast(chatId, city, interval);
  }
});

async function getWeatherForecast(chatId, city, intervalHours) {
  try {
    const response = await axios.get("http://api.openweathermap.org/data/2.5/forecast", {
      params: {
        q: city,
        units: "metric",
        cnt: 40,
        appid: weatherApiKey,
      },
    });

    if (response.data && response.data.list) {
      const forecasts = {};
      response.data.list.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

        if (!forecasts[day]) {
          forecasts[day] = [];
        }

        if (date.getHours() % intervalHours === 0) {
          forecasts[day].push(`${date.getHours()}:00 - ${forecast.main.temp}°C, ощущается как ${forecast.main.feels_like}°C, ${forecast.weather[0].description}`);
        }
      });

      let message = `Погода в ${city}:\n\n`;
      for (const [day, dayForecasts] of Object.entries(forecasts)) {
        message += `${day}:\n${dayForecasts.join("\n")}\n\n`;
      }

      bot.sendMessage(chatId, message.trim());
    } else {
      bot.sendMessage(chatId, "Sorry, no weather data available.");
    }
  } catch (error) {
    console.error("Error retrieving weather data:", error);
    bot.sendMessage(chatId, "Sorry, there was an error retrieving the weather data.");
  }
}
