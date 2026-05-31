import { Types } from 'mongoose';
import { Loan, ILoanDocument } from '../models/Loan';
import { AppError } from '../utils/appError';

export class SanctionService {
  /**
   * View all loan applications with status APPLIED.
   */
  public static async getAppliedLoans(): Promise<ILoanDocument[]> {
    return await Loan.find({ status: 'APPLIED' })
      .populate({
        path: 'borrowerId',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Approve a loan application (APPLIED -> SANCTIONED).
   */
  public static async approveLoan(
    loanId: string,
    actorId: string,
    reason?: string
  ): Promise<ILoanDocument> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.status !== 'APPLIED') {
      throw new AppError(`Only loans in APPLIED status can be approved. Current status: ${loan.status}`, 400);
    }

    // Update status and record credentials
    loan.status = 'SANCTIONED';
    loan.approvedBy = new Types.ObjectId(actorId);
    loan.rejectedBy = undefined; // clear any reject history
    if (reason) {
      loan.reason = reason;
    }

    const updatedLoan = await loan.save();
    return updatedLoan.populate({
      path: 'borrowerId',
      populate: { path: 'user', select: 'name email' },
    });
  }

  /**
   * Reject a loan application (APPLIED -> REJECTED).
   */
  public static async rejectLoan(
    loanId: string,
    actorId: string,
    reason?: string
  ): Promise<ILoanDocument> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.status !== 'APPLIED') {
      throw new AppError(`Only loans in APPLIED status can be rejected. Current status: ${loan.status}`, 400);
    }

    // Update status and record credentials
    loan.status = 'REJECTED';
    loan.rejectedBy = new Types.ObjectId(actorId);
    loan.approvedBy = undefined; // clear any approve history
    if (reason) {
      loan.reason = reason;
    }

    const updatedLoan = await loan.save();
    return updatedLoan.populate({
      path: 'borrowerId',
      populate: { path: 'user', select: 'name email' },
    });
  }
}
