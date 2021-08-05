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
    })
})
