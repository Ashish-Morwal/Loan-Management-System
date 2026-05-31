"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanController = void 0;
const loan_service_1 = require("../services/loan.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
class LoanController {
    /**
     * Apply for a loan (Current logged-in Borrower).
     */
    static applyMyLoan = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const loan = await loan_service_1.LoanService.applyForLoan(req.user._id.toString(), req.body);
        apiResponse_1.ApiResponse.send(res, 201, 'Loan application submitted successfully', loan);
    });
    /**
     * Get all loan applications for the logged-in Borrower.
     */
    static getMyLoans = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const loans = await loan_service_1.LoanService.getBorrowerLoans(req.user._id.toString());
        apiResponse_1.ApiResponse.send(res, 200, 'Borrower loans retrieved successfully', loans);
    });
    /**
     * Get details of a specific loan by ID.
     * Restricts borrowers to only viewing their own loans.
     */
    static getLoanDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const loan = await loan_service_1.LoanService.getLoanById(req.params.id);
        // Enforce authorization: Borrowers can only view their own loans
        const borrowerDoc = loan.borrowerId;
        const ownerUserId = borrowerDoc && borrowerDoc.user && typeof borrowerDoc.user === 'object' && '_id' in borrowerDoc.user
            ? borrowerDoc.user._id.toString()
            : borrowerDoc?.user?.toString();
        if (req.user.role === 'BORROWER' && ownerUserId !== req.user._id.toString()) {
            throw new appError_1.AppError('Access denied. You do not have permission to view this loan.', 403);
        }
        apiResponse_1.ApiResponse.send(res, 200, 'Loan details retrieved successfully', loan);
    });
    /**
     * List all loans in the system (Staff-facing).
     */
    static getAllLoans = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const loans = await loan_service_1.LoanService.listAllLoans();
        apiResponse_1.ApiResponse.send(res, 200, 'All loans retrieved successfully', loans);
    });
    /**
     * Update a loan's status. Checks actor role permissions.
     */
    static updateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const { status } = req.body;
        if (!status) {
            throw new appError_1.AppError('Please provide target status', 400);
        }
        const loan = await loan_service_1.LoanService.updateLoanStatus(req.params.id, status, req.user.role);
        apiResponse_1.ApiResponse.send(res, 200, `Loan status updated to ${status} successfully`, loan);
    });
}
exports.LoanController = LoanController;
