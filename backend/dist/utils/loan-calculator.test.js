"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const loan_calculator_1 = require("./loan-calculator");
(0, node_test_1.default)('Loan Calculator Utility Suite', async (t) => {
    await t.test('should calculate interest and repayment correctly with 12% default rate for 1 year', () => {
        // P = 100000, R = 12, T = 365 days
        // SI = (100000 * 12 * 365) / (365 * 100) = 12000
        // Total = 112000
        const result = (0, loan_calculator_1.calculateLoan)(100000, 365);
        node_assert_1.default.strictEqual(result.simpleInterest, 12000);
        node_assert_1.default.strictEqual(result.totalRepayment, 112000);
    });
    await t.test('should calculate interest correctly for a shorter tenure', () => {
        // P = 50000, R = 12, T = 180 days
        // SI = (50000 * 12 * 180) / (365 * 100) = 2958.9041... => 2958.9
        const result = (0, loan_calculator_1.calculateLoan)(50000, 180);
        node_assert_1.default.strictEqual(result.simpleInterest, 2958.9);
        node_assert_1.default.strictEqual(result.totalRepayment, 52958.9);
    });
    await t.test('should allow custom interest rates', () => {
        // P = 10000, R = 8.5, T = 90 days
        // SI = (10000 * 8.5 * 90) / (365 * 100) = 209.5890... => 209.59
        const result = (0, loan_calculator_1.calculateLoan)(10000, 90, 8.5);
        node_assert_1.default.strictEqual(result.simpleInterest, 209.59);
        node_assert_1.default.strictEqual(result.totalRepayment, 10209.59);
    });
    await t.test('should throw error for invalid inputs', () => {
        node_assert_1.default.throws(() => (0, loan_calculator_1.calculateLoan)(-5000, 30), /Loan amount must be greater than zero/);
        node_assert_1.default.throws(() => (0, loan_calculator_1.calculateLoan)(10000, -30), /Tenure days must be greater than zero/);
        node_assert_1.default.throws(() => (0, loan_calculator_1.calculateLoan)(10000, 30, -5), /Interest rate cannot be negative/);
    });
});
