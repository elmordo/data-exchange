

export interface SchemaInterface
{
    load(data: any): any;

    loadDefaults(): any;

    dump(data: any): any;

    dumpDefaults(): any;
}


export interface FieldInterface
{
    dump(val: any): any;

    load(val: any): any;
}
