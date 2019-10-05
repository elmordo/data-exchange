export interface SchemaInterface<Type = any> {
    load(data: Object, target?: Type): Type;
    dump(data: Type): Object;
}
export interface FieldInterface {
    name: string;
    dumpName: string;
    dumpOnly: boolean;
    loadName: string;
    loadOnly: boolean;
    dump(val: any, context?: any, result?: any, schema?: SchemaInterface): any;
    load(val: any, context?: any, result?: any, schema?: SchemaInterface): any;
}
export interface ErrorReportInterface {
    readonly reason: string;
    readonly code: number;
    readonly type: string;
    readonly field: FieldInterface;
    readonly data: any;
    readonly schema: SchemaInterface;
}
export interface FilterInterface {
    filter(val: any): any;
}
export interface ValidatorInterface {
    validate(val: any, context?: any, result?: any, schema?: SchemaInterface): boolean;
    getLastErrors(): ErrorReportInterface[];
}
