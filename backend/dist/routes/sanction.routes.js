"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sanction_controller_1 = require("../controllers/sanction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protect all sanction routes; restrict to Sanction Officer and Admin roles only
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.authorizeMiddleware)(['SANCTION', 'ADMIN']));
// Endpoints
router.get('/applied', sanction_controller_1.SanctionController.getApplied);
router.post('/:id/approve', sanction_controller_1.SanctionController.approve);
router.post('/:id/reject', sanction_controller_1.SanctionController.reject);
exports.default = router;
