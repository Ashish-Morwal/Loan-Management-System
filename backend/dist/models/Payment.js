"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    loanId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Loan',
        required: [true, 'Loan reference is required'],
    },
    utrNumber: {
        type: String,
        required: [true, 'UTR number is required'],
        unique: true,
        trim: true,
        uppercase: true,
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [1, 'Payment amount must be at least 1'],
    },
    paymentDate: {
        type: Date,
        required: [true, 'Payment date is required'],
        default: Date.now,
    },
}, {
    timestamps: true,
});
exports.Payment = (0, mongoose_1.model)('Payment', PaymentSchema);
