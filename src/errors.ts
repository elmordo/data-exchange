
import { SchemaInterface, FieldInterface } from "./interfaces"


/**
 * validation error report
 * @type {Object}
 */
export class ErrorReport
{
    /**
     * create and initialize instance
     * @param {string}          readonly reason validation fail reason
     * @param {number}          readonly code   error code
     * @param {string}          readonly type   error type
     * @param {FieldInterface}  readonly field  source field instance
     * @param {any}             readonly data   source data causes the fail
     * @param {SchemaInterface} readonly schema source schema instance
     */
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
