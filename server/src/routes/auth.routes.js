const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/httpError');
const { credentialsSchema } = require('../validators/auth.validator');

router.post('/register', validate(credentialsSchema), asyncHandler(controller.register));
router.post('/login', validate(credentialsSchema), asyncHandler(controller.login));

module.exports = router;
