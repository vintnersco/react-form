import { DataType } from "../DataType";
import { InvalidMaxDateError, InvalidMinDateError, TypeCastError } from "../error";

export class DateType extends DataType<Date> {
    cast(value: any) {
        if (value == null) return null;
        if (value instanceof Date) return value;
        const type = typeof value;
        if (type === 'number') {
            return new Date(value);
        } else if (type === 'string') {
            return new Date(value);
        } else {
            throw new TypeCastError(value, 'date');
        }
    }

    min(min: Date | string | number, message?: string) {
        const minDate = this.cast(min)?.getTime() || 0;
        this.validation.push((value) => {
            return value != null && value.getTime() < minDate ? new InvalidMinDateError(new Date(min), message) : null;
        })
        return this;
    }

    max(max: Date | string | number, message?: string) {
        const maxDate = this.cast(max)?.getTime() || 0;
        this.validation.push((value) => {
            return value != null && value.getTime() > maxDate ? new InvalidMaxDateError(new Date(max), message) : null;
        })
        return this;
    }

}
