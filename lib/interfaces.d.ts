export interface SchemaInterface<Type = any> {
    load(data: Object): Type;
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
