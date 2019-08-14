
import { FieldInterface, SchemaInterface } from "./interfaces"


interface BaseOptions
{
    name: string;

    dumpName?: string;

    dumpOnly?: boolean;

    loadName?: string;

    loadOnly?: boolean;
}


export abstract class Base implements FieldInterface
{
    name: string;

    dumpName: string;

    dumpOnly: boolean = false;

    loadName: string;

    loadOnly: boolean = false;

    constructor(options: BaseOptions)
    {
        if (!options.dumpName) options.dumpName = options.name;
        if (!options.loadName) options.loadName = options.name;

        this.name = options.name;
        this.dumpName = options.dumpName;
        this.loadName = options.loadName;

        if (options.dumpOnly !== undefined) this.dumpOnly = options.dumpOnly;
        if (options.loadOnly !== undefined) this.loadOnly = options.loadOnly;
    }

    abstract dump(val: any): any;

    abstract load(val: any): any;
}


interface AbstractFieldOptions extends BaseOptions
{

    required?: boolean;

    nullable?: boolean;

    defaultValue?: any;
}


export abstract class AbstractField extends Base
{
    required: boolean = false;

    nullable: boolean = true;

    defaultValue: any;

    constructor(options: AbstractFieldOptions)
    {
        super(options);

        if (options.required !== undefined && options.nullable === undefined)
            options.nullable = !options.required;

        if (options.required !== undefined) this.required = options.required;
        if (options.nullable !== undefined) this.nullable = options.nullable;
        if (options.defaultValue !== undefined) this.defaultValue = options.defaultValue;
    }
}


export abstract class CommonBase extends AbstractField
{
    dump(val: any): any
    {
        if (this.loadOnly) throw new Error("This field is load only");
        val = this.resolveMissingAndNull(val);

        if (val !== null && val !== undefined)
            val = this.dumpValue(val);

        return val;
    }

    load(val: any): any
    {
        if (this.dumpOnly) throw new Error("This field is dump only");
        val = this.resolveMissingAndNull(val);

        if (val !== null && val !== undefined)
            val = this.loadValue(val);

        return val;
    }

    abstract dumpValue(val: any): any;

    abstract loadValue(val: any): any;

    protected resolveMissingAndNull(val: any): any
    {
        val = this.resolveIsMissing(val);
        return this.resolveIsNull(val);
    }

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

    protected resolveIsNull(val: any): any
    {
        if (val === null && !this.nullable)
            throw new Error("Value '" + this.name + "' is NULL");

        return val;
    }
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

    constructor(options: DateBaseOptions)
    {
        super(options);

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
            throw new Error("Invalid date format");

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


interface ComplexFieldOptions extends BaseOptions
{
    required?: boolean;

    nullable?: boolean;
}



export abstract class ComplexFieldBase extends Base
{

    required: boolean = false;

    nullable: boolean = true;

    constructor(options: ComplexFieldOptions)
    {
        super(options);

        if (options.required !== undefined && options.nullable === undefined)
            options.nullable = !options.required;

        if (options.required !== undefined) this.required = options.required;
        if (options.nullable !== undefined) this.nullable = options.nullable;
    }

    protected assertValue(val: Object): void
    {
        if (this.required && val === undefined) throw new Error("Value '" + this.name + "' is required");
        if (!this.nullable && val === null) throw new Error("Value '" + this.name + "' cannot be null");
    }
}


interface NestedSchemaOptions extends ComplexFieldOptions
{
    schema: SchemaInterface;
}


export class NestedSchema extends ComplexFieldBase
{
    schema: SchemaInterface;

    constructor(options: NestedSchemaOptions)
    {
        super(options);
        this.schema = options.schema;
    }

    dump(val: any): Object
    {
        this.assertValue(val);
        if (!val) return val;
        return this.schema.dump(val);
    }

    load(val: Object): any
    {
        this.assertValue(val);
        if (!val) return val;
        return this.schema.load(val);
    }
}


interface ListOptions extends ComplexFieldOptions
{
    itemField: FieldInterface;
}


export class List extends ComplexFieldBase
{
    itemField: FieldInterface;

    constructor(options: ListOptions)
    {
        super(options);
        this.itemField = options.itemField;
    }

    load(val: Object[]): any[]
    {
        this.assertValue(val);
        if (!val) return val;
        return val.map(x => this.itemField.load(x));
    }

    dump(val: any[]): Object[]
    {
        this.assertValue(val);
        if (!val) return val;
        return val.map(x => this.itemField.dump(x));
    }

    protected assertValue(val: any): void
    {
        super.assertValue(val);

        if (val && !(val instanceof Array))
            throw new Error("Value must be instance of Array");
    }
}
