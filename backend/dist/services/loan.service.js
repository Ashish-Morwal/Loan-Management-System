"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const Loan_1 = require("../models/Loan");
const Borrower_1 = require("../models/Borrower");
const rule_engine_service_1 = require("./rule-engine.service");
const loan_calculator_1 = require("../utils/loan-calculator");
const appError_1 = require("../utils/appError");
class LoanService {
    /**
     * Apply for a new loan.
     * Runs the Business Rule Engine validation and checks for active loans.
     */
    static async applyForLoan(userId, loanData) {
        const { loanAmount, tenureDays } = loanData;
        if (!loanAmount || !tenureDays) {
            throw new appError_1.AppError('loanAmount and tenureDays are required', 400);
        }
        // 1. Fetch borrower profile
        const borrower = await Borrower_1.Borrower.findOne({ user: userId });
        if (!borrower) {
            throw new appError_1.AppError('Please create a borrower profile before applying for a loan', 404);
        }
        // 2. Ensure borrower has uploaded a salary slip
        if (!borrower.salarySlipPath) {
            throw new appError_1.AppError('Please upload your salary slip before applying for a loan', 400);
        }
        // 3. Validate Borrower via Business Rule Engine
        const ruleEvaluation = rule_engine_service_1.RuleEngineService.evaluateBorrower(borrower);
        if (!ruleEvaluation.approved) {
            throw new appError_1.AppError(`Borrower profile is not eligible for loans: ${ruleEvaluation.reasons.join('; ')}`, 400);
        }
        // 4. Ensure no current active loan exists (APPLIED, SANCTIONED, DISBURSED)
        const activeLoan = await Loan_1.Loan.findOne({
            borrowerId: borrower._id,
            status: { $in: ['APPLIED', 'SANCTIONED', 'DISBURSED'] },
        });
        if (activeLoan) {
            throw new appError_1.AppError('Cannot apply for a new loan while you have an active application or loan on file.', 400);
        }
        // 5. Perform Interest and Repayment Calculations using 12% default rate
        const calculations = (0, loan_calculator_1.calculateLoan)(loanAmount, tenureDays);
        // Create the Loan application
        const newLoan = await Loan_1.Loan.create({
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
    static async getLoanById(loanId) {
        const loan = await Loan_1.Loan.findById(loanId).populate({
            path: 'borrowerId',
            populate: { path: 'user', select: 'name email' },
        });
        if (!loan) {
            throw new appError_1.AppError('Loan not found', 404);
        }
        return loan;
    }
    /**
     * Get all loans applied by a borrower user ID.
     */
    static async getBorrowerLoans(userId) {
        const borrower = await Borrower_1.Borrower.findOne({ user: userId });
        if (!borrower) {
            return [];
        }
        return await Loan_1.Loan.find({ borrowerId: borrower._id }).sort({ createdAt: -1 });
    }
    /**
     * List all loans in the system (Staff-facing).
     */
    static async listAllLoans() {
        return await Loan_1.Loan.find()
            .populate({
            path: 'borrowerId',
            populate: { path: 'user', select: 'name email' },
        })
            .sort({ createdAt: -1 });
    }
    /**
     * Update the status of a loan with strict role checks.
     */
    static async updateLoanStatus(loanId, targetStatus, actorRole) {
        const loan = await Loan_1.Loan.findById(loanId);
        if (!loan) {
            throw new appError_1.AppError('Loan not found', 404);
        }
        const currentStatus = loan.status;
        // Reject transitions if the target status is identical to current
        if (currentStatus === targetStatus) {
            throw new appError_1.AppError(`Loan is already in status: ${targetStatus}`, 400);
        }
        // Role and State validation transitions
        switch (targetStatus) {
            case 'SANCTIONED':
            case 'REJECTED':
                // Only SANCTION officer or ADMIN can sanction or reject
                if (actorRole !== 'SANCTION' && actorRole !== 'ADMIN') {
                    throw new appError_1.AppError('Only Sanction Officers or Admins can sanction/reject loans', 403);
                }
                if (currentStatus !== 'APPLIED') {
                    throw new appError_1.AppError(`Can only transition to ${targetStatus} from APPLIED status`, 400);
                }
                break;
            case 'DISBURSED':
                // Only DISBURSEMENT officer or ADMIN can disburse
                if (actorRole !== 'DISBURSEMENT' && actorRole !== 'ADMIN') {
                    throw new appError_1.AppError('Only Disbursement Officers or Admins can disburse loans', 403);
                }
                if (currentStatus !== 'SANCTIONED') {
                    throw new appError_1.AppError('Can only disburse loans that are SANCTIONED', 400);
                }
                break;
            case 'CLOSED':
                // Only COLLECTION agent or ADMIN can close loans
                if (actorRole !== 'COLLECTION' && actorRole !== 'ADMIN') {
                    throw new appError_1.AppError('Only Collection Officers or Admins can close loans', 403);
                }
                if (currentStatus !== 'DISBURSED') {
                    throw new appError_1.AppError('Can only close active loans that are in DISBURSED status', 400);
                }
                if (loan.outstandingAmount > 0) {
                    throw new appError_1.AppError(`Cannot close loan with outstanding balance remaining: ${loan.outstandingAmount}`, 400);
                }
                break;
            default:
                throw new appError_1.AppError(`Unsupported status transition: ${targetStatus}`, 400);
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
exports.LoanService = LoanService;
