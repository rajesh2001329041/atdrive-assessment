const router = require('express').Router();
const controller = require('../controllers/product.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/httpError');
const { productSchema, productUpdateSchema } = require('../validators/product.validator');

router.use(requireAuth);
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.post('/', validate(productSchema), asyncHandler(controller.create));
router.put('/:id', validate(productUpdateSchema), asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
