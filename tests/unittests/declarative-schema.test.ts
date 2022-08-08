import {DeclarativeSchema, Int, Str} from "../../lib";


class ParentSchema extends DeclarativeSchema {
    id = new Int({remoteName: "remoteId"});
    name = new Str({localName: "localName"});
}


class ChildSchema extends ParentSchema {
    description = new Str("myDescription");
}


describe("DeclarativeSchema", () => {
    it("should collect fields from properties", () => {
        const schema = new ChildSchema();
        const fieldNames = new Set(schema.getFields().map(f => f.name));
        expect(fieldNames).toEqual(new Set(["id", "name", "myDescription"]));
    });

    it("should load values", () => {
        const schema = new ChildSchema();
        const inputData = {remoteId: 1, name: "foo", myDescription: "bar"};
        const expectedData = {id: 1, localName: "foo", myDescription: "bar"};
        const result = schema.load(inputData);
        expect(result).toEqual(expectedData);
        expect(result).not.toBe(inputData);
    });

    it("should dump value", () => {
        const schema = new ChildSchema();
        const inputData = {id: 1, localName: "foo", myDescription: "bar"};
        const expectedData = {remoteId: 1, name: "foo", myDescription: "bar"};
        const result = schema.dump(inputData);
        expect(result).toEqual(expectedData);
        expect(result).not.toBe(inputData);
    });
});
