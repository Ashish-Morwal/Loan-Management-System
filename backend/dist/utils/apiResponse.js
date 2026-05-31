"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    success = true;
    message;
    data;
    constructor(message, data) {
        this.message = message;
        if (data !== undefined) {
            this.data = data;
        }
    }
    /**
     * Send a success response.
     * @param res Express response object
     * @param statusCode HTTP Status Code (default 200)
     * @param message Informational message
     * @param data Optional response payload
     */
    static send(res, statusCode = 200, message, data) {
        const responseBody = new ApiResponse(message, data);
        return res.status(statusCode).json(responseBody);
    }
}
exports.ApiResponse = ApiResponse;
