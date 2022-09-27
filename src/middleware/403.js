'use strict';

module.exports = (req, res, next) => {
  res.status(403).send({
    error: 403,
    route: req.baseUrl,
    message: 'Forbidden',
  });
};
