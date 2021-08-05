

export abstract class DateTimeFormat {
    abstract parseDate(inp: string): Date;

    abstract parseTime(inp: string): Date;

    abstract parseDateTime(inp: string): Date;

    abstract formatDate(date: Date): string;

    abstract formatTime(date: Date): string;

    abstract formatDateTime(date: Date): string;
}


export class IsoFormat extends DateTimeFormat {
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
        return new Date(inp);
    }

    parseTime(inp: string): Date {
        const fullInput = `${(new Date()).toISOString().split("T")[0]}T${inp}`;
        return new Date(fullInput);
    }
}
