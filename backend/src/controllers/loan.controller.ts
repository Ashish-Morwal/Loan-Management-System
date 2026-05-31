import { Request, Response } from 'express';
import { LoanService } from '../services/loan.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { LoanStatus } from '../models/Loan';
import { IBorrowerDocument } from '../models/Borrower';

export class LoanController {
  /**
   * Apply for a loan (Current logged-in Borrower).
   */
  public static applyMyLoan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const loan = await LoanService.applyForLoan(req.user._id.toString(), req.body);
    ApiResponse.send(res, 201, 'Loan application submitted successfully', loan);
  });

  /**
   * Get all loan applications for the logged-in Borrower.
   */
  public static getMyLoans = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const loans = await LoanService.getBorrowerLoans(req.user._id.toString());
    ApiResponse.send(res, 200, 'Borrower loans retrieved successfully', loans);
  });

  /**
   * Get details of a specific loan by ID.
   * Restricts borrowers to only viewing their own loans.
   */
  public static getLoanDetails = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const loan = await LoanService.getLoanById(req.params.id as string);

    // Enforce authorization: Borrowers can only view their own loans
    const borrowerDoc = loan.borrowerId as unknown as IBorrowerDocument;
    const ownerUserId =
      borrowerDoc && borrowerDoc.user && typeof borrowerDoc.user === 'object' && '_id' in borrowerDoc.user
        ? (borrowerDoc.user as { _id: { toString(): string } })._id.toString()
        : borrowerDoc?.user?.toString();

    if (req.user.role === 'BORROWER' && ownerUserId !== req.user._id.toString()) {
      throw new AppError('Access denied. You do not have permission to view this loan.', 403);
    }

    ApiResponse.send(res, 200, 'Loan details retrieved successfully', loan);
  });

  /**
   * List all loans in the system (Staff-facing).
   */
  public static getAllLoans = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const loans = await LoanService.listAllLoans();
    ApiResponse.send(res, 200, 'All loans retrieved successfully', loans);
  });

  /**
   * Update a loan's status. Checks actor role permissions.
   */
  public static updateStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { status } = req.body;
    if (!status) {
      throw new AppError('Please provide target status', 400);
    }

    const loan = await LoanService.updateLoanStatus(
      req.params.id as string,
      status as LoanStatus,
      req.user.role
    );

    ApiResponse.send(res, 200, `Loan status updated to ${status} successfully`, loan);
  });
}
