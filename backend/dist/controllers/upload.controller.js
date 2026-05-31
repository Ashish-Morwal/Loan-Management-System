"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Borrower_1 = require("../models/Borrower");
const appError_1 = require("../utils/appError");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const logger_1 = require("../utils/logger");
class UploadController {
    /**
     * Upload salary slip and save path to the borrower's database profile.
     * Cleans up orphaned or replaced files automatically.
     */
    static uploadSalarySlip = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        // 1. Ensure user is authenticated
        if (!req.user) {
            throw new appError_1.AppError('Authentication required', 401);
        }
        // 2. Ensure file was uploaded by Multer
        if (!req.file) {
            throw new appError_1.AppError('Please provide a salary slip file to upload', 400);
        }
        const relativePath = `uploads/salary-slips/${req.file.filename}`;
        try {
            // 3. Find borrower profile for the logged-in user
            const borrower = await Borrower_1.Borrower.findOne({ user: req.user._id });
            if (!borrower) {
                // Clean up the uploaded file if borrower profile doesn't exist
                if (fs_1.default.existsSync(req.file.path)) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                throw new appError_1.AppError('Borrower profile not found. Please create your profile before uploading a salary slip.', 404);
            }
            // 4. Delete old salary slip from disk if it exists
            if (borrower.salarySlipPath) {
                const oldFilePath = path_1.default.join(process.cwd(), borrower.salarySlipPath);
                if (fs_1.default.existsSync(oldFilePath)) {
                    try {
                        fs_1.default.unlinkSync(oldFilePath);
                        logger_1.logger.debug(`Deleted old salary slip: ${oldFilePath}`);
                    }
                    catch (err) {
                        logger_1.logger.error(`Failed to delete old salary slip at ${oldFilePath}:`, err);
                    }
                }
            }
            // 5. Update borrower profile with the new path
            borrower.salarySlipPath = relativePath;
            await borrower.save();
            apiResponse_1.ApiResponse.send(res, 200, 'Salary slip uploaded successfully', {
                fullName: borrower.fullName,
                salarySlipPath: borrower.salarySlipPath,
            });
        }
        catch (error) {
            // Cleanup uploaded file on any execution failure
            if (req.file && fs_1.default.existsSync(req.file.path)) {
                fs_1.default.unlinkSync(req.file.path);
            }
            throw error;
        }
    });
}
exports.UploadController = UploadController;
