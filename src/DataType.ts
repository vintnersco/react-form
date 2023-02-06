import { EmptyValueError, NullValueError, IValidationError, ValidationError } from "./error";


export type Nullable<Type> = Type | null;

export type ValidationResult = IValidationError | undefined | null;

export interface IValidator<Type> {
    (value: Nullable<Type>): ValidationResult;
}

export class Validation<Type> {
    chain: IValidator<Type>[] = [];
    push(validator: IValidator<Type>): Validation<Type> {
        this.chain.push(validator);
        return this;
    }
    validate(value: Nullable<Type>): ValidationResult {
        for (const validator of this.chain) {
            const err = validator(value);
            if (err) {
                return err;
            }
        }
        return null;
    }
}

export abstract class DataType<Type> {
    _validation: Validation<Type> | null = null;

    abstract cast(value: any): Nullable<Type>;

    get validation() {
        if (!this._validation) {
            this._validation = new Validation();
        }
        return this._validation;
    }

    equals(value1: Nullable<Type>, value2: Nullable<Type>) {
        return value1 === value2;
    }

    isEmpty(value: Nullable<Type>) {
        return value == null;
    }

    validate(value: Nullable<Type>) {
        return this._validation?.validate(value);
    }

    newValue(value?: Nullable<Type> | undefined,
        onChange?: (value: Nullable<Type>, oldValue: Nullable<Type>) => void,
        onValidate?: (value: Nullable<Type>) => ValidationResult): DataValue<Type, DataType<Type>> {
        return new DataValue(this, this.cast(value), onChange, onValidate);
    }

    notNull(message?: string) {
        this.validation.push((value: Nullable<Type>) => {
            if (value == null) {
                return new NullValueError(message);
            }
        });
        return this;
    }

    notEmpty(message?: string) {
        this.validation.push((value: Nullable<Type>) => {
            if (!this.isEmpty(value)) {
                return new EmptyValueError(message);
            }
        });
        return this;
    }

    assert(tester: (value: Nullable<Type>) => boolean, code: string, message?: string) {
        this.validation.push((value: Nullable<Type>) => {
            return tester(value) ? null : new ValidationError(code, message);
        });
        return this;
    }
}

export class DataValue<V, T extends DataType<V> = DataType<V>> {
    type: T;
    error: IValidationError | null = null;
    private _value: Nullable<V> = null;
    readonly initialValue: Nullable<V>;
    autoValidate = true;

    constructor(type: T, value: Nullable<V>,
        private onChange?: ((value: Nullable<V>, oldValue: Nullable<V>) => void),
        private onValidate?: (value: Nullable<V>) => ValidationResult) {
        this.type = type;
        this._value = value;
        this.initialValue = value;
    }

    validate() {
        if (this.onValidate) {
            this.error = this.onValidate(this._value) || null;
            if (this.error) {
                return this.error;
            }
        }
        this.error = this.type.validate(this._value) || null;
        return this.error;
    }

    get value() {
        return this._value;
    }

    set value(value: any) {
        const newValue = this.type.cast(value);
        if (!this.type.equals(newValue, this._value)) {
            this.error = null;
            const oldValue = this._value;
            this._value = newValue;
            if (this.autoValidate) {
                this.validate();
            }
            this.onChange && this.onChange(value, oldValue);
        }
    }

    get isEmpty() {
        return this.type.isEmpty(this._value);
    }

    get isValid() {
        return this.error == null;
    }

    get isDirty() {
        return !this.type.equals(this._value, this.initialValue);
    }

    get isNull() {
        return this._value == null;
    }
}
