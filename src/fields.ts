
import { FieldInterface, SchemaInterface, FilterInterface, ValidatorInterface } from "./interfaces"


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
     * name of the attribute where data will be dumped
     * @type {string}
     */
    dumpName?: string;

    /**
     * true if field is only dumped (it is skipped on load)
     * @type {boolean}
     */
    dumpOnly?: boolean;

    /**
     * name of the attribute where data will be loaded from
     * @type {string}
     */
    loadName?: string;

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
}


export abstract class Base implements FieldInterface
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
    dumpOnly: boolean = false;

    /**
     * name of the attribute where data will be loaded from
     * @type {string}
     */
    loadName: string;

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
     * create and initialize instance
     * @param {string}      name    name of the field
     * @param {BaseOptions} options options
     */
    constructor(name: string, options?: BaseOptions)
    {
        options = this.prepareOptions(options);
        if (!options.dumpName) options.dumpName = name;
        if (!options.loadName) options.loadName = name;

        this.name = name;
        this.dumpName = options.dumpName;
        this.loadName = options.loadName;

        if (options.dumpOnly !== undefined) this.dumpOnly = options.dumpOnly;
        if (options.loadOnly !== undefined) this.loadOnly = options.loadOnly;

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
    protected prepareOptions<OptionsType>(options?: OptionsType): OptionsType
    {
        return options ? options : {} as any;
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
    constructor(name: string, options?: AbstractFieldOptions)
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
     * if true (default), UTC version of Date methods is used
     * @type {boolean}
     */
    useUTC?: boolean;
}


/**
 * Base class for date fields
 * @type {Object}
 */
export abstract class DateBase<ParsedDataType> extends CommonBase
{
    /**
     * if true (default), UTC version of Date methods is used
     * @type {boolean}
     */
    useUTC: boolean = true;

    /**
     * initialize instance
     * @param {string}          name    name of the field
     * @param {DateBaseOptions} options options
     */
    constructor(name: string, options?: DateBaseOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);

        if (options.useUTC !== undefined) this.useUTC = options.useUTC;
    }

    /**
     * load value from string
     * @param  {string} val value to be parsed
     * @return {Date}       Date object with parsed data
     */
    loadValue(val: string): Date
    {
        let result = new Date();
        let parsedData = this.parseData(val);
        this.applyParsedData(parsedData, result);
        return result;
    }

    /**
     * parse data from string
     * @param  {string}         val data to be parsed
     * @return {ParsedDataType}     information about parsed data
     */
    protected parseData(val: string): ParsedDataType
    {
        let pattern = this.getPattern();
        let result = pattern.exec(val);

        if (result === null)
            throw new Error("Invalid date format in field '" + this.name + "'");

        return this.processParsedData(result);
    }

    /**
     * process string parts from input to parsed data
     * @param  {string[]}       data strings parsed by RegExp pattern
     * @return {ParsedDataType}      parsed data for evaluation
     */
    protected abstract processParsedData(data: string[]): ParsedDataType;

    /**
     * apply parsed data to target Date object
     * @param {ParsedDataType} parsedData parsed data
     * @param {Date}           targetDate target Date object where parsed data is applied to
     */
    protected abstract applyParsedData(parsedData: ParsedDataType, targetDate: Date);

    /**
     * get RegExp pattern for input parsing
     * @return {RegExp} pattern
     */
    protected abstract getPattern(): RegExp;
}


/**
 * hold information about date
 * @type {Object}
 */
interface ParsedDate
{
    /**
     * year
     * @type {number}
     */
    year: number;

    /**
     * one based month index
     * @type {number}
     */
    month: number;

    /**
     * date in month
     * @type {number}
     */
    day: number;
}


/**
 * date field
 * @type {Object}
 * @param {ParsedDate}        type of data info parsed from input string
 */
export class Date_ extends DateBase<ParsedDate>
{
    static PARSE_PATTERN_STR = "([0-9]{4})-([0-9]{2})-([0-9]{2})"
    static PARSE_PATTERN = new RegExp("^" + Date_.PARSE_PATTERN_STR + "$")

    /**
     * convert date to ISO date string
     * @param  {Date}   val date to be dumped
     * @return {string}     string representation of date
     */
    dumpValue(val: Date): string
    {
        return val.toISOString().split("T")[0];
    }

    /**
     * process string parts from input to parsed data
     * @param  {string[]}       data strings parsed by RegExp pattern
     * @return {ParsedDataType}      parsed data for evaluation
     */
    protected processParsedData(data: string[]): ParsedDate
    {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3])
        }
    }

    /**
     * get RegExp pattern for input parsing
     * @return {RegExp} pattern
     */
    protected getPattern(): RegExp
    {
        return Date_.PARSE_PATTERN;
    }

    /**
     * apply parsed data to target Date object
     * @param {ParsedDataType} parsedData parsed data
     * @param {Date}           targetDate target Date object where parsed data is applied to
     */
    protected applyParsedData(data: ParsedDate, target: Date): void
    {
        if (this.useUTC)
        {
            target.setUTCFullYear(data.year);
            target.setUTCMonth(data.month);
            target.setUTCDate(data.day);
        }
        else
        {
            target.setFullYear(data.year);
            target.setMonth(data.month);
            target.setDate(data.day);
        }
    }
}


