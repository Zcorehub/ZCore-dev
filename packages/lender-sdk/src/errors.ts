export class ZCoreError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "ZCoreError";
  }
}

export class ZCoreAuthError extends ZCoreError {
  constructor(message = "Unauthorized") {
    super(message, 401);
    this.name = "ZCoreAuthError";
  }
}

export class ZCoreNotFoundError extends ZCoreError {
  constructor(message = "Not found") {
    super(message, 404);
    this.name = "ZCoreNotFoundError";
  }
}
