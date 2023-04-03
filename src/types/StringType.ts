import { DataType, Nullable } from "../DataType";
import { InvalidEmailError, InvalidLengthError, InvalidMaxLengthError, InvalidMinLengthError, InvalidPatternError, InvalidUrlError, InvalidUUIDError, TypeCastError, WeakPasswordError } from "../error";

//see https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
const emailRx = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const uuidRx = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
//const urlRx = /^https?:\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
// a simple one
const urlRx = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/[^\/]+)*\/?(?:\?\.)?$/i


export class StringType extends DataType<string> {
    cast(value: any) {
        if (value == null) return null;
        if (typeof value === 'object' || Array.isArray(value)) {
            throw new TypeCastError(value, 'string');
        }
        return value == null ? null : String(value);
    }

    isEmpty(value: Nullable<string>) {
        return value == null || value === '';
    }

    minLength(minLength: number, message?: string) {
        this.validation.push((value) => {
            return value == null || value.length < minLength ? new InvalidMinLengthError(minLength, message) : null;
        })
        return this;
    }

    maxLength(maxLength: number, message?: string) {
        this.validation.push((value) => {
            return value == null || value?.length > maxLength ? new InvalidMaxLengthError(maxLength, message) : null;
        })
        return this;
    }

    length(length: number, message?: string) {
        this.validation.push((value) => {
            return value == null || value?.length !== length ? new InvalidLengthError(length, message) : null;
        })
        return this;
    }

    match(pattern: RegExp, message?: string) {
        this.validation.push((value) => {
            return value == null || pattern.test(value) ? null : new InvalidPatternError(pattern.toString(), message);
        })
        return this;
    }

    email(message?: string) {
        this.validation.push((value) => value == null || emailRx.test(value) ? null : new InvalidEmailError(message));
        return this;
    }

    uuid(message?: string) {
        this.validation.push((value) => value == null || uuidRx.test(value) ? null : new InvalidUUIDError(message));
        return this;
    }

    url(message?: string) {
        this.validation.push((value) => value == null || urlRx.test(value) ? null : new InvalidUrlError(message));
        return this;
    }

    strongPassword(message?: string) {
        this.validation.push(validateStrongPassword);
        return this;
    }
}

function validateStrongPassword(value: Nullable<string>) {
    if (value != null) {
        if (value.length < 8) return new WeakPasswordError('length');
        if (!/[A-Z]/.test(value)) return new WeakPasswordError('uppercase');
        if (!/[a-z]/.test(value)) return new WeakPasswordError('lowercase');
        if (!/[0-9]/.test(value)) return new WeakPasswordError('digit');
        if (!/[^A-Za-z0-9]/.test(value)) return new WeakPasswordError('special');
    }
    return null;
}
