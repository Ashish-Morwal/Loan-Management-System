import { Response } from 'express';

export class ApiResponse<T = unknown> {
  public readonly success: boolean = true;
  public readonly message: string;
  public readonly data?: T;

  private constructor(message: string, data?: T) {
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  /**
   * Send a success response.
   * @param res Express response object
   * @param statusCode HTTP Status Code (default 200)
   * @param message Informational message
   * @param data Optional response payload
   */
  public static send<T>(
    res: Response,
    statusCode: number = 200,
    message: string,
    data?: T
  ): Response {
    const responseBody = new ApiResponse<T>(message, data);
    return res.status(statusCode).json(responseBody);
  }
}
