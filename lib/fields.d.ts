import { FieldInterface, SchemaInterface } from "./interfaces";
interface BaseOptions {
    dumpName?: string;
    dumpOnly?: boolean;
    loadName?: string;
    loadOnly?: boolean;
}
export declare abstract class Base implements FieldInterface {
    name: string;
    dumpName: string;
    dumpOnly: boolean;
    loadName: string;
    loadOnly: boolean;
    constructor(name: string, options?: BaseOptions);
    abstract dump(val: any): any;
    abstract load(val: any): any;
    protected prepareOptions<OptionsType>(options?: OptionsType): OptionsType;
}
interface AbstractFieldOptions extends BaseOptions {
    required?: boolean;
    nullable?: boolean;
    defaultValue?: any;
}
export declare abstract class AbstractField extends Base {
    required: boolean;
    nullable: boolean;
    defaultValue: any;
    constructor(name: string, options?: AbstractFieldOptions);
    protected resolveMissingAndNull(val: any): any;
    protected resolveIsMissing(val: any): any;
    protected resolveIsNull(val: any): any;
}
export declare abstract class CommonBase extends AbstractField {
    dump(val: any): any;
    load(val: any): any;
    abstract dumpValue(val: any): any;
    abstract loadValue(val: any): any;
}
export declare class Str extends CommonBase {
    dumpValue(val: any): string;
    loadValue(val: any): string;
}
export declare class Numeric extends CommonBase {
    dumpValue(val: any): Number;
    loadValue(val: any): Number;
}
export declare class Int extends Numeric {
    dumpValue(val: number): number;
    loadValue(val: any): Number;
}
export declare class Bool extends CommonBase {
    dumpValue(val: any): boolean;
    loadValue(val: any): boolean;
}
interface DateBaseOptions extends AbstractFieldOptions {
    useUTC?: boolean;
}
export declare abstract class DateBase<ParsedDataType> extends CommonBase {
    useUTC: boolean;
    constructor(name: string, options?: DateBaseOptions);
    loadValue(val: string): Date;
    protected parseData(val: string): ParsedDataType;
    protected abstract processParsedData(data: string[]): ParsedDataType;
    protected abstract applyParsedData(parsedData: ParsedDataType, targetDate: Date): any;
    protected abstract getPattern(): RegExp;
}
interface ParsedDate {
    year: number;
    month: number;
    day: number;
}
export declare class Date_ extends DateBase<ParsedDate> {
    static PARSE_PATTERN_STR: string;
    static PARSE_PATTERN: RegExp;
    dumpValue(val: Date): string;
    protected processParsedData(data: string[]): ParsedDate;
    protected getPattern(): RegExp;
    protected applyParsedData(data: ParsedDate, target: Date): void;
}
interface ParsedTime {
    hour: number;
    minute: number;
    second: number;
    millisecond: number;
}
export declare class Time extends DateBase<ParsedTime> {
    static PARSE_PATTERN_STR: string;
    static PARSE_PATTERN: RegExp;
    dumpValue(val: Date): string;
    protected processParsedData(data: string[]): ParsedTime;
    protected applyParsedData(parsedData: ParsedTime, targetDate: Date): void;
    protected getPattern(): RegExp;
}
interface ParsedDateTime extends ParsedDate, ParsedTime {
}
export declare class DateTime extends DateBase<ParsedDateTime> {
    static PARSE_PATTERN_STR: string;
    static PARSE_PATTERN: RegExp;
    dumpValue(val: Date): string;
    protected getPattern(): RegExp;
    protected processParsedData(data: string[]): ParsedDateTime;
    protected applyParsedData(data: ParsedDateTime, date: Date): void;
}
export declare abstract class ComplexFieldBase extends AbstractField {
}
export declare class NestedSchema extends ComplexFieldBase {
    schema: SchemaInterface;
    constructor(name: string, schema: SchemaInterface, options?: AbstractFieldOptions);
    dump(val: any): Object;
    load(val: Object): any;
}
export declare class List extends ComplexFieldBase {
    itemField: FieldInterface;
    constructor(name: string, itemField: FieldInterface, options?: AbstractFieldOptions);
    load(val: Object[]): any[];
    dump(val: any[]): Object[];
    protected resolveMissingAndNull(val: any): void;
}
export {};
