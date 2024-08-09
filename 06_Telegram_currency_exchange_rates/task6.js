import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import express from "express";

const botToken = "7079235887:AAHxixLSJsPaYPiaitCHG-m3tS6YjnVbrsc";
const weatherApiKey = "b4614c7c96369265bf5a92c70c916dc7";

const bot = new TelegramBot(botToken);
const app = express();
app.use(express.json());

// Установи Webhook
const railwayUrl = "https://test-tasks-production.up.railway.app"; // Замени на свой URL
bot.setWebHook(`${railwayUrl}/webhook/${botToken}`);

app.post(`/webhook/${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.setMyCommands([{ command: "/start", description: "Start the bot" }]);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  sendMainMenu(chatId);
});

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
    case "3-hour interval for London":
    case "6-hour interval for London":
    case "3-hour interval for New York":
    case "6-hour interval for New York":
      const interval = text.startsWith("3") ? 3 : 6;
      const city = text.includes("London") ? "London" : "New York";
      await sendWeatherForecast(chatId, city, interval);
      break;
    case "USD":
    case "EUR":
      await sendExchangeRate(chatId, text);
      break;
    default:
      break;
  }
});

function sendMainMenu(chatId) {
  bot.sendMessage(chatId, "Choose an option:", {
    reply_markup: {
      keyboard: [[{ text: "Weather Forecast" }], [{ text: "Exchange Rates" }]],
      resize_keyboard: true,
    },
  });
}

function sendWeatherMenu(chatId) {
  bot.sendMessage(chatId, "Choose a city for weather forecast:", {
    reply_markup: {
      keyboard: [[{ text: "London" }, { text: "New York" }], [{ text: "Back to Main Menu" }]],
      resize_keyboard: true,
    },
  });
}

function sendIntervalSelection(chatId, city) {
  bot.sendMessage(chatId, `Choose the interval for ${city}:`, {
    reply_markup: {
      keyboard: [[{ text: `3-hour interval for ${city}` }], [{ text: `6-hour interval for ${city}` }], [{ text: "Back to Main Menu" }]],
      resize_keyboard: true,
    },
  });
}

function sendExchangeMenu(chatId) {
  bot.sendMessage(chatId, "Choose a currency for exchange rates:", {
    reply_markup: {
      keyboard: [[{ text: "USD" }, { text: "EUR" }], [{ text: "Back to Main Menu" }]],
      resize_keyboard: true,
    },
  });
}

async function sendWeatherForecast(chatId, city, interval) {
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

        if (interval === 6) {
          if (date.getHours() % 6 === 0) {
            forecasts[day].push(`${date.getHours()}:00 - ${forecast.main.temp}°C, ощущается как ${forecast.main.feels_like}°C, ${forecast.weather[0].description}`);
          }
        } else {
          if (date.getHours() % 3 === 0) {
            forecasts[day].push(`${date.getHours()}:00 - ${forecast.main.temp}°C, ощущается как ${forecast.main.feels_like}°C, ${forecast.weather[0].description}`);
          }
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

async function sendExchangeRate(chatId, currency) {
  try {
    const privatResponse = await axios.get("https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5");
    const monoResponse = await axios.get("https://api.monobank.ua/bank/currency");

    const privatRate = privatResponse.data.find((rate) => rate.ccy === currency);
    const monoRate = monoResponse.data.find((rate) => rate.currencyCodeA === (currency === "USD" ? 840 : 978) && rate.currencyCodeB === 980);

    const responseMessage = `
      ${currency} Exchange Rates:
      PrivatBank: Buy - ${privatRate.buy}, Sell - ${privatRate.sale}
      Monobank: Buy - ${monoRate.rateBuy}, Sell - ${monoRate.rateSell}
      `;

    bot.sendMessage(chatId, responseMessage.trim());
  } catch (error) {
    console.error("Error retrieving exchange rates:", error);
    bot.sendMessage(chatId, "Sorry, there was an error retrieving the exchange rates.");
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
