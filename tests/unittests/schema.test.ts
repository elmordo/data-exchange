import {AbstractSchema, Int, Str} from "../../lib";


describe("schema", () => {

    class RemoteObject {
        id_item: number;
        name: string;
    }

    class LocalObject {
        id: number;
        name: string;
    }

    class Schema extends AbstractSchema<LocalObject> {
        fields = [
            new Int("id", {required: true, remoteName: "id_item"}),
            new Str("name")
        ]
        createObject(): LocalObject {
            return new LocalObject();
        }
    }

    let schema: Schema;

    beforeEach(() => {
        schema = new Schema();
    })

    it("load", () => {
        const response = schema.load({"id_item": 50, "name": "foo"});
        expect(response.id).toBe(50);
        expect(response.name).toBe("foo");
    });

    describe("with skipIfUndefined settings", () => {
        describe("set to true (default)", () => {
            class MySchema extends AbstractSchema<unknown> {
                fields = [
                    new Int("id", {required: false, skipIfUndefined: true})
                ];
            }

            let schema: MySchema;

            beforeEach(() => {
                schema = new MySchema();
            });

            it("should skip undefined values when dump", () => {
                expect(schema.dump({})).toEqual({});
            });
            it("should skip undefined values when load", () => {
                expect(schema.load({})).toEqual({});
            })
        });
        describe("set to false (default)", () => {
            class MySchema extends AbstractSchema<unknown> {
                fields = [
                    new Int("id", {required: false, skipIfUndefined: false})
                ];
            }
            let schema: MySchema;
            beforeEach(() => {
                schema = new MySchema();
            });

            it("should skip undefined values when dump", () => {
                expect(schema.dump({})).toEqual({id: undefined});
            });
            it("should skip undefined values when load", () => {
                expect(schema.load({})).toEqual({id: undefined});
            });
        });
    });

    describe("should be configured with skipIfUndefined", () => {
        let params = [
            {settings: true, expectedDump: {}, expectedLoad: {}},
            {settings: false, expectedDump: {id: undefined}, expectedLoad: {id: undefined}},
            {settings: {whenDump: true, whenLoad: true}, expectedDump: {}, expectedLoad: {}},
            {settings: {whenDump: false, whenLoad: false}, expectedDump: {id: undefined}, expectedLoad: {id: undefined}},
            {settings: {whenDump: true, whenLoad: false}, expectedDump: {}, expectedLoad: {id: undefined}},
            {settings: {whenDump: false, whenLoad: true}, expectedDump: {id: undefined}, expectedLoad: {}},
        ];

        params.forEach((p) => {
            class MySchema extends AbstractSchema<unknown> {
                fields = [
                    new Int("id", {required: false, skipIfUndefined: p.settings})
                ];
            }
            it("test settings", () => {
                let schema = new MySchema();
                expect(schema.dump({})).toEqual(p.expectedDump);
                expect(schema.load({})).toEqual(p.expectedLoad);
            });
        });
    });
})
