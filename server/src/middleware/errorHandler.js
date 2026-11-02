function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }
  const status = err.status || 500;
  if (!err.status) console.error(err); // only log unexpected errors
  res.status(status).json({
    message: status >= 500 && !err.status ? 'Internal server error' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFound, errorHandler };
