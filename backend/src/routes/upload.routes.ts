import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';
import { uploadSalarySlip } from '../middleware/upload.middleware';

const router = Router();

router.post(
  '/salary-slip',
  authMiddleware,
  authorizeMiddleware(['BORROWER']),
  uploadSalarySlip,
  UploadController.uploadSalarySlip
);

export default router;
