export const ERROR_LIST: any = {
    UNKNOWN: 0,
    SERVER: 1,
    DB: 2,
    API: 3,
    INPUT: 4,
    AUTH: 5,
    ACCESS_DENIED: 6,
    NOT_FOUND: 7,
    EXISTS: 8,
};

export class YITError {
    public statusCode: number;
    public originalErrorMessage: string;
    public customErrorCode: number;

    constructor(statusCode: number, originalErrorMessage: string, customErrorCode: number) {
        this.statusCode = statusCode;
        this.originalErrorMessage = originalErrorMessage;
        this.customErrorCode = customErrorCode;
    }
}