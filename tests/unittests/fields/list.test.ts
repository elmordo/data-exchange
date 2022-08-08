import {Int, List} from "../../../lib";

describe("the dict field", () => {
    let field: List;

    ([
        ["when name is null", () => new List(null, new Int())],
        ["when name is set", () => new List("my list", new Int())],
        ["when name is omitted", () => new List(new Int())],
    ] as [string, () => List][]).forEach(([name, factory]) => {
        describe(name, () => {
            beforeEach(() => {
                field = factory();
            });
            it("should load data", () => {
                const data = [1, 2, 3];
                const expectedData =[1, 2, 3];
                expect(field.load(data)).toEqual(expectedData);
                expect(field.load(data)).not.toBe(data);
            });

            it("should dump data", () => {
                const data = [1, 2, 3];
                const expectedData =[1, 2, 3];
                expect(field.dump(data)).toEqual(expectedData);
                expect(field.dump(data)).not.toBe(data);
            });
        });
    });
});
