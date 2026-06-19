"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZCoreNotFoundError = exports.ZCoreAuthError = exports.ZCoreError = void 0;
class ZCoreError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "ZCoreError";
    }
}
exports.ZCoreError = ZCoreError;
class ZCoreAuthError extends ZCoreError {
    constructor(message = "Unauthorized") {
        super(message, 401);
        this.name = "ZCoreAuthError";
    }
}
exports.ZCoreAuthError = ZCoreAuthError;
class ZCoreNotFoundError extends ZCoreError {
    constructor(message = "Not found") {
        super(message, 404);
        this.name = "ZCoreNotFoundError";
    }
}
exports.ZCoreNotFoundError = ZCoreNotFoundError;
