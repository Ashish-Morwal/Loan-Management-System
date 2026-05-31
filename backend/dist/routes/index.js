"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Standard base route
router.get('/', (_req, res) => {
    res.json({
        status: 'success',
        message: 'Welcome to the Loan Management System API (v1)',
    });
});
exports.default = router;
