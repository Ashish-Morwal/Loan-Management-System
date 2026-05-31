"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
class AuthController {
    /**
     * Register a new user.
     */
    static register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.registerUser(req.body);
        apiResponse_1.ApiResponse.send(res, 201, 'User registered successfully', result);
    });
    /**
     * Login an existing user.
     */
    static login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.loginUser(req.body);
        apiResponse_1.ApiResponse.send(res, 200, 'User logged in successfully', result);
    });
}
exports.AuthController = AuthController;
