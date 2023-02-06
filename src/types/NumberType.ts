import { isInt16Array } from "util/types";
import { DataType, Nullable } from "../DataType";
import { InvalidMaxNumberError, InvalidMinNumberError, InvalidTypeError, TypeCastError } from "../error";

function isInt(n: number) {
    return n % 1 === 0;
}

export class NumberType extends DataType<number> {
    cast(value: any) {
        if (value == null) return null;
        const type = typeof value;
        if (type === 'number') {
            return value;
        } else if (type === 'string') {
            value = Number(value);
            if (isNaN(value)) {
                throw new TypeCastError(value, 'number');
            }
            return value;
        } else {
            throw new TypeCastError(value, 'number');
        }
    }

    min(min: number, message?: string) {
        this.validation.push((value) => {
            return value != null && value < min ? new InvalidMinNumberError(min, message) : null;
        })
        return this;
    }

    max(max: number, message?: string) {
        this.validation.push((value) => {
            return value != null && value > max ? new InvalidMaxNumberError(max, message) : null;
        })
        return this;
    }

    integer(message?: string) {
        this.validation.push((value) => {
            return value != null && !isInt(value) ? new InvalidTypeError('integer', message) : null;
        })
        return this;
    }
}
