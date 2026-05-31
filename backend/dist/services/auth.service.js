"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const appError_1 = require("../utils/appError");
const env_1 = require("../config/env");
class AuthService {
    /**
     * Register a new user.
     */
    static async registerUser(userData) {
        const { name, email, password, role } = userData;
        if (!name || !email || !password) {
            throw new appError_1.AppError('Name, email, and password are required', 400);
        }
        // 1. Check if email is unique
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            throw new appError_1.AppError('Email is already registered', 400);
        }
        // 2. Validate password strength
        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new appError_1.AppError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)', 400);
        }
        // 3. Create new user
        const newUser = await User_1.User.create({
            name,
            email,
            password,
            role: role || 'BORROWER',
        });
        // 4. Generate JWT Token
        const token = this.generateToken(newUser);
        // Formulate response user data (without password)
        const userJson = newUser.toJSON();
        delete userJson.password;
        userJson.id = newUser._id.toString();
        delete userJson._id;
        delete userJson.__v;
        return {
            user: userJson,
            token,
        };
    }
    /**
     * Log in an existing user.
     */
    static async loginUser(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
            throw new appError_1.AppError('Please provide email and password', 400);
        }
        // 1. Find user by email and select the password field
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            throw new appError_1.AppError('Incorrect email or password', 401);
        }
        // 2. Check if user is active
        if (!user.isActive) {
            throw new appError_1.AppError('Your account has been deactivated. Please contact support.', 403);
        }
        // 3. Compare passwords
        const isCorrectPassword = await user.comparePassword(password);
        if (!isCorrectPassword) {
            throw new appError_1.AppError('Incorrect email or password', 401);
        }
        // 4. Generate JWT Token
        const token = this.generateToken(user);
        // Formulate response user data (without password)
        const userJson = user.toJSON();
        delete userJson.password;
        userJson.id = user._id.toString();
        delete userJson._id;
        delete userJson.__v;
        return {
            user: userJson,
            token,
        };
    }
    /**
     * Generate a JWT access token for a user.
     */
    static generateToken(user) {
        const options = {
            expiresIn: env_1.config.jwtExpiresIn,
        };
        return jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_1.config.jwtSecret, options);
    }
}
exports.AuthService = AuthService;
