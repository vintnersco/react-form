import { throws } from "assert";
import { SyntheticEvent } from "react";
import { DataType, DataValue, Nullable, ValidationResult } from "../DataType";
import { EmptyValueError } from "../error";
import { FormController } from "./FormController";

export interface IFieldChange {
    value: any,
    oldValue: any,
    // refrehs is used when a refrehs was requested programatically (to re-render the field)
    // validation is used when the field error status changes on blur event
    type: 'change' | 'validation' | 'refresh'
}

export interface FieldWatcher<Type = any> {
    (field: FieldController<Type, DataType<Type>>, change: IFieldChange): void;
}

interface FieldControllerProps<Type = any, DT extends DataType<Type> = DataType<any>> {
    name: string;
    type: DT;
    form: FormController;
    value?: Nullable<Type>;
    required?: boolean | string;
    validate?: (field: FieldController<Type, DT>) => ValidationResult;
    validateOn?: 'blur' | 'change' | 'submit';
}

export class FieldController<Type = any, DT extends DataType<Type> = DataType<any>> {
    name: string;
    form: FormController;
    type: DT;
    validateOnBlur = false;
    data: DataValue<Type>;
    private watchers: FieldWatcher[] = [];
    private _required?: boolean | string;

    constructor({ form, name, type, value, required, validate, validateOn }: FieldControllerProps<Type, DT>) {
        this.form = form;
        this.name = name;
        this.type = type;

        this._required = required;
        const onValidate = (value: Nullable<Type>): ValidationResult => {
            if (this._required && this.isEmpty) {
                return new EmptyValueError(typeof required === 'string' ? required as string : undefined)
            }
            if (validate) {
                return validate(this);
            }
            return null;
        };

        this.data = type.newValue(value, (value, oldValue) => {
            this._fireChange(oldValue);
        }, onValidate);

        if (validateOn !== 'change') {
            this.data.autoValidate = false;
            if (validateOn === 'blur') {
                this.validateOnBlur = true;
            }
        }
        this.onBlur = this.onBlur.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    set required(required: boolean | string) {
        this._required = required;
    }

    get isRequired(): boolean {
        return !!this._required;
    }

    get value(): Nullable<Type> {
        return this.data.value;
    }

    set value(value: any) {
        this.data.value = value;
    }

    _fireChange(oldValue: Nullable<Type>) {
        this.watchers.forEach(watcher => watcher(this, { value: this.value, oldValue, type: 'change' }));
        this.form.onFieldChange(this);
    }

    // user changed the value
    onChange(eventOrValue: any) {
        if (eventOrValue == null) {
            this.value = null;
        } else if ((eventOrValue as any).nativeEvent && (eventOrValue as any).nativeEvent instanceof Event) {
            const target = (eventOrValue as SyntheticEvent).target as HTMLElement;
            if (!target) {
                throw new Error('Unsupported onChange argument: ' + eventOrValue);
            }
            if ((target as any).type === 'checkbox') {
                this.value = (target as HTMLInputElement).checked;
            } else if ('value' in target) {
                this.value = target.value;
            } else {
                throw new Error('Unsupported onChange argument: ' + eventOrValue);
            }
        } else {
            this.value = eventOrValue;
        }
    }


    onBlur() {
        if (this.validateOnBlur) {
            const oldErrorCode = this.data.error?.code || null;
            const newError = this.validate();
            if (oldErrorCode !== (newError?.code || null)) {
                this.watchers.forEach(watcher => watcher(this, { value: this.value, oldValue: this.value, type: 'validation' }));
            }
        }
    }

    watch(fn: FieldWatcher) {
        this.watchers.push(fn);
        return () => {
            this.watchers = this.watchers.filter(watcher => watcher !== fn);
        }
    }

    get isDirty(): boolean {
        return this.data.isDirty;
    }

    get isValid(): boolean {
        return this.data.isValid;
    }

    get isEmpty(): boolean {
        return this.data.isEmpty;
    }

    get error() {
        return this.data.error;
    }

    validate(): ValidationResult {
        return this.data.validate();
    }

    refresh() {
        this.watchers.forEach(watcher => watcher(this, { value: this.value, oldValue: this.value, type: 'refresh' }));
    }

    getField<Type = any>(name: string): FieldController<Type> {
        return this.form.getFieldController(name);
    }

    getFieldValue<Type = any>(name: string): Type {
        return this.getField(name).value;
    }

}

function createFieldValidation(validate?: (field: FieldController) => ValidationResult, required?: boolean | string) {
    if (required || validate != null) {
        return (field: FieldController): ValidationResult => {
            if (required && field.isEmpty) {
                return new EmptyValueError(typeof required === 'string' ? required as string : undefined)
            }
            if (validate) {
                return validate(field);
            }
            return null;
        }
    }
    return null;
}
