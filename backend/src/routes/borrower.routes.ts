import { Router } from 'express';
import { BorrowerController } from '../controllers/borrower.controller';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All borrower endpoints require authentication
router.use(authMiddleware);

// 1. Borrower Self Routes (Available only to users with BORROWER role)
router.post('/', authorizeMiddleware(['BORROWER']), BorrowerController.createMyProfile);
router.get('/me', authorizeMiddleware(['BORROWER']), BorrowerController.getMyProfile);
router.put('/me', authorizeMiddleware(['BORROWER']), BorrowerController.updateMyProfile);

// 2. Staff/Administrative Routes (Available to Admin and Loan Officers)
router.get(
  '/',
  authorizeMiddleware(['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']),
  BorrowerController.getAllBorrowers
);
router.get(
  '/:id',
  authorizeMiddleware(['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']),
  BorrowerController.getBorrowerById
);

export default router;
