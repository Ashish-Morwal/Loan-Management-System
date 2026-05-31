"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const disbursement_controller_1 = require("../controllers/disbursement.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protect all disbursement routes; restrict to Disbursement Officer and Admin roles only
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.authorizeMiddleware)(['DISBURSEMENT', 'ADMIN']));
// Endpoints
router.get('/sanctioned', disbursement_controller_1.DisbursementController.getSanctioned);
router.post('/:id/disburse', disbursement_controller_1.DisbursementController.disburse);
exports.default = router;
