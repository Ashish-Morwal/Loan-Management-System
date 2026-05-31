import { Router } from 'express';
import { CollectionController } from '../controllers/collection.controller';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all collection routes; restrict to Collection Officer and Admin roles only
router.use(authMiddleware);
router.use(authorizeMiddleware(['COLLECTION', 'ADMIN']));

// Endpoints
router.post('/', CollectionController.collectPayment);
router.get('/', CollectionController.listAllPayments);
router.get('/loan/:loanId', CollectionController.getPaymentsByLoan);

export default router;
