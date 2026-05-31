import { Loan, ILoanDocument, LoanStatus } from '../models/Loan';
import { Borrower } from '../models/Borrower';
import { RuleEngineService } from './rule-engine.service';
import { calculateLoan } from '../utils/loan-calculator';
import { AppError } from '../utils/appError';

interface ApplyLoanData {
  loanAmount: number;
  tenureDays: number;
}

export class LoanService {
  /**
   * Apply for a new loan.
   * Runs the Business Rule Engine validation and checks for active loans.
   */
  public static async applyForLoan(
    userId: string,
    loanData: ApplyLoanData
  ): Promise<ILoanDocument> {
    const { loanAmount, tenureDays } = loanData;

    if (!loanAmount || !tenureDays) {
      throw new AppError('loanAmount and tenureDays are required', 400);
    }

    // 1. Fetch borrower profile
    const borrower = await Borrower.findOne({ user: userId });
    if (!borrower) {
      throw new AppError('Please create a borrower profile before applying for a loan', 404);
    }

    // 2. Ensure borrower has uploaded a salary slip
    if (!borrower.salarySlipPath) {
      throw new AppError(
        'Please upload your salary slip before applying for a loan',
        400
      );
    }

    // 3. Validate Borrower via Business Rule Engine
    const ruleEvaluation = RuleEngineService.evaluateBorrower(borrower);
    if (!ruleEvaluation.approved) {
      throw new AppError(
        `Borrower profile is not eligible for loans: ${ruleEvaluation.reasons.join('; ')}`,
        400
      );
    }

    // 4. Ensure no current active loan exists (APPLIED, SANCTIONED, DISBURSED)
    const activeLoan = await Loan.findOne({
      borrowerId: borrower._id,
      status: { $in: ['APPLIED', 'SANCTIONED', 'DISBURSED'] },
    });
    if (activeLoan) {
      throw new AppError(
        'Cannot apply for a new loan while you have an active application or loan on file.',
        400
      );
    }

    // 5. Perform Interest and Repayment Calculations using 12% default rate
    const calculations = calculateLoan(loanAmount, tenureDays);

    // Create the Loan application
    const newLoan = await Loan.create({
      borrowerId: borrower._id,
      loanAmount,
      tenureDays,
      interestRate: 12, // Default interest rate
      simpleInterest: calculations.simpleInterest,
      totalRepayment: calculations.totalRepayment,
      outstandingAmount: calculations.totalRepayment, // initially equals total repayment
      status: 'APPLIED',
    });

    return newLoan;
  }

  /**
   * Retrieve loan by ID, populated with borrower details.
   */
  public static async getLoanById(loanId: string): Promise<ILoanDocument> {
    const loan = await Loan.findById(loanId).populate({
      path: 'borrowerId',
      populate: { path: 'user', select: 'name email' },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404);
    }
    return loan;
  }

  /**
   * Get all loans applied by a borrower user ID.
   */
  public static async getBorrowerLoans(userId: string): Promise<ILoanDocument[]> {
    const borrower = await Borrower.findOne({ user: userId });
    if (!borrower) {
      return [];
    }

    return await Loan.find({ borrowerId: borrower._id }).sort({ createdAt: -1 });
  }

  /**
   * List all loans in the system (Staff-facing).
   */
  public static async listAllLoans(): Promise<ILoanDocument[]> {
    return await Loan.find()
      .populate({
        path: 'borrowerId',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Update the status of a loan with strict role checks.
   */
  public static async updateLoanStatus(
    loanId: string,
    targetStatus: LoanStatus,
    actorRole: string
  ): Promise<ILoanDocument> {
    const loan = await Loan.findById(loanId);
    if (!loan) {
      throw new AppError('Loan not found', 404);
    }

    const currentStatus = loan.status;

    // Reject transitions if the target status is identical to current
    if (currentStatus === targetStatus) {
      throw new AppError(`Loan is already in status: ${targetStatus}`, 400);
    }

    // Role and State validation transitions
    switch (targetStatus) {
      case 'SANCTIONED':
      case 'REJECTED':
        // Only SANCTION officer or ADMIN can sanction or reject
        if (actorRole !== 'SANCTION' && actorRole !== 'ADMIN') {
          throw new AppError('Only Sanction Officers or Admins can sanction/reject loans', 403);
        }
        if (currentStatus !== 'APPLIED') {
          throw new AppError(`Can only transition to ${targetStatus} from APPLIED status`, 400);
        }
        break;

      case 'DISBURSED':
        // Only DISBURSEMENT officer or ADMIN can disburse
        if (actorRole !== 'DISBURSEMENT' && actorRole !== 'ADMIN') {
          throw new AppError('Only Disbursement Officers or Admins can disburse loans', 403);
        }
        if (currentStatus !== 'SANCTIONED') {
          throw new AppError('Can only disburse loans that are SANCTIONED', 400);
        }
        break;

      case 'CLOSED':
        // Only COLLECTION agent or ADMIN can close loans
        if (actorRole !== 'COLLECTION' && actorRole !== 'ADMIN') {
          throw new AppError('Only Collection Officers or Admins can close loans', 403);
        }
        if (currentStatus !== 'DISBURSED') {
          throw new AppError('Can only close active loans that are in DISBURSED status', 400);
        }
        if (loan.outstandingAmount > 0) {
          throw new AppError(
            `Cannot close loan with outstanding balance remaining: ${loan.outstandingAmount}`,
            400
          );
        }
        break;

      default:
        throw new AppError(`Unsupported status transition: ${targetStatus}`, 400);
    }

    // Transition successfully validated
    loan.status = targetStatus;
    const updatedLoan = await loan.save();

    return updatedLoan.populate({
      path: 'borrowerId',
      populate: { path: 'user', select: 'name email' },
    });
  }
}
