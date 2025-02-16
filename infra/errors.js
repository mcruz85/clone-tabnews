export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Internal Server Error not expected", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Contact the system administrator";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status_code: this.statusCode,
      },
    };
  }
}
