const {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} = require("infra/errors");

function onErrorHandler(error, req, res) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    console.warn("> [WARNING] onErrorHandler:", {
      method: req.method,
      url: req.url,
      message: error.message,
    });
    return res.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
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
