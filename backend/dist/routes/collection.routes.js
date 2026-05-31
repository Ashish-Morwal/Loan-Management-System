"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collection_controller_1 = require("../controllers/collection.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protect all collection routes; restrict to Collection Officer and Admin roles only
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.authorizeMiddleware)(['COLLECTION', 'ADMIN']));
// Endpoints
router.post('/', collection_controller_1.CollectionController.collectPayment);
router.get('/', collection_controller_1.CollectionController.listAllPayments);
router.get('/loan/:loanId', collection_controller_1.CollectionController.getPaymentsByLoan);
exports.default = router;
