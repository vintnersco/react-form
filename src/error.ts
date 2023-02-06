export interface IValidationError {
    code: string;
    message: string;
}
export enum ValidationErrorType {
    NULL_VALUE = 'IS_NOT_NULL',
    EMPTY_VALUE = 'IS_NOT_EMPTY',
    INVALID_TYPE = 'INVALID_TYPE',
    INVALID_MIN_NUMBER = 'INVALID_MIN_NUMBER',
    INVALID_MAX_NUMBER = 'INVALID_MAX_NUMBER',
    INVALID_MIN_LENGTH = 'INVALID_MIN_LENGTH',
    INVALID_MAX_LENGTH = 'INVALID_MAX_LENGTH',
    INVALID_LENGTH = 'INVALID_LENGTH',
    INVALID_MIN_DATE = 'INVALID_MIN_DATE',
    INVALID_MAX_DATE = 'INVALID_MAX_DATE',
    INVALID_PATTERN = 'INVALID_PATTERN',
    INVALID_EMAIL = 'INVALID_EMAIL',
    INVALID_URL = 'INVALID_URL',
    INVALID_UUID = 'INVALID_UUID',
    PASSWORD_MATCH = 'PASSWORD_MATCH',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
}

export class TypeCastError extends Error {
    code: string;
    constructor(public value: any, public type: string, message?: string) {
        super(message || `Trying to cast "${value}" as a ${type}`);
        this.code = 'TYPE_CAST_ERROR';
    }
}

export class ValidationError extends Error {
    constructor(public code: ValidationErrorType | string, message?: string | null) {
        super(message || code);
    }
}

export class NullValueError extends ValidationError {
    constructor(message?: string) {
        super(ValidationErrorType.NULL_VALUE, message || `Value cannot be null`);
    }
}

export class EmptyValueError extends ValidationError {
    constructor(message?: string) {
        super(ValidationErrorType.EMPTY_VALUE, message || `Value is required`);
    }
}

export class InvalidTypeError extends ValidationError {
    constructor(public type: string, message?: string) {
        super(ValidationErrorType.INVALID_TYPE, message || `Invalid value type. Expecting a ${type}`);
    }
}

export class InvalidMinNumberError extends ValidationError {
    constructor(public min: number, message?: string) {
        super(ValidationErrorType.INVALID_MIN_NUMBER, message || `The value must be greater or equal than ${min}`);
    }
}

export class InvalidMaxNumberError extends ValidationError {
    constructor(public max: number, message?: string) {
        super(ValidationErrorType.INVALID_MAX_NUMBER, message || `The value must be less or equal than ${max}`);
    }
}

export class InvalidMinLengthError extends ValidationError {
    constructor(public min: number, message?: string) {
        super(ValidationErrorType.INVALID_MIN_LENGTH, message || `The value must have at least ${min} ckaracters`);
    }
}

export class InvalidMaxLengthError extends ValidationError {
    constructor(public max: number, message?: string) {
        super(ValidationErrorType.INVALID_MAX_LENGTH, message || `The value must have at most ${max} ckaracters`);
    }
}

export class InvalidLengthError extends ValidationError {
    constructor(public length: number, message?: string) {
        super(ValidationErrorType.INVALID_LENGTH, message || `The value must have exactly ${length} ckaracters`);
    }
}

export class InvalidMinDateError extends ValidationError {
    constructor(public min: Date, message?: string) {
        super(ValidationErrorType.INVALID_MIN_DATE, message || `The date must be greater or equal than ${min}`);
    }
}

export class InvalidMaxDateError extends ValidationError {
    constructor(public max: Date, message?: string) {
        super(ValidationErrorType.INVALID_MAX_DATE, message || `The date must be less or equal than ${max}`);
    }
}

export class InvalidPatternError extends ValidationError {
    constructor(public pattern: string, message?: string) {
        super(ValidationErrorType.INVALID_PATTERN, message || `The value must match the pattern ${pattern}`);
    }
}

export class InvalidEmailError extends ValidationError {
    constructor(message?: string) {
        super(ValidationErrorType.INVALID_EMAIL, message || `Invalid email address`);
    }
}

export class InvalidUrlError extends ValidationError {
    constructor(message?: string) {
        super(ValidationErrorType.INVALID_URL, message || `Invalid URL address`);
    }
}

export class InvalidUUIDError extends ValidationError {
    constructor(message?: string) {
        super(ValidationErrorType.INVALID_UUID, message || `Invalid UUID`);
    }
}

export class PasswordMatchError extends ValidationError {
    constructor(message?: string) {
        super(ValidationErrorType.PASSWORD_MATCH, message || `Passwords do not match`);
    }
}


export class WeakPasswordError extends ValidationError {
    constructor(public cause: 'length' | 'special' | 'uppercase' | 'lowercase' | 'digit', message?: string) {
        super(ValidationErrorType.WEAK_PASSWORD, message || getWeakPasswordMessage(cause));
    }
}

function getWeakPasswordMessage(cause: 'length' | 'special' | 'uppercase' | 'lowercase' | 'digit') {
    switch (cause) {
        case 'length': return 'Password must be at least 8 character long';
        case 'special': return 'Password must contain at least a special character';
        case 'uppercase': return 'Password must contain at least an upper case character';
        case 'digit': return 'Password must contain at least a digit';
        case 'lowercase': return 'Password must contain at least a lower case character';
    }
}
