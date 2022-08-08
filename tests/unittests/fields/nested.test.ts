import {AbstractSchema, Int, Nested} from "../../../lib";

class NestedSchema extends AbstractSchema {
    fields = [
        new Int("id")
    ]
}


describe("the dict field", () => {

    let field: Nested;

    ([
        ["when name is null", () => new Nested(null, new NestedSchema())],
        ["when name is set", () => new Nested("my list", new NestedSchema())],
        ["when name is omitted", () => new Nested(new NestedSchema())],
    ] as [string, () => Nested][]).forEach(([name, factory]) => {
        describe(name, () => {
            beforeEach(() => {
                field = factory();
            });
            it("should load data", () => {
                const data = {id: 1};
                const expectedData ={id: 1};
                expect(field.load(data)).toEqual(expectedData);
                expect(field.load(data)).not.toBe(data);
            });

            it("should dump data", () => {
                const data = {id: 1};
                const expectedData ={id: 1};
                expect(field.dump(data)).toEqual(expectedData);
                expect(field.dump(data)).not.toBe(data);
            });
        });
    });
});
