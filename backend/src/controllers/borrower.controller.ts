import { Request, Response } from 'express';
import { BorrowerService } from '../services/borrower.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class BorrowerController {
  /**
   * Create the logged-in user's borrower profile.
   */
  public static createMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.debug('BORROWER CONTROLLER createMyProfile', {
      route: req.originalUrl,
      method: req.method,
      user: req.user ? { id: req.user._id.toString(), role: req.user.role } : null,
      body: req.body,
    });

    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await BorrowerService.createProfile(req.user._id.toString(), req.body);
    ApiResponse.send(res, 201, 'Borrower profile created successfully', profile);
  });

  /**
   * Get the logged-in user's borrower profile.
   */
  public static getMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await BorrowerService.getProfileByUserId(req.user._id.toString());
    ApiResponse.send(res, 200, 'Borrower profile retrieved successfully', profile);
  });

  /**
   * Update the logged-in user's borrower profile.
   */
  public static updateMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const profile = await BorrowerService.updateProfile(req.user._id.toString(), req.body);
    ApiResponse.send(res, 200, 'Borrower profile updated successfully', profile);
  });

  /**
   * Get borrower profile by its unique ID (Admin/Sales lookup).
   */
  public static getBorrowerById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const profile = await BorrowerService.getProfileById(req.params.id as string);
    ApiResponse.send(res, 200, 'Borrower profile retrieved successfully', profile);
  });

  /**
   * Get all borrower profiles (Admin/Sales lookup).
   */
  public static getAllBorrowers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const profiles = await BorrowerService.listAllBorrowers();
    ApiResponse.send(res, 200, 'Borrower profiles retrieved successfully', profiles);
  });
}
