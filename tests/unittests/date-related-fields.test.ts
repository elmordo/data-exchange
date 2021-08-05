import {DateTime} from "../../lib";


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
    })
})
