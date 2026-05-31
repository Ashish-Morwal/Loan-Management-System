"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionController = void 0;
const collection_service_1 = require("../services/collection.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
class CollectionController {
    /**
     * Record a new payment collection.
     */
    static collectPayment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const payment = await collection_service_1.CollectionService.recordPayment(req.body);
        apiResponse_1.ApiResponse.send(res, 201, 'Payment recorded successfully', payment);
    });
    /**
     * Get all payments recorded for a loan ID.
     */
    static getPaymentsByLoan = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { loanId } = req.params;
        if (!loanId) {
            throw new appError_1.AppError('loanId is required', 400);
        }
        const payments = await collection_service_1.CollectionService.getLoanPayments(loanId);
        apiResponse_1.ApiResponse.send(res, 200, 'Loan payments retrieved successfully', payments);
    });
    /**
     * View all payment transactions (Staff-facing).
     */
    static listAllPayments = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const payments = await collection_service_1.CollectionService.getAllPayments();
        apiResponse_1.ApiResponse.send(res, 200, 'All payments retrieved successfully', payments);
    });
}
exports.CollectionController = CollectionController;
