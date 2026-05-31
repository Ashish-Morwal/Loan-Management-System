"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false,
    },
    role: {
        type: String,
        enum: {
            values: ['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'BORROWER'],
            message: '{VALUE} is not a valid role',
        },
        default: 'BORROWER',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Pre-save middleware to hash the password
UserSchema.pre('save', async function (next) {
    // Only hash password if it was modified (or is new)
    if (!this.isModified('password'))
        return next();
    if (this.password) {
        this.password = await bcryptjs_1.default.hash(this.password, 12);
    }
    next();
});
// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password)
        return false;
    return await bcryptjs_1.default.compare(candidatePassword, this.password);
};
exports.User = (0, mongoose_1.model)('User', UserSchema);
