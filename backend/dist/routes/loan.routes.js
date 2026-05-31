"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("../controllers/loan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All loan endpoints require authentication
router.use(auth_middleware_1.authMiddleware);
// 1. Borrower Client Routes
router.post('/', (0, auth_middleware_1.authorizeMiddleware)(['BORROWER']), loan_controller_1.LoanController.applyMyLoan);
router.get('/me', (0, auth_middleware_1.authorizeMiddleware)(['BORROWER']), loan_controller_1.LoanController.getMyLoans);
// 2. Staff/Administrative Routes
router.get('/', (0, auth_middleware_1.authorizeMiddleware)(['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']), loan_controller_1.LoanController.getAllLoans);
// Get specific loan details (accessed by borrower owner or administrative staff)
router.get('/:id', loan_controller_1.LoanController.getLoanDetails);
// Update status (restricted to administrative/approver roles; service verifies transitions)
router.patch('/:id/status', (0, auth_middleware_1.authorizeMiddleware)(['ADMIN', 'SANCTION', 'DISBURSEMENT', 'COLLECTION']), loan_controller_1.LoanController.updateStatus);
exports.default = router;
