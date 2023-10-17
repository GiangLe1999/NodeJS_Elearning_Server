class ErrorHandler extends Error {
  // Thêm dòng này để tránh warning của TypeScript
  statusCode: Number;

  constructor(message: any, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
