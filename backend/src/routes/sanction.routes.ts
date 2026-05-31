import { Router } from 'express';
import { SanctionController } from '../controllers/sanction.controller';
import { authMiddleware, authorizeMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all sanction routes; restrict to Sanction Officer and Admin roles only
router.use(authMiddleware);
router.use(authorizeMiddleware(['SANCTION', 'ADMIN']));

// Endpoints
router.get('/applied', SanctionController.getApplied);
router.post('/:id/approve', SanctionController.approve);
router.post('/:id/reject', SanctionController.reject);

export default router;
