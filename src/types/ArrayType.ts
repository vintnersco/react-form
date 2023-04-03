import { DataType } from "../DataType";
import { TypeCastError } from "../error";

export class ArrayType<T = any> extends DataType<T[]> {
    cast(value: any) {
        if (value == null) return null;
        if (Array.isArray(value)) {
            return value;
        }
        throw new TypeCastError(value, 'array');

    }

}
