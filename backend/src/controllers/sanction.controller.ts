import { Request, Response } from 'express';
import { SanctionService } from '../services/sanction.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class SanctionController {
  /**
   * View all APPLIED loans.
   */
  public static getApplied = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const loans = await SanctionService.getAppliedLoans();
    ApiResponse.send(res, 200, 'Applied loans retrieved successfully', loans);
  });

  /**
   * Approve an APPLIED loan application.
   */
  public static approve = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { reason } = req.body;
    const loan = await SanctionService.approveLoan(
      req.params.id as string,
      req.user._id.toString(),
      reason
    );

    ApiResponse.send(res, 200, 'Loan approved successfully', loan);
  });

  /**
   * Reject an APPLIED loan application.
   */
  public static reject = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { reason } = req.body;
    const loan = await SanctionService.rejectLoan(
      req.params.id as string,
      req.user._id.toString(),
      reason
    );

    ApiResponse.send(res, 200, 'Loan rejected successfully', loan);
  });
}
