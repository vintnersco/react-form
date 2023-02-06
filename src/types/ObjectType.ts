import { isInt16Array } from "util/types";
import { DataType, Nullable } from "../DataType";
import { TypeCastError } from "../error";

export class ObjectType extends DataType<object> {
    cast(value: any) {
        if (value == null) return null;
        const type = typeof value;
        if (type !== 'object') {
            throw new TypeCastError(value, 'boolean');
        }
        return value;
    }

}
