import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';

export class AuthController {
  /**
   * Register a new user.
   */
  public static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.registerUser(req.body);
    ApiResponse.send(res, 201, 'User registered successfully', result);
  });

  /**
   * Login an existing user.
   */
  public static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await AuthService.loginUser(req.body);
    ApiResponse.send(res, 200, 'User logged in successfully', result);
  });
}
