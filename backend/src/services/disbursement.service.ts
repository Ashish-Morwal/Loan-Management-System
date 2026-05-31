import { Types } from 'mongoose';
import { Loan, ILoanDocument } from '../models/Loan';
import { AppError } from '../utils/appError';

export class DisbursementService {
  /**
   * View all loan applications with status SANCTIONED.
   */
  public static async getSanctionedLoans(): Promise<ILoanDocument[]> {
    return await Loan.find({ status: 'SANCTIONED' })
      .populate({
        path: 'borrowerId',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Disburse a sanctioned loan application (SANCTIONED -> DISBURSED).
   */
  public static async disburseLoan(
    loanId: string,
    actorId: string
  ): Promise<ILoanDocument> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    if (loan.status !== 'SANCTIONED') {
      throw new AppError(
        `Only loans in SANCTIONED status can be disbursed. Current status: ${loan.status}`,
        400
      );
    }

    // Update status and record credentials
    loan.status = 'DISBURSED';
    loan.disbursedBy = new Types.ObjectId(actorId);
    loan.disbursementDate = new Date();

    const updatedLoan = await loan.save();
    return updatedLoan.populate({
      path: 'borrowerId',
      populate: { path: 'user', select: 'name email' },
    });
  }
}
