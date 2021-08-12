/**
 * define interface for all schema implementations
 * @type {Object}
 */
export interface SchemaInterface<Type=any>
{
    /**
     * load data from raw JSON object, validate them and convert to the defined data format
     * if no target object is given, new object is created
     * @param  {Object} data raw data from source
     * @param  {Type}   target target object to load data into
     * @return {Type}         converted and validated data
     */
    load(data: Object, target?: Type): Type;

    /**
     * validate data and convert them to the raw JSON object
     * @param  {Type}    data data to be dumped
     * @return {Object}      raw JSON object
     */
    dump(data: Type): Object;
}


export interface SkipIfUndefinedSettings {
    /**
     * if true, attributes with undefined values will not be included in result local object when load
     */
    whenLoad: boolean;
    /**
     * if true, attributes with undefined values will not be included in result remote object when dump
     */
    whenDump: boolean;
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
     * name of the attribute in a remote object
     * @type {string}
     */
    remoteName: string;

    /**
     * true if field is only dumped (it is skipped on load)
     * @type {boolean}
     */
    dumpOnly: boolean;

    /**
     * name of the attribute in a local object
     * @type {string}
     */
    localName: string;

    /**
     * true if attributed is load only (it is skipped on dump)
     * @type {boolean}
     */
    loadOnly: boolean;

    /**
     * if true (default) value is skipped
     */
    skipIfUndefined: SkipIfUndefinedSettings;

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
    /**
     * error reason
     * @type {string}
     */
    readonly reason: string;

    /**
     * error code
     * @type {number}
     */
    readonly code: number;

    /**
     * error type
     * @type {string}
     */
    readonly type: string;

    /**
     * source field
     * @type {FieldInterface}
     */
    readonly field: FieldInterface;

    /**
     * error data
     * @type {any}
     */
    readonly data: any;

    /**
     * source schema
     * @type {SchemaInterface}
     */
    readonly schema: SchemaInterface;
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
