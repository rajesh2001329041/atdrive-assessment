const { z } = require('zod');

const fields = {
  name: z.string().trim().min(1, 'Name is required').max(120),
  price: z.number({ invalid_type_error: 'Price must be a number' }).min(0, 'Price cannot be negative'),
  description: z.string().trim().max(1000),
};

const productSchema = z.object({ ...fields, description: fields.description.optional().default('') });

const productUpdateSchema = z
  .object(fields)
  .partial()
  .refine((v) => Object.keys(v).length > 0, { message: 'Provide at least one field to update' });

module.exports = { productSchema, productUpdateSchema };
