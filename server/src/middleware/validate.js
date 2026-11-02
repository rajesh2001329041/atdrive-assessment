const { HttpError } = require('../utils/httpError');

// validate(schema, 'body' | 'params' | 'query') -> replaces the source with parsed data.
const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(new HttpError(400, 'Validation failed', details));
  }
  req[source] = result.data;
  next();
};

module.exports = { validate };
