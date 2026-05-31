import { Request, Response } from 'express';
import { CollectionService } from '../services/collection.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

export class CollectionController {
  /**
   * Record a new payment collection.
   */
  public static collectPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payment = await CollectionService.recordPayment(req.body);
    ApiResponse.send(res, 201, 'Payment recorded successfully', payment);
  });

  /**
   * Get all payments recorded for a loan ID.
   */
  public static getPaymentsByLoan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { loanId } = req.params;
    if (!loanId) {
      throw new AppError('loanId is required', 400);
    }

    const payments = await CollectionService.getLoanPayments(loanId as string);
    ApiResponse.send(res, 200, 'Loan payments retrieved successfully', payments);
  });

  /**
   * View all payment transactions (Staff-facing).
   */
  public static listAllPayments = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const payments = await CollectionService.getAllPayments();
    ApiResponse.send(res, 200, 'All payments retrieved successfully', payments);
  });
}
