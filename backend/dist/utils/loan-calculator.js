"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLoan = void 0;
/**
 * Reusable loan calculator utility.
 * Formula: SI = (P * R * T) / (365 * 100)
 *
 * @param loanAmount Principal amount (P)
 * @param tenureDays Tenure in days (T)
 * @param interestRate Interest rate per annum (R), default is 12%
 */
const calculateLoan = (loanAmount, tenureDays, interestRate = 12) => {
    if (loanAmount <= 0) {
        throw new Error('Loan amount must be greater than zero');
    }
    if (tenureDays <= 0) {
        throw new Error('Tenure days must be greater than zero');
    }
    if (interestRate < 0) {
        throw new Error('Interest rate cannot be negative');
    }
    // SI = (P * R * T) / (365 * 100)
    const simpleInterest = (loanAmount * interestRate * tenureDays) / (365 * 100);
    const totalRepayment = loanAmount + simpleInterest;
    // Round values to 2 decimal places
    return {
        simpleInterest: Math.round(simpleInterest * 100) / 100,
        totalRepayment: Math.round(totalRepayment * 100) / 100,
    };
};
exports.calculateLoan = calculateLoan;
