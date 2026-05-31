"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrower_controller_1 = require("../controllers/borrower.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All borrower endpoints require authentication
router.use(auth_middleware_1.authMiddleware);
// 1. Borrower Self Routes (Available only to users with BORROWER role)
router.post('/', (0, auth_middleware_1.authorizeMiddleware)(['BORROWER']), borrower_controller_1.BorrowerController.createMyProfile);
router.get('/me', (0, auth_middleware_1.authorizeMiddleware)(['BORROWER']), borrower_controller_1.BorrowerController.getMyProfile);
router.put('/me', (0, auth_middleware_1.authorizeMiddleware)(['BORROWER']), borrower_controller_1.BorrowerController.updateMyProfile);
// 2. Staff/Administrative Routes (Available to Admin and Loan Officers)
router.get('/', (0, auth_middleware_1.authorizeMiddleware)(['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']), borrower_controller_1.BorrowerController.getAllBorrowers);
router.get('/:id', (0, auth_middleware_1.authorizeMiddleware)(['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']), borrower_controller_1.BorrowerController.getBorrowerById);
exports.default = router;
