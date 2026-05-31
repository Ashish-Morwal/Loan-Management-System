"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSalarySlip = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const appError_1 = require("../utils/appError");
// Define the storage directory path
const uploadDir = path_1.default.join(process.cwd(), 'uploads/salary-slips');
// Ensure upload directory exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Prefix filename with borrower's user ID for uniqueness and structure
        const userId = req.user ? req.user._id.toString() : 'anonymous';
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `borrower-${userId}-salary-slip-${timestamp}${ext}`);
    },
});
// File filter: accept only PDF, JPG, JPEG, PNG
const fileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new appError_1.AppError('Only PDF, JPG, JPEG, and PNG formats are allowed!', 400));
    }
};
// Export the middleware configuration
exports.uploadSalarySlip = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limits
    },
}).single('salarySlip');
