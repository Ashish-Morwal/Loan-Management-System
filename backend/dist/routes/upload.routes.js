"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.post('/salary-slip', auth_middleware_1.authMiddleware, (0, auth_middleware_1.authorizeMiddleware)(['BORROWER']), upload_middleware_1.uploadSalarySlip, upload_controller_1.UploadController.uploadSalarySlip);
exports.default = router;
