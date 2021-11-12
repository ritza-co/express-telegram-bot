const express = require('express')
const expressApp = express()
const axios = require("axios");
const path = require("path")
const port = process.env.PORT || 3000;
expressApp.use(express.static('static'))
expressApp.use(express.json());

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
expressApp.use(bot.webhookCallback('/secret-path'))
bot.telegram.setWebhook('https://server.tld:8443/secret-path')

expressApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

bot.command('start', ctx => {
  console.log(ctx.from)
  bot.telegram.sendMessage(ctx.chat.id, 'Hello there! Welcome to the Code Capsules telegram bot.\nI respond to /weather and /currency. Please try them.', {
  })
})

bot.command('currency', ctx => {
  var rates;
  console.log(ctx.from)
  axios.get(`https://openexchangerates.org/api/latest.json?app_id=${process.env.EXCHANGE_TOKEN}&symbols=CAD%2CZAR%2CEUR`)
  .then(response => {
    console.log(response.data)
    rates = response.data.rates
    const message = `Hello, today the USD exchange rates are as follows:\n \nUSD -> ZAR: ${rates.ZAR}\nUSD -> EUR: ${rates.EUR}\nUSD -> CAD: ${rates.CAD}`
    bot.telegram.sendMessage(ctx.chat.id, message, {
    })
  })
})

bot.command('weather', ctx => {
  const params = {
    access_key: process.env.WEATHER_TOKEN,
    query: 'Cape Town'
  }
  
  axios.get('http://api.weatherstack.com/current', {params})
    .then(response => {
      const apiResponse = response.data;
      console.log(apiResponse)
      const message = `Hello, the current temperature in ${apiResponse.location.name} is ${apiResponse.current.temperature}℃`
      bot.telegram.sendMessage(ctx.chat.id, message, {
      })
    }).catch(error => {
      console.log(error);
    });
})

expressApp.listen(port, () => console.log(`Listening on ${port}`));