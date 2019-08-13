
import { FieldInterface, SchemaInterface } from "./interfaces"


interface FieldBaseOptions
{
    name: string;

    dumpName?: string;

    dumpOnly?: boolean;

    loadName?: string;

    loadOnly?: boolean;
}


export abstract class FieldBase implements FieldInterface
{
    name: string;

    dumpName: string;

    dumpOnly: boolean = false;

    loadName: string;

    loadOnly: boolean = false;

    constructor(options: FieldBaseOptions)
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


interface AbstractFieldOptions extends FieldBaseOptions
{

    required?: boolean;

    nullable?: boolean;

    defaultValue?: any;
}


export abstract class AbstractField extends FieldBase
{
    required: boolean = false;

    nullable: boolean = true;

    defaultValue: any;

    constructor(options: AbstractFieldOptions)
    {
        super(options);

        if (options.required !== undefined) this.required = options.required;
        if (options.nullable !== undefined) this.nullable = options.nullable;
        if (options.defaultValue !== undefined) this.defaultValue = options.defaultValue;
    }
}


export abstract class CommonFieldBase extends AbstractField
{
    dump(val: any): any
    {
        if (this.loadOnly) throw new Error("This field is load only");
        val = this.resolveMissingAndNull(val);

        if (val !== null)
            val = this.dumpValue(val);

        return val;
    }

    load(val: any): any
    {
        if (this.dumpOnly) throw new Error("This field is dump only");
        val = this.resolveMissingAndNull(val);

        if (val !== null)
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
        if (this.required && val === undefined)
        {
            if (this.defaultValue === undefined)
                throw new Error("Value " + this.name + " is missing");

            val = this.defaultValue;
        }

        return val;
    }

    protected resolveIsNull(val: any): any
    {
        if (val === null && !this.nullable)
            throw new Error("Value is NULL");

        return val;
    }
}


export class StringField extends CommonFieldBase
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


export class NumberField extends CommonFieldBase
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


export class IntField extends NumberField
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


interface DateFieldOptions extends AbstractFieldOptions
{
    useUTC?: boolean;
}


export abstract class DateFieldBase<ParsedDataType> extends CommonFieldBase
{
    useUTC: boolean = true;

    constructor(options: DateFieldOptions)
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


export class DateField extends DateFieldBase<ParsedDate>
{
    static PARSE_PATTERN = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/

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
        return DateField.PARSE_PATTERN;
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


export class TimeField extends DateFieldBase<ParsedTime>
{
    static PARSE_PATTERN = /^([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]{1,3}))?)?$/;

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
        return TimeField.PARSE_PATTERN;
    }
}


interface ParsedDateTime extends ParsedDate, ParsedTime
{
}


export class DateTimeField extends DateFieldBase<ParsedDateTime>
{
    static PARSE_PATTERN = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(.([0-9]{1,3}))?Z/

    dumpValue(val: Date): string
    {
        return val.toISOString();
    }

    protected getPattern()
    {
        return DateTimeField.PARSE_PATTERN;
    }

    protected processParsedData(data: string[]): ParsedDateTime
    {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3]),
            hour: Number(data[4]),
            minute: Number(data[5]),
            second: Number(data[6]),
            millisecond: (data[8] === undefined) ? 0 : Number(data[8])
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


interface NestedSchemaFieldOptions extends FieldBaseOptions
{
    schema: SchemaInterface;
}


export class NestedSchemaField extends FieldBase
{
    readonly schema: SchemaInterface;

    constructor(options: NestedSchemaFieldOptions)
    {
        super(options);
        this.schema = options.schema;
    }

    dump(val: any): Object
    {
        return this.schema.dump(val);
    }

    load(val: Object): any
    {
        return this.schema.load(val);
    }
}
