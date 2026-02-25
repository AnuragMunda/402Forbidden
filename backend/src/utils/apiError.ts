import { ApiMessages, HttpStatus } from "../constants/index.js";

class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: string,
    details?: unknown,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const BadRequestError = (details?: unknown) =>
  new ApiError(
    ApiMessages.CLIENT_ERROR.BAD_REQUEST,
    HttpStatus.BAD_REQUEST,
    "BAD_REQUEST",
    details,
  );

export const UnauthorizedError = () =>
  new ApiError(ApiMessages.CLIENT_ERROR.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");

export const ForbiddenError = () =>
  new ApiError(ApiMessages.CLIENT_ERROR.FORBIDDEN, HttpStatus.FORBIDDEN, "FORBIDDEN");

export const NotFoundError = () =>
  new ApiError(ApiMessages.CLIENT_ERROR.NOT_FOUND, HttpStatus.NOT_FOUND, "NOT_FOUND");

export const ConflictError = () =>
  new ApiError(ApiMessages.CLIENT_ERROR.CONFLICT, HttpStatus.BAD_REQUEST, "CONFLICT");
