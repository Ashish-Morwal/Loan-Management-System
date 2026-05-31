import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Borrower } from '../models/Borrower';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export class UploadController {
  /**
   * Upload salary slip and save path to the borrower's database profile.
   * Cleans up orphaned or replaced files automatically.
   */
  public static uploadSalarySlip = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      // 1. Ensure user is authenticated
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      // 2. Ensure file was uploaded by Multer
      if (!req.file) {
        throw new AppError('Please provide a salary slip file to upload', 400);
      }

      const relativePath = `uploads/salary-slips/${req.file.filename}`;

      try {
        // 3. Find borrower profile for the logged-in user
        const borrower = await Borrower.findOne({ user: req.user._id });
        if (!borrower) {
          // Clean up the uploaded file if borrower profile doesn't exist
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          throw new AppError(
            'Borrower profile not found. Please create your profile before uploading a salary slip.',
            404
          );
        }

        // 4. Delete old salary slip from disk if it exists
        if (borrower.salarySlipPath) {
          const oldFilePath = path.join(process.cwd(), borrower.salarySlipPath);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
              logger.debug(`Deleted old salary slip: ${oldFilePath}`);
            } catch (err) {
              logger.error(`Failed to delete old salary slip at ${oldFilePath}:`, err as Error);
            }
          }
        }

        // 5. Update borrower profile with the new path
        borrower.salarySlipPath = relativePath;
        await borrower.save();

        ApiResponse.send(res, 200, 'Salary slip uploaded successfully', {
          fullName: borrower.fullName,
          salarySlipPath: borrower.salarySlipPath,
        });
      } catch (error) {
        // Cleanup uploaded file on any execution failure
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        throw error;
      }
    }
  );
}
