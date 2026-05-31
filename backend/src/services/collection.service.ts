import { Payment, IPaymentDocument } from '../models/Payment';
import { Loan } from '../models/Loan';
import { AppError } from '../utils/appError';

interface RecordPaymentData {
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate?: Date;
}

export class CollectionService {
  /**
   * Record a new payment collection.
   * Enforces UTR uniqueness, status checks, and calculates remaining loan balances.
   */
  public static async recordPayment(
    paymentData: RecordPaymentData
  ): Promise<IPaymentDocument> {
    const { loanId, utrNumber, amount, paymentDate } = paymentData;

    if (!loanId || !utrNumber || amount === undefined || amount === null) {
      throw new AppError('loanId, utrNumber, and amount are required', 400);
    }

    // 1. Normalize and check UTR uniqueness
    const normalizedUtr = utrNumber.trim().toUpperCase();
    const existingPayment = await Payment.findOne({ utrNumber: normalizedUtr });
    if (existingPayment) {
      throw new AppError(`Payment with UTR number: ${normalizedUtr} already exists`, 400);
    }

    // 2. Fetch active loan
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    // 3. Confirm loan status is active (DISBURSED)
    if (loan.status !== 'DISBURSED') {
      throw new AppError(
        `Payments can only be collected for DISBURSED loans. Current status: ${loan.status}`,
        400
      );
    }

    // 4. Validate payment amount constraints
    if (amount <= 0) {
      throw new AppError('Payment amount must be greater than zero', 400);
    }

    if (amount > loan.outstandingAmount) {
      throw new AppError(
        `Payment amount (${amount}) exceeds outstanding loan balance (${loan.outstandingAmount})`,
        400
      );
    }

    // 5. Record the Payment
    const payment = await Payment.create({
      loanId,
      utrNumber: normalizedUtr,
      amount,
      paymentDate: paymentDate || new Date(),
    });

    // 6. Update the Loan's outstanding balance
    loan.outstandingAmount = Math.round((loan.outstandingAmount - amount) * 100) / 100;

    // 7. Transition status to CLOSED if outstanding balance is settled
    if (loan.outstandingAmount <= 0) {
      loan.status = 'CLOSED';
    }

    await loan.save();

    return payment;
  }

  /**
   * Get all payments recorded for a specific loan.
   */
  public static async getLoanPayments(loanId: string): Promise<IPaymentDocument[]> {
    return await Payment.find({ loanId }).sort({ paymentDate: -1 });
  }

  /**
   * Retrieve all payments (Staff-facing view).
   */
  public static async getAllPayments(): Promise<IPaymentDocument[]> {
    return await Payment.find()
      .populate({
        path: 'loanId',
        populate: {
          path: 'borrowerId',
          populate: { path: 'user', select: 'name email' },
        },
      })
      .sort({ createdAt: -1 });
  }
}
