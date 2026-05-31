"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanctionController = void 0;
const sanction_service_1 = require("../services/sanction.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
class SanctionController {
    /**
     * View all APPLIED loans.
     */
    static getApplied = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const loans = await sanction_service_1.SanctionService.getAppliedLoans();
        apiResponse_1.ApiResponse.send(res, 200, 'Applied loans retrieved successfully', loans);
    });
    /**
     * Approve an APPLIED loan application.
     */
    static approve = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const { reason } = req.body;
        const loan = await sanction_service_1.SanctionService.approveLoan(req.params.id, req.user._id.toString(), reason);
        apiResponse_1.ApiResponse.send(res, 200, 'Loan approved successfully', loan);
    });
    /**
     * Reject an APPLIED loan application.
     */
    static reject = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const { reason } = req.body;
        const loan = await sanction_service_1.SanctionService.rejectLoan(req.params.id, req.user._id.toString(), reason);
        apiResponse_1.ApiResponse.send(res, 200, 'Loan rejected successfully', loan);
    });
}
exports.SanctionController = SanctionController;
