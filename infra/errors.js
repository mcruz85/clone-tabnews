export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Internal Server Error not expected", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Contact the system administrator";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service unavalibe ", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Contact the system administrator";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Validation failed", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "Check the data sent";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Not found", {
      cause,
    });
    this.name = "NotFoundError";
    this.action = action || "Please check the paramenter and try again";
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Invalid credentials", {
      cause,
    });
    this.name = "UnauthorizedError";
    this.action = action || "Please check the credentials and try again";
    this.statusCode = 401;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor({ method }) {
    super("Method Not Allowed");
    this.name = "MethodNotAllowedError";
    this.message = `Method "${method}" not allowed`;
    this.action = "Verify the allowed methods for the endpoint";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
