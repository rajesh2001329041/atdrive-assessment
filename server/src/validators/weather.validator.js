const { z } = require('zod');

const weatherQuerySchema = z.object({ city: z.string().trim().min(1).max(80).default('Hyderabad') });

module.exports = { weatherQuerySchema };
