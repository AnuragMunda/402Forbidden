import type { Response } from "express";
import { ApiMessages, HttpStatus } from "../constants/index.js";

class ApiError {
  /**
   * Send an error response
   * @param {Response} res - Express response object
   * @param {Number} statusCode - Http status code
   * @param {String} message - Error message
   * @param {*} errors - Additional error details
   */
  static error(
    res: Response,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    message: string = ApiMessages.SERVER_ERROR.INTERNAL_ERROR,
    errors: null | any = null,
  ) {
    const response = {
      success: false,
      message,
      ...(errors !== null && { errors }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send a bad request error (400)
   * @param {Response} res - Express response object
   * @param {String} message - Error message
   * @param {*} errors - Validation errors
   */
  static badRequest(
    res: Response,
    message: string = ApiMessages.CLIENT_ERROR.BAD_REQUEST,
    errors: null | any = null,
  ) {
    return this.error(res, HttpStatus.BAD_REQUEST, message, errors);
  }

  /**
   * Send a unauthorized error (401)
   * @param {Response} res - Express response object
   * @param {String} message - Error message
   */
  static unauthorized(res: Response, message: string = ApiMessages.CLIENT_ERROR.UNAUTHORIZED) {
    return this.error(res, HttpStatus.UNAUTHORIZED, message);
  }

  /**
   * Send a not found error (404)
   * @param {Response} res - Express response object
   * @param {String} message - Error message
   */
  static notFound(res: Response, message: string = ApiMessages.CLIENT_ERROR.NOT_FOUND) {
    return this.error(res, HttpStatus.NOT_FOUND, message);
  }
}

export default ApiError;
