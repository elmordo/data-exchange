import {DeclarativeSchema, Raw} from "../../../lib";

class RawFieldSchema extends DeclarativeSchema {
    field = new Raw()
}


describe("Raw field", () => {
    let schema: RawFieldSchema;
    beforeEach(() => {
        schema = new RawFieldSchema();
    });

    it("should not modify input when load", () => {
        const input = {
            field: {foo: "bar"}
        };
        const output = schema.load(input);
        expect(output.field).toBe(input.field);
    });

    it("should not modify input when dump", () => {
        const input = {
            field: {foo: "bar"}
        };
        const output = schema.dump(input);
        expect(output.field).toBe(input.field);
    });
});
