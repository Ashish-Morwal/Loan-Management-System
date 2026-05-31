import { Router } from 'express';
import { DisbursementController } from '../controllers/disbursement.controller';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all disbursement routes; restrict to Disbursement Officer and Admin roles only
router.use(authMiddleware);
router.use(authorizeMiddleware(['DISBURSEMENT', 'ADMIN']));

// Endpoints
router.get('/sanctioned', DisbursementController.getSanctioned);
router.post('/:id/disburse', DisbursementController.disburse);

export default router;
