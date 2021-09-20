import {DateTimeFormatter, IsoFormatter} from "./datetime";
import {
    FieldInterface,
    FilterInterface,
    SchemaInterface,
    SkipIfUndefinedSettings,
    ValidatorInterface
} from "./interfaces"


interface FilterSettings
{
    inFilters: FilterInterface[];

    outFilters: FilterInterface[];
}


interface ValidatorSettings
{
    inValidators: ValidatorInterface[];

    outValidators: ValidatorInterface[];
}


/**
 * common field options
 * @type {Object}
 */
interface BaseOptions
{
    /**
     * legacy name for the `localName` field
     * @type {string}
     * @deprecated
     */
    dumpName?: string;

    /**
     * name of the attribute in the local object
     * @type {string}
     */
    localName?: string;

    /**
     * true if field is only dumped (it is skipped on load)
     * @type {boolean}
     */
    dumpOnly?: boolean;

    /**
     * name of the attribute where data will be loaded from
     * @type {string}
     * @deprecated
     */
    loadName?: string;

    /**
     * legacy name for the `remoteName` field
     * @type {string}
     */
    remoteName?: string;

    /**
     * true if attributed is load only (it is skipped on dump)
     * @type {boolean}
     */
    loadOnly?: boolean;

    /**
     * filter settings
     * if list of filters is given, the order of filters is for an input and reverse list of filters
     * is used for an output
     */
    filters?: FilterSettings|FilterInterface[];

    /**
     * validator settings
     * if list of validators is given, same list is used for input and output
     */
    validators?: ValidatorSettings|ValidatorInterface[];

    /**
     * if true (default) value is skipped
     */
    skipIfUndefined?: boolean|SkipIfUndefinedSettings;
}


export abstract class Base implements FieldInterface
{
    /**
     * name (identifier) of the field
     * @type {string}
     */
    name: string|null;

    /**
     * name of the attribute where data will be dumped
     * @type {string}
     */
    remoteName: string;

    /**
     * true if field is only dumped (it is skipped on load)
     * @type {boolean}
     */
    dumpOnly: boolean = false;

    /**
     * name of the attribute where data will be loaded from
     * @type {string}
     */
    localName: string;

    /**
     * true if attributed is load only (it is skipped on dump)
     * @type {boolean}
     */
    loadOnly: boolean = false;

    /**
     * set of validators
     * @type {ValidatorSettings}
     */
    validators: ValidatorSettings;

    /**
     * set of filters
     * @type {FilterSettings}
     */
    filters: FilterSettings;

    /**
     * if true and some value is undefined it wont be included in result
     */
    skipIfUndefined: SkipIfUndefinedSettings;

    /**
     * create and initialize instance
     * @param {string}      name    name of the field
     * @param {BaseOptions} options options
     */
    constructor(name: string|null, options?: BaseOptions)
    {
        options = this.prepareOptions(options);
        if (!options.localName) options.localName = name;
        if (!options.remoteName) options.remoteName = name;

        this.name = name;
        this.localName = options.localName;
        this.remoteName = options.remoteName;

        if (options.dumpOnly !== undefined) this.dumpOnly = options.dumpOnly;
        if (options.loadOnly !== undefined) this.loadOnly = options.loadOnly;

        if (options.skipIfUndefined !== undefined) {
            if (typeof options.skipIfUndefined === "boolean") {
                this.skipIfUndefined = {whenLoad: options.skipIfUndefined, whenDump: options.skipIfUndefined};
            } else {
                this.skipIfUndefined = options.skipIfUndefined;
            }
        } else {
            this.skipIfUndefined = {whenLoad: true, whenDump: true};
        }

        this.filters = this.createFilterSettings(options);
        this.validators = this.createValidatorSettings(options);
    }

    /**
     * dump value to raw JSON object
     * @param  {any}             val     value to be dumped
     * @param  {any}             context data context (dump source object)
     * @param  {any}             result  actual result data
     * @param  {SchemaInterface} schema  schema where field is processed
     * @return {any}                     dumped value
     */
    abstract dump(val: any, context?: any, result?: any, schema?: SchemaInterface): any;

    /**
     * load value from raw JSON object
     * @param  {any}             val     value to be loaded
     * @param  {any}             context data context (load source object)
     * @param  {any}             result  actual result data
     * @param  {SchemaInterface} schema  schema where field is processed
     * @return {any}                     dumped value
     */
    abstract load(val: any, context?: any, result?: any, schema?: SchemaInterface): any;

    /**
     * prepare options for use
     */
    protected prepareOptions<OptionsType extends BaseOptions>(options?: OptionsType): OptionsType
    {
        options = options ? options : {} as any;

        if ("dumpName" in options) {
            options.localName = options.dumpName;
            console.warn(`The 'dumpName' option key is deprecated and will be removed in next major release`);
        }
        if ("loadName" in options) {
            options.remoteName = options.loadName;
            console.warn(`The 'loadName' option key is deprecated and will be removed in next major release`);
        }

        return options;
    }

