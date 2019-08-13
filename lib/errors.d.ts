import { SchemaInterface, FieldInterface } from "./interfaces";
export declare class ErrorReport {
    readonly reason: string;
    readonly code: number;
    readonly type: string;
    readonly field: FieldInterface;
    readonly data: any;
    readonly schema: SchemaInterface;
    constructor(reason: string, code: number, type: string, field: FieldInterface, data: any, schema: SchemaInterface);
}
