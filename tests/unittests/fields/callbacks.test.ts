import {Callbacks, DeclarativeSchema} from "../../../lib";

class CallbacksSchema extends DeclarativeSchema {
    loadVal?: any;

    dumpVal?: any;

    field = new Callbacks(
        val => {
            this.loadVal = val;
            return "load";
        },
        val => {
            this.dumpVal = val;
            return "dump";
        }
    )
}

describe("Callbacks", () => {
    let schema: CallbacksSchema;
    beforeEach(() => {
        schema = new CallbacksSchema();
    });

    it("should call load callback on load", () => {
        const input = {field: "boo"}
        const output = schema.load(input);
        expect(output.field).toEqual("load");
        expect(schema.loadVal).toEqual(input.field);
    });
    it("should call dump callback on dump", () => {
        const input = {field: "boo"};
        const output = schema.dump(input);
        expect(output.field).toEqual("dump");
        expect(schema.dumpVal).toEqual(input.field);
    });
    describe("the constructor", () => {
        it("should correctly resolve params when explicit name is given", () => {
            const loadCallback = () => ({});
            const dumpCallback = () => ({});
            const instance = new Callbacks("foo", loadCallback, dumpCallback, {remoteName: "bar"});
            expect(instance.name).toEqual("foo");
            expect(instance.localName).toEqual("foo");
            expect(instance.remoteName).toEqual("bar");
            expect(instance.loadFn).toBe(loadCallback);
            expect(instance.dumpFn).toBe(dumpCallback);
        });
        it("should correctly resolve params when no explicit name is given", () => {
            const loadCallback = () => ({});
            const dumpCallback = () => ({});
            const instance = new Callbacks(loadCallback, dumpCallback, {remoteName: "bar"});

            expect(instance.name).toBeNull();
            expect(instance.localName).toBeNull();
            expect(instance.remoteName).toEqual("bar");
            expect(instance.loadFn).toBe(loadCallback);
            expect(instance.dumpFn).toBe(dumpCallback);
        });
    });
});
