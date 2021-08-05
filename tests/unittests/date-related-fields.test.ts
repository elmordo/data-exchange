import {Date_, DateTime, Time} from "../../lib";


describe("Date and time related fields", () => {
    describe("DateTime field", () => {
        let field: DateTime;
        beforeEach(() => {
            field = new DateTime("foo", {useUTC: false});
        });
        it("test load", () => {
            const result: Date = field.load("2021-08-05T15:17:29.871886Z");
            const expected = new Date("2021-08-05T15:17:29.871886Z");
            expect(result).toEqual(expected);
        });
        it("test dump", () => {
            const result = field.dump(new Date("2021-08-05T15:17:29.871886Z"));
            const expected = "2021-08-05T15:17:29.871886Z";
            expect(new Date(result)).toEqual(new Date(expected));
        });
    });
    describe("Date field", () => {
        let field: Date_
        beforeEach(() => {
            field = new Date_("date");
        });
        it("test load", () => {
            const result: Date = field.load("2021-01-05");
            expect(result.getFullYear()).toEqual(2021);
            expect(result.getMonth()).toEqual(0);
            expect(result.getDate()).toEqual(5);
        });
        it("test dump", () => {
            const result = field.dump(new Date("2021-08-05T15:17:29.871886Z"));
            const expected = "2021-08-05";
            expect(result).toEqual(expected);
        });
    });
    describe("Time field", () => {
        let field: Time;
        beforeEach(() => {
            field = new Time("time");
        });
        it("test load", () => {
            const result: Date = field.load("12:31:10.666");
            expect(result.getUTCHours()).toEqual(12)
            expect(result.getUTCMinutes()).toEqual(31)
            expect(result.getUTCSeconds()).toEqual(10)
            expect(result.getUTCMilliseconds()).toEqual(666)
        });
        it("test dump", () => {
            const result = field.dump(new Date("2021-08-05T15:17:29.800Z"));
            const expected = "15:17:29.800Z";
            expect(result).toEqual(expected);
        });
    });
});
