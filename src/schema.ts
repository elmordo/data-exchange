
import { SchemaInterface, FieldInterface } from "./interfaces"


export abstract class AbstractSchema
{
    load(data: any): any;

    loadDefaults(): any;

    dump(data: any): any;

    dumpDefaults(): any;

    abstract createFields(): FieldInterface[];
}
