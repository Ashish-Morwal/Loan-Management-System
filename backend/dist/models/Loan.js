"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loan = void 0;
const mongoose_1 = require("mongoose");
const LoanSchema = new mongoose_1.Schema({
    borrowerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Borrower',
        required: [true, 'Borrower reference is required'],
    },
    loanAmount: {
        type: Number,
        required: [true, 'Loan amount is required'],
        min: [1000, 'Loan amount must be at least 1,000'],
    },
    tenureDays: {
        type: Number,
        required: [true, 'Tenure in days is required'],
        min: [7, 'Tenure must be at least 7 days'],
    },
    interestRate: {
        type: Number,
        required: [true, 'Interest rate is required'],
        min: [0, 'Interest rate cannot be negative'],
    },
    simpleInterest: {
        type: Number,
        required: [true, 'Simple interest is required'],
    },
    totalRepayment: {
        type: Number,
        required: [true, 'Total repayment is required'],
    },
    outstandingAmount: {
        type: Number,
        required: [true, 'Outstanding amount is required'],
    },
    status: {
        type: String,
        enum: {
            values: ['APPLIED', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'CLOSED'],
            message: '{VALUE} is not a valid loan status',
        },
        default: 'APPLIED',
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    rejectedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    reason: {
        type: String,
    },
    disbursementDate: {
        type: Date,
    },
    disbursedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
exports.Loan = (0, mongoose_1.model)('Loan', LoanSchema);
