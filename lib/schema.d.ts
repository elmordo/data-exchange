import { SchemaInterface, FieldInterface } from "./interfaces";
import { ErrorReport } from "./errors";
export declare abstract class AbstractSchema<Type = any> implements SchemaInterface<Type> {
    protected fields: FieldInterface[];
    private errors;
    load(data: Object, target?: Type): Type;
    dump(data: Type): Object;
    reset(): void;
    hasErrors(): boolean;
    getErrors(): ErrorReport[];
    createFields(): FieldInterface[];
    createObject(): Type;
    getFields(): FieldInterface[];
}
