const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/httpError');
const { orderSchema, orderIdParamSchema } = require('../validators/order.validator');

router.use(requireAuth);
router.get('/', asyncHandler(controller.list));
router.post('/', validate(orderSchema), asyncHandler(controller.create));
router.get('/:id', validate(orderIdParamSchema, 'params'), asyncHandler(controller.getOne));
router.put('/:id', validate(orderIdParamSchema, 'params'), validate(orderSchema), asyncHandler(controller.update));
router.delete('/:id', validate(orderIdParamSchema, 'params'), asyncHandler(controller.remove));

module.exports = router;
