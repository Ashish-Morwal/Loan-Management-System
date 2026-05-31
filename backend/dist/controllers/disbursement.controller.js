"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisbursementController = void 0;
const disbursement_service_1 = require("../services/disbursement.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
class DisbursementController {
    /**
     * View all SANCTIONED loans.
     */
    static getSanctioned = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const loans = await disbursement_service_1.DisbursementService.getSanctionedLoans();
        apiResponse_1.ApiResponse.send(res, 200, 'Sanctioned loans retrieved successfully', loans);
    });
    /**
     * Disburse a SANCTIONED loan application.
     */
    static disburse = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const loan = await disbursement_service_1.DisbursementService.disburseLoan(req.params.id, req.user._id.toString());
        apiResponse_1.ApiResponse.send(res, 200, 'Loan disbursed successfully', loan);
    });
}
exports.DisbursementController = DisbursementController;