    protected applyFilters(val: any, filters: FilterInterface[]): any
    {
        return filters.reduce((v, f) => f.filter(v), val);
    }

    protected applyValidators(
        val: any, context: any, result: any, schema: SchemaInterface,
        validators: ValidatorInterface[]): void
    {
        let isValid = validators.reduce(
            (valid, f) => valid && f.validate(val, context, result, schema), true);

        if (!isValid)
            throw new Error("Invalid value '" + val.toString() + "' in field '" + this.name + "'");
    }

    private createFilterSettings(options: BaseOptions): FilterSettings
    {
        let filters = options.filters;
        if (!filters) return {inFilters: [], outFilters: []};

        if (filters instanceof Array)
            return {inFilters: filters, outFilters: filters.slice().reverse()}
        else
            return filters;
    }

    private createValidatorSettings(options: BaseOptions): ValidatorSettings
    {
        let validators = options.validators;
        if (!validators) return {inValidators: [], outValidators: []};

        if (validators instanceof Array)
            return {inValidators: validators, outValidators: validators};
        else
            return validators;
    }
}


/**
 * basic options for the abstract fields
 * @type {Object}
 */
interface AbstractFieldOptions extends BaseOptions
{
    /**
     * is field value required?
     * @type {boolean}
     */
    required?: boolean;

    /**
     * can be value null?
     * @type {boolean}
     */
    nullable?: boolean;

    /**
     * default value if value is not presented
     * @type {any}
     */
    defaultValue?: any;
}


/**
 * base class for most fields, adding some functionality to the minimal field implementation
 * provided by Base class.
 *
 * * required - if true, field key has to be presented in processed object
 * * nullable - if true, value stored under the key can be null
 * * defaultValue - if key is missing, the defaultVaulue is used. If defaultValue is set to the
 *     other value then undefined, required test is always passed. If defaultValue is set to the
 *     other value then undefiend and null, both required and nullable tests are always passed.
 *
 * The required and nullable options are following behaviour:
 *
 *   OPTIONS            PROPERTY
 *  ----------         ----------
 *  REQ | NULL         REQ | NULL
 *   U  |  U            F  |  T
 *   X  |  U     ==>    X  |  !X
 *   U  |  Y            F  |  Y
 *   X  |  Y            X  |  Y
 *
 * U  - undefined
 * X  - value set to the required option
 * Y  - value set to the nullable option
 * !X - negated X
 *
 * @type {Object}
 */
export abstract class AbstractField extends Base
{
    /**
     * is field requried?
     * @type {boolean}
     */
    required: boolean = false;

    /**
     * is field nullable?
     * @type {boolean}
     */
    nullable: boolean = true;

    /**
     * default value
     * @type {any}
     */
    defaultValue: any;

    /**
     * create and initialize instance
     * @param {string}               name    name of the field
     * @param {AbstractFieldOptions} options options
     */
    constructor(name: string|null, options?: AbstractFieldOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);

        if (options.required !== undefined && options.nullable === undefined)
            options.nullable = !options.required;

        if (options.required !== undefined) this.required = options.required;
        if (options.nullable !== undefined) this.nullable = options.nullable;
        if (options.defaultValue !== undefined) this.defaultValue = options.defaultValue;
    }

    /**
     * resolve basic validation tests (required and missing)
     * @param  {any} val value passed to the test
     * @return {any}     processed value (default value if passed value was undefined)
     */
    protected resolveMissingAndNull(val: any): any
    {
        val = this.resolveIsMissing(val);
        return this.resolveIsNull(val);
    }

    /**
     * throw error if value is missing (value is undefined) and no defaultValue is set.
     * @param  {any} val value to be tested
     * @return {any}     processed value (defaultValue if some default value is set)
     */
    protected resolveIsMissing(val: any): any
    {
        if (val === undefined)
        {
            if (this.required && this.defaultValue === undefined)
                throw new Error("Value " + this.name + " is missing");

            val = this.defaultValue;
        }

        return val;
    }

    /**
     * throw error if value is null
     * @param  {any} val value to be tested
     * @return {any}     passed value
     */
    protected resolveIsNull(val: any): any
    {
        if (val === null && !this.nullable)
            throw new Error("Value '" + this.name + "' is NULL");

        return val;
    }
}


/**
 * base class for common primitive types
 * provide common load and dump logic (validators, filters, ...) and define abstract methods
 * for parsing and exporting data.
 * @type {Object}
 */
