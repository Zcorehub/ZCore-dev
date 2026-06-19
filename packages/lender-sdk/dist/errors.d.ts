export declare class ZCoreError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number);
}
export declare class ZCoreAuthError extends ZCoreError {
    constructor(message?: string);
}
export declare class ZCoreNotFoundError extends ZCoreError {
    constructor(message?: string);
}
