import { BlobOptions } from "buffer";
import { ComponentType, ReactElement, ReactNode, SyntheticEvent } from "react";
import { DataType, ValidationResult } from "../DataType";
import { IValidationError } from "../error";
import { FieldController } from "./FieldController";

export enum FormChangeType {
    field = 'field',
    submit = 'submit',
}
export enum FormChangeStatus {
    changed = 'changed',
    submitting = 'submitting',
    submitted = 'submitted',
}
export interface IFormChange {
    type: FormChangeType;
    status: FormChangeStatus;
    field?: FieldController;
    error?: any; // not falsy when submit failed
}
export type FormWatcher = (form: FormController, details: IFormChange) => void;

export interface FieldComponentProps {
    name: string;
    value: any,
    onChange: (eventOrValue: any) => void
    onBlur: (event: SyntheticEvent) => void,
    error: string | null;
    id?: string;
    label?: string | ReactElement;
    help?: string | ReactElement;
    placeholder?: string;
    autoComplete?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    options?: IOption[];
}

export type IFormFields = Record<string, IFieldDescriptor>

export interface IOption {
    value: string, label: string
}

export interface IFieldDescriptor<T = any> {
    type: DataType<T>;
    component: ComponentType<FieldComponentProps>;
    // serialize the value to be added to the form data when submited
    // if not defined the valus is send as is
    serialize?: (value: T) => any;
    // options for select / radio fields
    options?: IOption[] | (() => Promise<IOption[]>);
    // default values for field properties
    label?: string | ReactElement;
    help?: string | ReactElement;
    placeholder?: string;
    autoComplete?: string;
    validateOn?: 'blur' | 'change' | 'submit';
    validate?: (field: FieldController<T>) => ValidationResult;
}

export interface IField<T = any> {
    controller: FieldController<T>;
    component: ComponentType<FieldComponentProps>;
    serialize?: (value: T) => any;
    options?: IOption[] | (() => Promise<IOption[]>);
    // default values for field properties
    label?: string | ReactElement;
    help?: string | ReactElement;
    placeholder?: string;
    autoComplete?: string;
    validateOn?: 'blur' | 'change' | 'submit';
    validate?: (field: FieldController<T>) => ValidationResult;
}

interface FormControllerProps {
    fields: Record<string, IFieldDescriptor>;
    onSubmit: (form: FormController) => any;
    data?: Record<string, any>;
    validateOn?: 'blur' | 'change' | 'submit';
    translateError?: (error: IValidationError) => string;
}
export class FormController {

    watchers: FormWatcher[] = [];
    fields: Record<string, IField> = {};
    onSubmit: (form: FormController) => any;
    isSubmitting = false;
    translateError: (error: IValidationError) => string;

    constructor({ onSubmit, fields, data, translateError, validateOn: formValidateOn }: FormControllerProps) {
        const formFields = this.fields;
        this.onSubmit = onSubmit;
        this.translateError = translateError || ((error: IValidationError) => error.message || error.code || 'validation error');
        for (const name in fields) {
            const { type, validate, validateOn, ...others } = fields[name];
            const value = data ? data[name] : undefined;
            formFields[name] = {
                controller: new FieldController({ form: this, name, type, value, validate, validateOn: validateOn || formValidateOn }),
                ...others
            }
        }
    }

    onFieldChange(field: FieldController) {
        const details = { type: FormChangeType.field, status: FormChangeStatus.changed, field };
        this.watchers.forEach(watcher => watcher(this, details));
    }

    getField(name: string): IField {
        const field = this.fields[name];
        if (!field) {
            throw new Error(`Field ${name} is not defined`);
        }
        return field;
    }

    getFieldController(name: string): FieldController {
        const field = this.fields[name];
        if (!field) {
            throw new Error(`Field ${name} is not defined`);
        }
        return field.controller;
    }


    watch(watcher: FormWatcher) {
        this.watchers.push(watcher);
        return () => {
            this.watchers = this.watchers.filter(w => w !== watcher);
        }
    }

    isDirty() {
        return Object.values(this.fields).some(field => field.controller.isDirty);
    }

    isValid() {
        return Object.values(this.fields).every(field => field.controller.isValid);
    }

    get errors() {
        const errors: IValidationError[] = [];
        for (const field of Object.values(this.fields)) {
            if (field.controller.value.error) {
                errors.push(field.controller.value.error);
            }
        }
        return errors;
    }

    get data() {
        const data: Record<string, any> = {};
        const fields = this.fields;
        for (const name in fields) {
            const field = fields[name];
            const value = field.controller.value;
            data[name] = field.serialize ? field.serialize(value) : value;
        }
        return data;
    }


    private _fireSubmitEvent(status: FormChangeStatus, error?: any) {
        const details = { type: FormChangeType.submit, status, error };
        this.watchers.forEach(watcher => watcher(this, details));
    }

    validate() {
        let isValid = true;
        Object.values(this.fields).forEach(field => {
            if (field.controller.validate()) {
                isValid = false;
                field.controller.refresh();
            }
        });
        return isValid;
    }

    submit() {
        if (this.validate()) {
            this.isSubmitting = true;
            this._fireSubmitEvent(FormChangeStatus.submitting);
            const result = this.onSubmit(this);
            if (result instanceof Promise) {
                result.then(() => {
                    this.isSubmitting = false;
                    this._fireSubmitEvent(FormChangeStatus.submitted);
                }).catch(err => {
                    this.isSubmitting = false;
                    this._fireSubmitEvent(FormChangeStatus.submitted, err || new Error('unknown error'));
                });
            } else {
                this.isSubmitting = false;
                this._fireSubmitEvent(FormChangeStatus.submitted);
            }
        }
    }

}
