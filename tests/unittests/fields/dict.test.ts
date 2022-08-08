import {Dict, Int, Str} from "../../../lib";

describe("the dict field", () => {
    let field: Dict;

    ([
        ["when name is null", () => new Dict(null, new Str(null), new Int(null))],
        ["when name is set", () => new Dict(null, new Str(null), new Int(null))],
        ["when name is omitted", () => new Dict(null, new Str(null), new Int(null))],
    ] as [string, () => Dict][]).forEach(([name, factory]) => {
        describe(name, () => {
            beforeEach(() => {
                field = factory();
            });
            it("should load data", () => {
                const data = {foo: 11, bar: 12};
                const expectedData = {foo: 11, bar: 12};
                expect(field.load(data)).toEqual(expectedData);
                expect(field.load(data)).not.toBe(data);
            });

            it("should dump data", () => {
                const data = {foo: 11, bar: 12};
                const expectedData = {foo: 11, bar: 12};
                expect(field.dump(data)).toEqual(expectedData);
                expect(field.dump(data)).not.toBe(data);
            });
        });
    });
});
