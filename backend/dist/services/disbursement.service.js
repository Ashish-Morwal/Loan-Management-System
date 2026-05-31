"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisbursementService = void 0;
const mongoose_1 = require("mongoose");
const Loan_1 = require("../models/Loan");
const appError_1 = require("../utils/appError");
class DisbursementService {
    /**
     * View all loan applications with status SANCTIONED.
     */
    static async getSanctionedLoans() {
        return await Loan_1.Loan.find({ status: 'SANCTIONED' })
            .populate({
            path: 'borrowerId',
            populate: { path: 'user', select: 'name email' },
        })
            .sort({ createdAt: -1 });
    }
    /**
     * Disburse a sanctioned loan application (SANCTIONED -> DISBURSED).
     */
    static async disburseLoan(loanId, actorId) {
        const loan = await Loan_1.Loan.findById(loanId);
        if (!loan) {
            throw new appError_1.AppError('Loan not found', 404);
        }
        if (loan.status !== 'SANCTIONED') {
            throw new appError_1.AppError(`Only loans in SANCTIONED status can be disbursed. Current status: ${loan.status}`, 400);
        }
        // Update status and record credentials
        loan.status = 'DISBURSED';
        loan.disbursedBy = new mongoose_1.Types.ObjectId(actorId);
        loan.disbursementDate = new Date();
        const updatedLoan = await loan.save();
        return updatedLoan.populate({
            path: 'borrowerId',
            populate: { path: 'user', select: 'name email' },
        });
    }
}
exports.DisbursementService = DisbursementService;
