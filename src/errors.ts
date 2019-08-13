
import { SchemaInterface, FieldInterface } from "./interfaces"


export class ErrorReport
{
    constructor(
        readonly reason: string,
        readonly code: number,
        readonly type: string,
        readonly field: FieldInterface,
        readonly data: any,
        readonly schema: SchemaInterface)
    {
    }
}
