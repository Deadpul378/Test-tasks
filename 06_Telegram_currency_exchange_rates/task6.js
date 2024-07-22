import TelegramBot from "node-telegram-bot-api";
import axios from "axios";

const botToken = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const weatherApiKey = "b4614c7c96369265bf5a92c70c916dc7";

const bot = new TelegramBot(botToken, { polling: true });

// Установка команд бота
bot.setMyCommands([{ command: "/start", description: "Start the bot" }]);

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendMainMenu(chatId);
});

// Обработка сообщений с клавиатуры
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  switch (text) {
    case "Weather Forecast":
      sendWeatherMenu(chatId);
      break;
    case "Exchange Rates":
      sendExchangeMenu(chatId);
      break;
    case "Back to Main Menu":
      sendMainMenu(chatId);
      break;
    case "London":
    case "New York":
      sendIntervalSelection(chatId, text);
      break;
    case "3_Hour Interval":
    case "6_Hour Interval":
      const interval = text.startsWith("3") ? 3 : 6;
      await sendWeatherForecast(chatId, interval);
      break;
    case "USD":
    case "EUR":
      await sendExchangeRate(chatId, text);
      break;
    default:
      break;
  }
});

// Функция для отправки основного меню
function sendMainMenu(chatId) {
  bot.sendMessage(chatId, "Choose an option:", {
    reply_markup: {
      keyboard: [[{ text: "Weather Forecast" }], [{ text: "Exchange Rates" }]],
      resize_keyboard: true,
    },
  });
}

// Функция для отправки меню выбора города для погоды
function sendWeatherMenu(chatId) {
  bot.sendMessage(chatId, "Choose a city for weather forecast:", {
    reply_markup: {
      keyboard: [[{ text: "London" }, { text: "New York" }], [{ text: "Back to Main Menu" }]],
      resize_keyboard: true,
    },
  });
}

// Функция для отправки меню выбора интервала
function sendIntervalSelection(chatId, city) {
  bot.sendMessage(chatId, `Choose the interval for ${city}:`, {
    reply_markup: {
      keyboard: [[{ text: "3_Hour Interval" }], [{ text: "6_Hour Interval" }], [{ text: "Back to Main Menu" }]],
      resize_keyboard: true,
    },
  });
}

// Функция для отправки меню выбора валюты для курсов обмена
function sendExchangeMenu(chatId) {
  bot.sendMessage(chatId, "Choose a currency for exchange rates:", {
    reply_markup: {
      keyboard: [[{ text: "USD" }, { text: "EUR" }], [{ text: "Back to Main Menu" }]],
      resize_keyboard: true,
    },
  });
}

// Функция для получения прогноза погоды с выбранным интервалом
async function sendWeatherForecast(chatId, interval) {
  const city = interval === 3 ? "London" : "New York"; // Для примера, выбираем один из городов в зависимости от интервала

  try {
    const response = await axios.get("http://api.openweathermap.org/data/2.5/forecast", {
      params: {
        q: city,
        units: "metric",
        cnt: interval === 3 ? 8 : 4,
        appid: weatherApiKey,
      },
    });

    if (response.data && response.data.list) {
      const forecasts = response.data.list
        .filter((_, index) => index % (interval / 3) === 0)
        .map((forecast) => {
          const date = new Date(forecast.dt * 1000);
          return `${date.getHours()}:00 - ${forecast.main.temp}°C, ${forecast.weather[0].description}`;
        })
        .join("\n");

      bot.sendMessage(chatId, `Weather forecast for ${city} with a ${interval}-hour interval:\n\n${forecasts}`);
    } else {
      bot.sendMessage(chatId, "Sorry, no weather data available.");
    }
  } catch (error) {
    console.error("Error retrieving weather data:", error);
    bot.sendMessage(chatId, "Sorry, there was an error retrieving the weather data.");
  }
}

// Функция для получения курсов валют
async function sendExchangeRate(chatId, currency) {
  try {
    // Логика получения курсов валют
    bot.sendMessage(chatId, `${currency} Exchange Rates`);
  } catch (error) {
    console.error("Error retrieving exchange rates:", error);
    bot.sendMessage(chatId, "Sorry, there was an error retrieving the exchange rates.");
  }
}
