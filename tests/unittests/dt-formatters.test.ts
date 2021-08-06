import {IsoFormatter} from "../../lib";


describe("iso formatter", () => {
    it("TZ regexp works for valid positive offset", () => {
        const result = IsoFormatter.TZ_REGEXP.exec("21:31+02:00");
        expect(result).not.toBeNull();
    });
    it("TZ regexp works for valid negative offset", () => {
        expect(IsoFormatter.TZ_REGEXP.exec("21:31-02:00")).not.toBeNull();
    });
    it("TZ regexp works for without TZ", () => {
        expect(IsoFormatter.TZ_REGEXP.exec("21:31")).toBeNull();
    });
})
