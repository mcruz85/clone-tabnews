const { MethodNotAllowedError, InternalServerError } = require("infra/errors");

function onErrorHandler(error, req, res) {
  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });

  console.error("> [ERROR] onErrorHandler:", {
    method: req.method,
    url: req.url,
    message: error.message,
    stack: error.stack,
  });

  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatchHandler(req, res) {
  console.warn("> [WARNING] onNoMatchHandler:", {
    method: req.method,
    url: req.url,
  });

  const publicErrorObject = new MethodNotAllowedError({ method: req.method });
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onError: onErrorHandler,
    onNoMatch: onNoMatchHandler,
  },
};

export default controller;
