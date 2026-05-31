"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionService = void 0;
const mongoose_1 = require("mongoose");
const Loan_1 = require("../models/Loan");
const appError_1 = require("../utils/appError");
class SanctionService {
    /**
     * View all loan applications with status APPLIED.
     */
    static async getAppliedLoans() {
        return await Loan_1.Loan.find({ status: 'APPLIED' })
            .populate({
            path: 'borrowerId',
            populate: { path: 'user', select: 'name email' },
        })
            .sort({ createdAt: -1 });
    }
    /**
     * Approve a loan application (APPLIED -> SANCTIONED).
     */
    static async approveLoan(loanId, actorId, reason) {
        const loan = await Loan_1.Loan.findById(loanId);
        if (!loan) {
            throw new appError_1.AppError('Loan not found', 404);
        }
        if (loan.status !== 'APPLIED') {
            throw new appError_1.AppError(`Only loans in APPLIED status can be approved. Current status: ${loan.status}`, 400);
        }
        // Update status and record credentials
        loan.status = 'SANCTIONED';
        loan.approvedBy = new mongoose_1.Types.ObjectId(actorId);
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
    static async rejectLoan(loanId, actorId, reason) {
        const loan = await Loan_1.Loan.findById(loanId);
        if (!loan) {
            throw new appError_1.AppError('Loan not found', 404);
        }
        if (loan.status !== 'APPLIED') {
            throw new appError_1.AppError(`Only loans in APPLIED status can be rejected. Current status: ${loan.status}`, 400);
        }
        // Update status and record credentials
        loan.status = 'REJECTED';
        loan.rejectedBy = new mongoose_1.Types.ObjectId(actorId);
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
exports.SanctionService = SanctionService;