export abstract class CommonBase extends AbstractField
{
    /**
     * dump value to raw JSON object
     * @param  {any}             val     value to be dumped
     * @param  {any}             context data context (dump source object)
     * @param  {any}             result  actual result data
     * @param  {SchemaInterface} schema  schema where field is processed
     * @return {any}                     dumped value
     */
    dump(val: any, context?: any, result?: any, schema?: SchemaInterface): any
    {
        if (this.loadOnly) throw new Error("This field is load only");
        val = this.applyFilters(val, this.filters.outFilters);
        val = this.resolveMissingAndNull(val);
        this.applyValidators(val, context, result, schema, this.validators.outValidators);

        if (val !== null && val !== undefined)
            val = this.dumpValue(val);

        return val;
    }

    /**
     * load value from raw JSON object
     * @param  {any}             val     value to be loaded
     * @param  {any}             context data context (load source object)
     * @param  {any}             result  actual result data
     * @param  {SchemaInterface} schema  schema where field is processed
     * @return {any}                     dumped value
     */
    load(val: any, context?: any, result?: any, schema?: SchemaInterface): any
    {
        if (this.dumpOnly) throw new Error("This field is dump only");
        val = this.applyFilters(val, this.filters.inFilters);
        val = this.resolveMissingAndNull(val);
        this.applyValidators(val, context, result, schema, this.validators.outValidators);

        if (val !== null && val !== undefined)
            val = this.loadValue(val);

        return val;
    }

    /**
     * convert value to dump version of value
     * @param  {any} val value to be dumped
     * @return {any}     dumped value
     */
    abstract dumpValue(val: any): any;

    /**
     * parse value
     * @param  {any} val value to be parsed
     * @return {any}     parsed data
     */
    abstract loadValue(val: any): any;
}


/**
 * field containing string
 * @type {Object}
 */
export class Str extends CommonBase
{
    /**
     * save value as string
     * @param  {any}    val value to be dumped
     * @return {string}     string representation of the value
     */
    dumpValue(val: any): string
    {
        return val.toString();
    }

    /**
     * return value as string
     * @param  {any}    val value to be converted to string
     * @return {string}     string representation of the value
     */
    loadValue(val: any): string
    {
        return val.toString();
    }
}


/**
 * common numeric field
 * @type {Object}
 */
export class Numeric extends CommonBase
{
    /**
     * try to convert value to number
     * @param  {any}    val value to be converted
     * @return {Number}     number
     */
    dumpValue(val: any): Number
    {
        let result = Number(val);

        if (isNaN(result))
            throw new Error("Invalid field input");

        return result;
    }

    /**
     * load number from given value
     * @param  {any}    val value to be converted
     * @return {Number}     number
     */
    loadValue(val: any): Number
    {
        let result = Number(val);

        if (isNaN(result))
            throw new Error("Invalid field input");

        return result;
    }
}


/**
 * integer field
 * @type {Object}
 */
export class Int extends Numeric
{
    /**
     * dump value as integer number
     * @param  {number} val number to be dumped
     * @return {number}     dumped value
     */
    dumpValue(val: number): number
    {
        return Math.floor(val);
    }

    /**
     * load value as integer number
     * @param  {any}    val value to be loaded
     * @return {Number}     loaded value
     */
    loadValue(val: any): Number
    {
        let result = Number(val);

        if (isNaN(result))
            throw new Error("Invalid field input");

        return Math.floor(result);
    }
}


/**
 * logic value (true or false)
 * @type {Object}
 */
export class Bool extends CommonBase
{
    /**
     * dump value as boolean
     * @param {any} val value to be converted to boolean
     * @returns {boolean} value converted to boolean
     */
    dumpValue(val: any): boolean
    {
        return !!val;
    }

    /**
     * load value as boolean
     * @param {any} val value to be converted to boolean
     * @returns {boolean} value converted to boolean
     */
    loadValue(val: any): boolean
    {
        return !!val;
    }
}


/**
 * options for fields derived from Date
 * @type {Object}
 */
interface DateBaseOptions extends AbstractFieldOptions
{
    /**
     * formatter for date and time (default is IsoFormatter)
     */
    formatter?: DateTimeFormatter
}


/**
 * Base class for date fields
 * @type {Object}
 */
export abstract class DateBase extends CommonBase
{
    /**
     * formatter for date and time
     */
    formatter: DateTimeFormatter;

    /**
     * initialize instance
     * @param {string}          name    name of the field
     * @param {DateBaseOptions} options options
     */
    constructor(name: string|null, options?: DateBaseOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);

        if (options.formatter !== undefined) {
            this.formatter = options.formatter;
        } else {
            this.formatter = new IsoFormatter();
        }
    }
}


/**
 * date field
 * @type {Object}
 */
export class Date_ extends DateBase
{
    /**
     * convert date to ISO date string
     * @param  {Date}   val date to be dumped
     * @return {string}     string representation of date
     */
    dumpValue(val: Date): string
    {
        return this.formatter.formatDate(val);
    }

