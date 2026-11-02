const router = require('express').Router();
const controller = require('../controllers/weather.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/httpError');
const { weatherQuerySchema } = require('../validators/weather.validator');

router.get('/', requireAuth, validate(weatherQuerySchema, 'query'), asyncHandler(controller.getWeather));

module.exports = router;