/**
 * ïnformation about time parsed from input string
 * @type {Object}
 */
interface ParsedTime
{
    /**
     * hour
     * @type {number}
     */
    hour: number;

    /**
     * minute
     * @type {number}
     */
    minute: number;

    /**
     * second
     * @type {number}
     */
    second: number;

    /**
     * millisecond
     * @type {number}
     */
    millisecond: number;
}


/**
 * time field
 * @type {Object}
 */
export class Time extends DateBase<ParsedTime>
{
    /**
     * allowed patterns are:
     * - HH:MM
     * - HH:MM:SS
     * - HH:MM:SS.mmm
     *
     * allowed timezone suffixes are:
     * - none
     * - Z (for UTC)
     * - +/-HH:MM
     * @type {RegExp}
     */
    static PARSE_PATTERN_STR = "([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|([\+\-])([0-9]{2}):([0-9]{2}))?"
    static PARSE_PATTERN = new RegExp("^" + Time.PARSE_PATTERN_STR + "$");

    /**
     * return time part of ISO date string
     * @param  {Date}   val date to be saved
     * @return {string}     time part of ISO date string
     */
    dumpValue(val: Date): string
    {
        return val.toISOString().split("T")[1];
    }

    /**
     * process string parts from input to parsed data
     * @param  {string[]}       data strings parsed by RegExp pattern
     * @return {ParsedDataType}      parsed data for evaluation
     */
    protected processParsedData(data: string[]): ParsedTime
    {
        if (data[4] === undefined)
            data[4] = "0";

        if (data[6] === undefined)
            data[6] = "0";

        return {
            hour: Number(data[1]),
            minute: Number(data[2]),
            second: Number(data[4]),
            millisecond: Number(data[6])
        }
    }

    /**
     * apply parsed data to target Date object
     * @param {ParsedDataType} parsedData parsed data
     * @param {Date}           targetDate target Date object where parsed data is applied to
     */
    protected applyParsedData(parsedData: ParsedTime, targetDate: Date)
    {
        if (this.useUTC)
        {
            targetDate.setUTCHours(
                parsedData.hour, parsedData.minute, parsedData.second, parsedData.millisecond);
        }
        else
        {
            targetDate.setHours(
                parsedData.hour, parsedData.minute, parsedData.second, parsedData.millisecond);
        }
    }

    /**
     * get RegExp pattern for input parsing
     * @return {RegExp} pattern
     */
    protected getPattern(): RegExp
    {
        return Time.PARSE_PATTERN;
    }
}


/**
 * parsed data of date and time
 * @type {Object}
 */
interface ParsedDateTime extends ParsedDate, ParsedTime
{
}


/**
 * date field
 * @type {Object}
 */
export class DateTime extends DateBase<ParsedDateTime>
{
    static PARSE_PATTERN_STR = Date_.PARSE_PATTERN_STR + "T" + Time.PARSE_PATTERN_STR;
    static PARSE_PATTERN = new RegExp("^" + DateTime.PARSE_PATTERN_STR + "$")

    /**
     * get full iso format of Date
     * @param  {Date}   val date to be dumped
     * @return {string}     ISO format of date
     */
    dumpValue(val: Date): string
    {
        return val.toISOString();
    }

    /**
     * get RegExp pattern for input parsing
     * @return {RegExp} pattern
     */
    protected getPattern()
    {
        return DateTime.PARSE_PATTERN;
    }

    /**
     * process string parts from input to parsed data
     * @param  {string[]}       data strings parsed by RegExp pattern
     * @return {ParsedDataType}      parsed data for evaluation
     */
    protected processParsedData(data: string[]): ParsedDateTime
    {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3]),
            hour: Number(data[4]),
            minute: Number(data[5]),
            second: Number(data[7]),
            millisecond: (data[9] === undefined) ? 0 : Number(data[9])
        };
    }

    /**
     * apply parsed data to target Date object
     * @param {ParsedDataType} parsedData parsed data
     * @param {Date}           targetDate target Date object where parsed data is applied to
     */
    protected applyParsedData(data: ParsedDateTime, date: Date): void
    {
        if (this.useUTC)
        {
            date.setUTCFullYear(data.year);
            date.setUTCMonth(data.month);
            date.setUTCDate(data.day);

            date.setUTCHours(data.hour, data.minute, data.second, data.millisecond);
        }
        else
        {
            date.setFullYear(data.year);
            date.setMonth(data.month);
            date.setDate(data.day);

            date.setHours(data.hour, data.minute, data.second, data.millisecond);
        }
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
    constructor(name: string, schema: SchemaInterface, options?: AbstractFieldOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);
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
    constructor(name: string, itemField: FieldInterface, options?: AbstractFieldOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);
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
