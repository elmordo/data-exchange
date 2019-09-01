
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


export abstract class CommonBase extends AbstractField
{
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

    abstract dumpValue(val: any): any;

    abstract loadValue(val: any): any;
}


export class Str extends CommonBase
{
    dumpValue(val: any): string
    {
        return val.toString();
    }

    loadValue(val: any): string
    {
        return val.toString();
    }
}


export class Numeric extends CommonBase
{
    dumpValue(val: any): Number
    {
        let result = Number(val);

        if (isNaN(result))
            throw new Error("Invalid field input");

        return result;
    }

    loadValue(val: any): Number
    {
        let result = Number(val);

        if (isNaN(result))
            throw new Error("Invalid field input");

        return result;
    }
}


export class Int extends Numeric
{
    dumpValue(val: number): number
    {
        return val;
    }

    loadValue(val: any): Number
    {
        let result = Number(val);

        if (isNaN(result))
            throw new Error("Invalid field input");

        return Math.floor(result);
    }
}


export class Bool extends CommonBase
{
    dumpValue(val)
    {
        return !!val;
    }

    loadValue(val)
    {
        return !!val;
    }
}


interface DateBaseOptions extends AbstractFieldOptions
{
    useUTC?: boolean;
}


export abstract class DateBase<ParsedDataType> extends CommonBase
{
    useUTC: boolean = true;

    constructor(name: string, options?: DateBaseOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);

        if (options.useUTC !== undefined) this.useUTC = options.useUTC;
    }

    loadValue(val: string): Date
    {
        let result = new Date();
        let parsedData = this.parseData(val);
        this.applyParsedData(parsedData, result);
        return result;
    }

    protected parseData(val: string): ParsedDataType
    {
        let pattern = this.getPattern();
        let result = pattern.exec(val);

        if (result === null)
            throw new Error("Invalid date format in field '" + this.name + "'");

        return this.processParsedData(result);
    }

    protected abstract processParsedData(data: string[]): ParsedDataType;

    protected abstract applyParsedData(parsedData: ParsedDataType, targetDate: Date);

    protected abstract getPattern(): RegExp;
}


interface ParsedDate
{
    year: number;

    month: number;

    day: number;
}


export class Date_ extends DateBase<ParsedDate>
{
    static PARSE_PATTERN_STR = "([0-9]{4})-([0-9]{2})-([0-9]{2})"
    static PARSE_PATTERN = new RegExp("^" + Date_.PARSE_PATTERN_STR + "$")

    dumpValue(val: Date): string
    {
        return val.toISOString().split("T")[0];
    }

    protected processParsedData(data: string[]): ParsedDate
    {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3])
        }
    }

    protected getPattern(): RegExp
    {
        return Date_.PARSE_PATTERN;
    }

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


interface ParsedTime
{
    hour: number;

    minute: number;

    second: number;

    millisecond: number;
}


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
    static PARSE_PATTERN_STR = "([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]{1,3}))?)?(Z|([\+\-])([0-9]{2}):([0-9]{2}))?"
    static PARSE_PATTERN = new RegExp("^" + Time.PARSE_PATTERN_STR + "$");

    dumpValue(val: Date): string
    {
        return val.toISOString().split("T")[1];
    }

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

    protected getPattern(): RegExp
    {
        return Time.PARSE_PATTERN;
    }
}


interface ParsedDateTime extends ParsedDate, ParsedTime
{
}


export class DateTime extends DateBase<ParsedDateTime>
{
    static PARSE_PATTERN_STR = Date_.PARSE_PATTERN_STR + "T" + Time.PARSE_PATTERN_STR;
    static PARSE_PATTERN = new RegExp("^" + DateTime.PARSE_PATTERN_STR + "$")

    dumpValue(val: Date): string
    {
        return val.toISOString();
    }

    protected getPattern()
    {
        return DateTime.PARSE_PATTERN;
    }

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


export abstract class ComplexFieldBase extends AbstractField
{
}


export class Nested extends ComplexFieldBase
{
    schema: SchemaInterface;

    constructor(name: string, schema: SchemaInterface, options?: AbstractFieldOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);
        this.schema = schema;
    }

    dump(val: any): Object
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return this.schema.dump(val);
    }

    load(val: Object): any
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return this.schema.load(val);
    }
}


export class List extends ComplexFieldBase
{
    itemField: FieldInterface;

    constructor(name: string, itemField: FieldInterface, options?: AbstractFieldOptions)
    {
        super(name, options);
        options = this.prepareOptions(options);
        this.itemField = itemField;
    }

    load(val: Object[]): any[]
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return val.map(x => this.itemField.load(x));
    }

    dump(val: any[]): Object[]
    {
        this.resolveMissingAndNull(val);
        if (!val) return val;
        return val.map(x => this.itemField.dump(x));
    }

    protected resolveMissingAndNull(val: any): void
    {
        super.resolveMissingAndNull(val);

        if (val && !(val instanceof Array))
            throw new Error("Value must be instance of Array");
    }
}
