"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Borrower = void 0;
const mongoose_1 = require("mongoose");
const BorrowerSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true,
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
    },
    pan: {
        type: String,
        required: [true, 'PAN card number is required'],
        unique: true,
        uppercase: true,
        trim: true,
        match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN card number (e.g., ABCDE1234F)'],
    },
    dob: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    monthlySalary: {
        type: Number,
        required: [true, 'Monthly salary is required'],
        min: [0, 'Monthly salary cannot be negative'],
    },
    employmentMode: {
        type: String,
        enum: {
            values: ['Salaried', 'SelfEmployed', 'Unemployed'],
            message: '{VALUE} is not a valid employment mode',
        },
        required: [true, 'Employment mode is required'],
    },
    salarySlipPath: {
        type: String,
    },
}, {
    timestamps: true,
});
exports.Borrower = (0, mongoose_1.model)('Borrower', BorrowerSchema);
