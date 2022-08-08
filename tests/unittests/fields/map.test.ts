import {Int, Map_, Str} from "../../../lib";

describe("the dict field", () => {
    let field: Map_;

    ([
        ["when name is null", () => new Map_(null, new Str(null), new Int(null))],
        ["when name is set", () => new Map_(null, new Str(null), new Int(null))],
        ["when name is omitted", () => new Map_(null, new Str(null), new Int(null))],
    ] as [string, () => Map_][]).forEach(([name, factory]) => {
        describe(name, () => {
            beforeEach(() => {
                field = factory();
            });
            it("should load data", () => {
                const data = {foo: 11, bar: 12};
                const expectedData = new Map([["foo", 11], ["bar", 12]]);
                expect(field.load(data)).toEqual(expectedData);
                expect(field.load(data)).not.toBe(data);
            });

            it("should dump data", () => {
                const data = new Map([["foo", 11], ["bar", 12]]);
                const expectedData = {foo: 11, bar: 12};
                expect(field.dump(data)).toEqual(expectedData);
                expect(field.dump(data)).not.toBe(data);
            });
        });
    });
});
