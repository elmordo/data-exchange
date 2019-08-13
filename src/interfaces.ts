

export interface SchemaInterface
{
    load(data: Object): any;

    dump(data: any): Object;
}


export interface FieldInterface
{
    name: string;

    required: boolean;

    nullable: boolean;

    defaultValue: any;

    dumpName: string;

    dumpOnly: boolean;

    loadName: string;

    loadOnly: boolean;

    dump(val: any, context?: any, result?: any, schema?: SchemaInterface): any;

    load(val: any, context?: any, result?: any, schema?: SchemaInterface): any;
}
