const HTTPStatusCode = {
  BadRequest: 400,
  Unauthorized: 401,
  NotFound: 404,
  InternalServerError: 500,
};

class CustomError {
  constructor(code, description) {
    this.code = code;
    this.description = description;
  }
}

class BadRequestError extends CustomError {
  constructor(description = 'Bad Request') {
    super(HTTPStatusCode.BadRequest, description);
  }
}

class UnauthorizedError extends CustomError {
  constructor(description = 'Unauthorized') {
    super(HTTPStatusCode.Unauthorized, description);
  }
}

class NotFoundError extends CustomError {
  constructor(description = 'Not Found') {
    super(HTTPStatusCode.NotFound, description);
  }
}

class InternalServerError extends CustomError {
  constructor(description = 'Internal Server Error') {
    super(HTTPStatusCode.InternalServerError, description);
  }
}

module.exports = {
  HTTPStatusCode,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
};
