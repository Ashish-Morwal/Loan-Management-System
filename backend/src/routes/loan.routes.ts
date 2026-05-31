import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All loan endpoints require authentication
router.use(authMiddleware);

// 1. Borrower Client Routes
router.post('/', authorizeMiddleware(['BORROWER']), LoanController.applyMyLoan);
router.get('/me', authorizeMiddleware(['BORROWER']), LoanController.getMyLoans);

// 2. Staff/Administrative Routes
router.get(
  '/',
  authorizeMiddleware(['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']),
  LoanController.getAllLoans
);

// Get specific loan details (accessed by borrower owner or administrative staff)
router.get('/:id', LoanController.getLoanDetails);

// Update status (restricted to administrative/approver roles; service verifies transitions)
router.patch(
  '/:id/status',
  authorizeMiddleware(['ADMIN', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']),
  LoanController.updateStatus
);

export default router;
