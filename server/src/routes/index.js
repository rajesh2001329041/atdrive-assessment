const router = require('express').Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', require('./auth.routes'));
router.use('/products', require('./product.routes'));
router.use('/orders', require('./order.routes'));
router.use('/weather', require('./weather.routes'));

module.exports = router;
