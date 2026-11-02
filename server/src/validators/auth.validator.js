const { z } = require('zod');

const credentialsSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
});

module.exports = { credentialsSchema };
