

/**
 * define interface for all schema implementations
 * @type {Object}
 */
export interface SchemaInterface
{
    /**
     * load data from raw JSON object, validate them and convert to the defined data format
     * @param  {Object} data raw data from source
     * @return {any}         converted and validated data
     */
    load(data: Object): any;

    /**
     * validate data and convert them to the raw JSON object
     * @param  {any}    data data to be dumped
     * @return {Object}      raw JSON object
     */
    dump(data: any): Object;
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
