const weatherService = require('../services/weather.service');

async function getWeather(req, res) {
  res.json(await weatherService.getWeather(req.query.city));
}

module.exports = { getWeather };
