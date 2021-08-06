

export abstract class DateTimeFormatter {
    abstract parseDate(inp: string): Date;

    abstract parseTime(inp: string): Date;

    abstract parseDateTime(inp: string): Date;

    abstract formatDate(date: Date): string;

    abstract formatTime(date: Date): string;

    abstract formatDateTime(date: Date): string;
}


export interface IsoFormatterOptions {
    /**
     * used for parsing when time zone is missing in input data
     */
    defaultTimeZone?: string|null
}


export class IsoFormatter extends DateTimeFormatter {

    static readonly TZ_REGEXP = /[+\-]\d{2}:\d{2}$/;

    readonly defaultTimeZone?: string|null;

    constructor(options?: IsoFormatterOptions) {
        super();
        options = options || {defaultTimeZone: "Z"};
        if (options.defaultTimeZone !== undefined) {
            this.defaultTimeZone = options.defaultTimeZone;
        }
    }

    formatDate(date: Date): string {
        return date.toISOString().split("T")[0];
    }

    formatDateTime(date: Date): string {
        return date.toISOString();
    }

    formatTime(date: Date): string {
        return date.toISOString().split("T")[1];
    }

    parseDate(inp: string): Date {
        return new Date(inp);
    }

    parseDateTime(inp: string): Date {
        inp = this.prepareTimeInput(inp);
        return new Date(inp);
    }

    parseTime(inp: string): Date {
        inp = this.prepareTimeInput(inp);
        const fullInput = `${(new Date()).toISOString().split("T")[0]}T${inp}`;
        return new Date(fullInput);
    }

    private prepareTimeInput(inp: string): string {
        const tz = IsoFormatter.hasTimeZone(inp);
        if (tz === false && this.defaultTimeZone !== null) {
            inp += this.defaultTimeZone;
        }
        return inp;
    }

    private static hasTimeZone(inp: string): boolean {
        let lastChar: string;
        try {
            lastChar = inp[inp.length - 1].toUpperCase();
        } catch (err) {
            return false;
        }
        return lastChar === "Z" || IsoFormatter.TZ_REGEXP.exec(inp) !== null;
    }
}
