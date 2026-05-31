"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowerController = void 0;
const borrower_service_1 = require("../services/borrower.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const appError_1 = require("../utils/appError");
class BorrowerController {
    /**
     * Create the logged-in user's borrower profile.
     */
    static createMyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        console.debug('BORROWER CONTROLLER createMyProfile', {
            route: req.originalUrl,
            method: req.method,
            user: req.user ? { id: req.user._id.toString(), role: req.user.role } : null,
            body: req.body,
        });
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const profile = await borrower_service_1.BorrowerService.createProfile(req.user._id.toString(), req.body);
        apiResponse_1.ApiResponse.send(res, 201, 'Borrower profile created successfully', profile);
    });
    /**
     * Get the logged-in user's borrower profile.
     */
    static getMyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const profile = await borrower_service_1.BorrowerService.getProfileByUserId(req.user._id.toString());
        apiResponse_1.ApiResponse.send(res, 200, 'Borrower profile retrieved successfully', profile);
    });
    /**
     * Update the logged-in user's borrower profile.
     */
    static updateMyProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        const profile = await borrower_service_1.BorrowerService.updateProfile(req.user._id.toString(), req.body);
        apiResponse_1.ApiResponse.send(res, 200, 'Borrower profile updated successfully', profile);
    });
    /**
     * Get borrower profile by its unique ID (Admin/Sales lookup).
     */
    static getBorrowerById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await borrower_service_1.BorrowerService.getProfileById(req.params.id);
        apiResponse_1.ApiResponse.send(res, 200, 'Borrower profile retrieved successfully', profile);
    });
    /**
     * Get all borrower profiles (Admin/Sales lookup).
     */
    static getAllBorrowers = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const profiles = await borrower_service_1.BorrowerService.listAllBorrowers();
        apiResponse_1.ApiResponse.send(res, 200, 'Borrower profiles retrieved successfully', profiles);
    });
}
exports.BorrowerController = BorrowerController;
