/** Central error handler — always responds with JSON. */
module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(`[error] ${req.method} ${req.originalUrl} →`, err.message);

  // Malformed JSON body from the client
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON.' });
  }

  // Sequelize validation / unique constraint errors → 400 with the model message
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: (err.errors && err.errors[0] && err.errors[0].message) || 'Validation error.',
    });
  }

  const status = err.status || 500;
  if (status >= 500) {
    console.error(err.stack);
  }
  return res.status(status).json({ message: err.message || 'Internal server error.' });
};
