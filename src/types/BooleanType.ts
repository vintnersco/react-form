import { DataType } from "../DataType";
import { TypeCastError } from "../error";

export class BooleanType extends DataType<boolean> {
    cast(value: any) {
        if (value == null) return null;
        const type = typeof value;
        if (type === 'boolean') {
            return value;
        } else if (type === 'number') {
            return value !== 0;
        } else if (type === 'string') {
            if (value === 'true') {
                return true;
            } else if (value === 'false') {
                return false;
            } else {
                throw new TypeCastError(value, 'boolean');
            }
        } else {
            throw new TypeCastError(value, 'boolean');
        }
    }

}
