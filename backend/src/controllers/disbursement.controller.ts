import { Request, Response } from 'express';
import { DisbursementService } from '../services/disbursement.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class DisbursementController {
  /**
   * View all SANCTIONED loans.
   */
  public static getSanctioned = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const loans = await DisbursementService.getSanctionedLoans();
    ApiResponse.send(res, 200, 'Sanctioned loans retrieved successfully', loans);
  });

  /**
   * Disburse a SANCTIONED loan application.
   */
  public static disburse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const loan = await DisbursementService.disburseLoan(
      req.params.id as string,
      req.user._id.toString()
    );

    ApiResponse.send(res, 200, 'Loan disbursed successfully', loan);
  });
}
