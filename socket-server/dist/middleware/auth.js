"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySocketToken = verifySocketToken;
exports.isAdmin = isAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifySocketToken(socket) {
    const token = socket.handshake.auth?.token;
    if (!token)
        throw new Error('No token provided');
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET not configured');
    const payload = jsonwebtoken_1.default.verify(token, secret);
    if (!payload.id || !payload.email || !payload.role || !payload.userType) {
        throw new Error('Invalid token payload');
    }
    return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        userType: payload.userType,
    };
}
function isAdmin(user) {
    return user.userType === 'ADMIN' || user.userType === 'SUPER_ADMIN';
}
