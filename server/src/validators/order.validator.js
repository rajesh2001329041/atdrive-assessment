const mongoose = require('mongoose');
const { z } = require('zod');

const orderSchema = z.object({
  productIds: z
    .array(z.string().refine((id) => mongoose.isValidObjectId(id), 'Invalid product id'))
    .min(1, 'At least one product is required'),
});

const orderIdParamSchema = z.object({ id: z.coerce.number().int().positive('Invalid order id') });

module.exports = { orderSchema, orderIdParamSchema };
