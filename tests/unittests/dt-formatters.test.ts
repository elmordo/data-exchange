import {IsoFormatter} from "../../lib";


describe("iso formatter", () => {
    describe("Regular expression parsing the timezone", () => {
        it("works for valid positive offset", () => {
            const result = IsoFormatter.TZ_REGEXP.exec("21:31+02:00");
            expect(result).not.toBeNull();
        });
        it("works for valid negative offset", () => {
            expect(IsoFormatter.TZ_REGEXP.exec("21:31-02:00")).not.toBeNull();
        });
        it("works for without TZ", () => {
            expect(IsoFormatter.TZ_REGEXP.exec("21:31")).toBeNull();
        });
    })

    let formatter: IsoFormatter;

    beforeEach(() => {
        formatter = new IsoFormatter();
    })

    describe("parsing", () => {
        describe("datetime", () => {
            it("works for default offset", () => {
                const result = formatter.parseDateTime("2021-08-05T15:17:29.871886");
                const expected = new Date("2021-08-05T15:17:29.871886Z");
                expect(result).toEqual(expected);
            });
        });
    });
})
