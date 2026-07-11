export class HttpError extends Error {
  public constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class NotFoundError extends HttpError {
  public constructor(message = "Not found") {
    super(404, message);
  }
}
