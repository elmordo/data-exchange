

/**
 * define interface for all schema implementations
 * @type {Object}
 */
export interface SchemaInterface<Type=any>
{
    /**
     * load data from raw JSON object, validate them and convert to the defined data format
     * @param  {Object} data raw data from source
     * @return {Type}         converted and validated data
     */
    load(data: Object): Type;

    /**
     * validate data and convert them to the raw JSON object
     * @param  {Type}    data data to be dumped
     * @return {Object}      raw JSON object
     */
    dump(data: Type): Object;
}


/**
 * interface for fields
 * @type {Object}
 */
export interface FieldInterface
{
    /**
     * name (identifier) of the field
     * @type {string}
     */
    name: string;

    /**
     * name of the attribute where data will be dumped
     * @type {string}
     */
    dumpName: string;

    /**
     * true if field is only dumped (it is skipped on load)
     * @type {boolean}
     */
    dumpOnly: boolean;

    /**
     * name of the attribute where data will be loaded from
     * @type {string}
     */
    loadName: string;

    /**
     * true if attributed is load only (it is skipped on dump)
     * @type {boolean}
     */
    loadOnly: boolean;

    /**
     * dump value to raw JSON object
     * @param  {any}             val     value to be dumped
     * @param  {any}             context data context (dump source object)
     * @param  {any}             result  actual result data
     * @param  {SchemaInterface} schema  schema where field is processed
     * @return {any}                     dumped value
     */
    dump(val: any, context?: any, result?: any, schema?: SchemaInterface): any;

    /**
     * load value from raw JSON object
     * @param  {any}             val     value to be loaded
     * @param  {any}             context data context (load source object)
     * @param  {any}             result  actual result data
     * @param  {SchemaInterface} schema  schema where field is processed
     * @return {any}                     dumped value
     */
    load(val: any, context?: any, result?: any, schema?: SchemaInterface): any;
}


/**
 * validation error report
 * @type {Object}
 */
export interface ErrorReportInterface
{

    readonly reason: string;

    readonly code: number;

    readonly type: string;

    readonly field: FieldInterface;

    readonly data: any;

    readonly schema: SchemaInterface)
}



export interface FilterInterface
{
    filter(val: any): any;
}


export interface ValidatorInterface
{
    /**
     * test value is valid
     * @param  {any}             val     value to validate
     * @param  {any}             context all data
     * @param  {any}             result  current result
     * @param  {SchemaInterface} schema  schema instance
     * @return {boolean}                 true if value is valid, false otherwise
     */
    validate(val: any, context?: any, result?: any, schema?: SchemaInterface): boolean;

    /**
     * get list of last validation errors
     * @return {ErrorReportInterface[]} [description]
     */
    getLastErrors(): ErrorReportInterface[];
}
