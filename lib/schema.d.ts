import { SchemaInterface, FieldInterface } from "./interfaces";
import { ErrorReport } from "./errors";
export declare abstract class AbstractSchema implements SchemaInterface {
    protected fields: FieldInterface[];
    private errors;
    load(data: Object): any;
    dump(data: any): Object;
    reset(): void;
    hasErrors(): boolean;
    getErrors(): ErrorReport[];
    createFields(): FieldInterface[];
    protected createObject(): Object;
    private getFields;
}
