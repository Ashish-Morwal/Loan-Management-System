"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const collection_service_1 = require("./collection.service");
const Loan_1 = require("../models/Loan");
const Payment_1 = require("../models/Payment");
const appError_1 = require("../utils/appError");
(0, node_test_1.default)('Collection Service Unit Tests', async (t) => {
    // Store original Mongoose model methods to restore them after tests
    const originalPaymentFindOne = Payment_1.Payment.findOne;
    const originalPaymentCreate = Payment_1.Payment.create;
    const originalLoanFindById = Loan_1.Loan.findById;
    t.afterEach(() => {
        // Restore all mocked methods
        Payment_1.Payment.findOne = originalPaymentFindOne;
        Payment_1.Payment.create = originalPaymentCreate;
        Loan_1.Loan.findById = originalLoanFindById;
    });
    await t.test('should successfully record payment and deduct outstandingAmount', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0001';
        const mockUtr = 'UTR123456789';
        // Mock active loan
        const mockLoanObj = {
            _id: mockLoanId,
            status: 'DISBURSED',
            outstandingAmount: 10000,
            save: async function () {
                return this;
            },
        };
        // Stub database queries using any cast to avoid TS compilation issues with Mongoose Queries
        Payment_1.Payment.findOne = async () => null; // No duplicate UTR
        Loan_1.Loan.findById = async () => mockLoanObj;
        Payment_1.Payment.create = (async (doc) => ({
            _id: '60d5ec49c6c4c52084df9999',
            ...doc,
        }));
        const result = await collection_service_1.CollectionService.recordPayment({
            loanId: mockLoanId,
            utrNumber: mockUtr,
            amount: 4000.5,
        });
        node_assert_1.default.strictEqual(result.utrNumber, 'UTR123456789');
        node_assert_1.default.strictEqual(result.amount, 4000.5);
        node_assert_1.default.strictEqual(mockLoanObj.outstandingAmount, 5999.5);
        node_assert_1.default.strictEqual(mockLoanObj.status, 'DISBURSED'); // Still active
    });
    await t.test('should transition loan status to CLOSED when outstandingAmount <= 0', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0002';
        const mockUtr = 'UTR987654321';
        const mockLoanObj = {
            _id: mockLoanId,
            status: 'DISBURSED',
            outstandingAmount: 2500,
            save: async function () {
                return this;
            },
        };
        Payment_1.Payment.findOne = async () => null;
        Loan_1.Loan.findById = async () => mockLoanObj;
        Payment_1.Payment.create = (async (doc) => ({
            _id: '60d5ec49c6c4c52084df9998',
            ...doc,
        }));
        const result = await collection_service_1.CollectionService.recordPayment({
            loanId: mockLoanId,
            utrNumber: mockUtr,
            amount: 2500,
        });
        node_assert_1.default.strictEqual(result.amount, 2500);
        node_assert_1.default.strictEqual(mockLoanObj.outstandingAmount, 0);
        node_assert_1.default.strictEqual(mockLoanObj.status, 'CLOSED');
    });
    await t.test('should prevent overpayment and throw a 400 bad request', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0003';
        const mockUtr = 'UTR555555555';
        const mockLoanObj = {
            _id: mockLoanId,
            status: 'DISBURSED',
            outstandingAmount: 1500,
            save: async function () {
                return this;
            },
        };
        Payment_1.Payment.findOne = async () => null;
        Loan_1.Loan.findById = async () => mockLoanObj;
        await node_assert_1.default.rejects(async () => {
            await collection_service_1.CollectionService.recordPayment({
                loanId: mockLoanId,
                utrNumber: mockUtr,
                amount: 2000,
            });
        }, (err) => {
            node_assert_1.default.ok(err instanceof appError_1.AppError);
            node_assert_1.default.strictEqual(err.statusCode, 400);
            node_assert_1.default.match(err.message, /exceeds outstanding loan balance/);
            return true;
        });
        // Outstanding amount and status should remain unchanged
        node_assert_1.default.strictEqual(mockLoanObj.outstandingAmount, 1500);
        node_assert_1.default.strictEqual(mockLoanObj.status, 'DISBURSED');
    });
    await t.test('should prevent payment with duplicate UTR number and throw a 400 bad request', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0004';
        const mockUtr = 'UTR-DUPLICATE';
        // Mock that a payment with this UTR already exists
        Payment_1.Payment.findOne = async () => ({ _id: 'existing-payment-id' });
        await node_assert_1.default.rejects(async () => {
            await collection_service_1.CollectionService.recordPayment({
                loanId: mockLoanId,
                utrNumber: mockUtr,
                amount: 500,
            });
        }, (err) => {
            node_assert_1.default.ok(err instanceof appError_1.AppError);
            node_assert_1.default.strictEqual(err.statusCode, 400);
            node_assert_1.default.match(err.message, /already exists/);
            return true;
        });
    });
    await t.test('should prevent payment on non-DISBURSED loans and throw a 400 bad request', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0005';
        const mockUtr = 'UTR-SANCTIONED-ONLY';
        const mockLoanObj = {
            _id: mockLoanId,
            status: 'SANCTIONED', // Not disbursed
            outstandingAmount: 5000,
        };
        Payment_1.Payment.findOne = async () => null;
        Loan_1.Loan.findById = async () => mockLoanObj;
        await node_assert_1.default.rejects(async () => {
            await collection_service_1.CollectionService.recordPayment({
                loanId: mockLoanId,
                utrNumber: mockUtr,
                amount: 1000,
            });
        }, (err) => {
            node_assert_1.default.ok(err instanceof appError_1.AppError);
            node_assert_1.default.strictEqual(err.statusCode, 400);
            node_assert_1.default.match(err.message, /Payments can only be collected for DISBURSED loans/);
            return true;
        });
    });
    await t.test('should throw error when loan is not found', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0006';
        const mockUtr = 'UTR-NOT-FOUND';
        Payment_1.Payment.findOne = async () => null;
        Loan_1.Loan.findById = async () => null; // Loan not found
        await node_assert_1.default.rejects(async () => {
            await collection_service_1.CollectionService.recordPayment({
                loanId: mockLoanId,
                utrNumber: mockUtr,
                amount: 1000,
            });
        }, (err) => {
            node_assert_1.default.ok(err instanceof appError_1.AppError);
            node_assert_1.default.strictEqual(err.statusCode, 404);
            node_assert_1.default.match(err.message, /Loan not found/);
            return true;
        });
    });
    await t.test('should throw error when payment amount is negative or zero', async () => {
        const mockLoanId = '60d5ec49c6c4c52084df0007';
        const mockUtr = 'UTR-ZERO-AMT';
        const mockLoanObj = {
            _id: mockLoanId,
            status: 'DISBURSED',
            outstandingAmount: 5000,
        };
        Payment_1.Payment.findOne = async () => null;
        Loan_1.Loan.findById = async () => mockLoanObj;
        await node_assert_1.default.rejects(async () => {
            await collection_service_1.CollectionService.recordPayment({
                loanId: mockLoanId,
                utrNumber: mockUtr,
                amount: 0,
            });
        }, (err) => {
            node_assert_1.default.ok(err instanceof appError_1.AppError);
            node_assert_1.default.strictEqual(err.statusCode, 400);
            node_assert_1.default.match(err.message, /Payment amount must be greater than zero/);
            return true;
        });
    });
});
