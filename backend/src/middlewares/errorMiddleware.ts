import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { ApiMessages } from "../constants/apiMessages.js";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = ApiMessages.SERVER_ERROR.INTERNAL_ERROR;
  let code: string | undefined;
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    details = err.details;
  }

  console.error("ERROR:", err);

  res.status(statusCode).json({
    success: false,
    message,
    code,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};