import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../utils/appError';

// Define the storage directory path
const uploadDir = path.join(process.cwd(), 'uploads/salary-slips');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Prefix filename with borrower's user ID for uniqueness and structure
    const userId = req.user ? req.user._id.toString() : 'anonymous';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `borrower-${userId}-salary-slip-${timestamp}${ext}`);
  },
});

// File filter: accept only PDF, JPG, JPEG, PNG
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, JPG, JPEG, and PNG formats are allowed!', 400));
  }
};

// Export the middleware configuration
export const uploadSalarySlip = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limits
  },
}).single('salarySlip');