    loadValue(val: string): any {
        return this.formatter.parseDate(val);
    }
}


/**
 * time field
 * @type {Object}
 */
export class Time extends DateBase
{
    /**
     * return time part of ISO date string
     * @param  {Date}   val date to be saved
     * @return {string}     time part of ISO date string
     */
    dumpValue(val: Date): string
    {
        return this.formatter.formatTime(val);
    }

    loadValue(val: string): Date {
        return this.formatter.parseTime(val);
    }
}


/**
 * date field
 * @type {Object}
 */
export class DateTime extends DateBase
{
    /**
     * get full iso format of Date
     * @param  {Date}   val date to be dumped
     * @return {string}     ISO format of date
     */
    dumpValue(val: Date): string
    {
        return this.formatter.formatDateTime(val);
    }

    loadValue(val: any): Date {
        return this.formatter.parseDateTime(val);
    }
}


/**
 * base class for complex fields
 * This class is empty at this time
 * @type {Object}
 */
export abstract class ComplexFieldBase extends AbstractField
{
}


/**
 * provide schema nesting
 * @type {Object}
 */
export class Nested extends ComplexFieldBase
{
    /**
     * nested schema type
     * @type {SchemaInterface}
     */
    schema: SchemaInterface;

    /**
     * initialize instance
     * @param {string}               name    name of the field
     * @param {SchemaInterface}      schema  nested schema type
     * @param {AbstractFieldOptions} options additional options
     */
    constructor(name: string|null, schema: SchemaInterface, options?: AbstractFieldOptions)
    {
        super(name, options);
        this.schema = schema;
    }

    /**
     * dump value by applying the schema
     * @param  {any}    val value (object) to be dumped
     * @return {Object}     dumped data
     */
    dump(val: any): Object
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return this.schema.dump(val);
    }

    /**
     * load value by applying the schema
     * @param  {Object} val value (object) to be loaded
     * @return {any}        [description]
     */
    load(val: Object): any
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return this.schema.load(val);
    }
}


/**
 * provide support of item lists
 * @type {Object}
 */
export class List extends ComplexFieldBase
{
    /**
     * item type field
     * @type {FieldInterface}
     */
    itemField: FieldInterface;

    /**
     * initialize instance
     * @param {string}               name      name of the field
     * @param {FieldInterface}       itemField field prototype
     * @param {AbstractFieldOptions} options   additioanl options
     */
    constructor(name: string|null, itemField: FieldInterface, options?: AbstractFieldOptions)
    {
        super(name, options);
        this.itemField = itemField;
    }

    /**
     * load sequence of items
     * @param  {Object[]} val input list
     * @return {any[]}        list of parsed data
     */
    load(val: Object[]): any[]
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return val.map(x => this.itemField.load(x));
    }

    /**
     * dump sequence of items
     * @param  {any[]}    val list of items
     * @return {Object[]}     list of dumped data
     */
    dump(val: any[]): Object[]
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return val.map(x => this.itemField.dump(x));
    }

    /**
     * prepare value
     * @param {any} val value to be prepared
     */
    protected resolveMissingAndNull(val: any): void
    {
        super.resolveMissingAndNull(val);

        if (val && !(val instanceof Array))
            throw new Error("Value must be instance of Array");
    }
}


export abstract class AbstractMapping extends ComplexFieldBase {
    constructor(
        name: string|null,
        protected keyType: FieldInterface,
        protected valueType: FieldInterface,
        options?: AbstractFieldOptions)
    {
        super(name, options);
    }
}


export class Dict extends AbstractMapping {

    dump(val: any): any {
        val = this.resolveMissingAndNull(val);
        if (!val) return;
        const result = {};
        for (const k of Object.getOwnPropertyNames(val)) {
            result[this.keyType.dump(k)] = this.valueType.dump(val[k]);
        }
        return result;
    }

    load(val: any): any {
        val = this.resolveMissingAndNull(val);
        if (!val) return;
        const result = {};
        for (const k of Object.getOwnPropertyNames(val)) {
            result[this.keyType.load(k)] = this.valueType.load(val[k]);
        }
        return result;
    }
}


export class Map_ extends AbstractMapping {

    dump(val: any): any {
        val = this.resolveMissingAndNull(val);
        if (!val) return;
        if (!(val instanceof Map)) {
            throw new Error("Value must be instance of Map");
        }
        const result = {};
        for (const k of val.keys()) {
            result[this.keyType.dump(k)] = this.valueType.dump(val.get(k));
        }
        return result;
    }

    load(val: any): any {
        val = this.resolveMissingAndNull(val);
        if (!val) return;
        const result = new Map();
        for (const k of Object.getOwnPropertyNames(val)) {
            result.set(this.keyType.load(k), this.valueType.load(val[k]));
        }
        return result;
    }
}
