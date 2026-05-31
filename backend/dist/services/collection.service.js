"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const Payment_1 = require("../models/Payment");
const Loan_1 = require("../models/Loan");
const appError_1 = require("../utils/appError");
class CollectionService {
    /**
     * Record a new payment collection.
     * Enforces UTR uniqueness, status checks, and calculates remaining loan balances.
     */
    static async recordPayment(paymentData) {
        const { loanId, utrNumber, amount, paymentDate } = paymentData;
        if (!loanId || !utrNumber || amount === undefined || amount === null) {
            throw new appError_1.AppError('loanId, utrNumber, and amount are required', 400);
        }
        // 1. Normalize and check UTR uniqueness
        const normalizedUtr = utrNumber.trim().toUpperCase();
        const existingPayment = await Payment_1.Payment.findOne({ utrNumber: normalizedUtr });
        if (existingPayment) {
            throw new appError_1.AppError(`Payment with UTR number: ${normalizedUtr} already exists`, 400);
        }
        // 2. Fetch active loan
        const loan = await Loan_1.Loan.findById(loanId);
        if (!loan) {
            throw new appError_1.AppError('Loan not found', 404);
        }
        // 3. Confirm loan status is active (DISBURSED)
        if (loan.status !== 'DISBURSED') {
            throw new appError_1.AppError(`Payments can only be collected for DISBURSED loans. Current status: ${loan.status}`, 400);
        }
        // 4. Validate payment amount constraints
        if (amount <= 0) {
            throw new appError_1.AppError('Payment amount must be greater than zero', 400);
        }
        if (amount > loan.outstandingAmount) {
            throw new appError_1.AppError(`Payment amount (${amount}) exceeds outstanding loan balance (${loan.outstandingAmount})`, 400);
        }
        // 5. Record the Payment
        const payment = await Payment_1.Payment.create({
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
    static async getLoanPayments(loanId) {
        return await Payment_1.Payment.find({ loanId }).sort({ paymentDate: -1 });
    }
    /**
     * Retrieve all payments (Staff-facing view).
     */
    static async getAllPayments() {
        return await Payment_1.Payment.find()
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
exports.CollectionService = CollectionService;
