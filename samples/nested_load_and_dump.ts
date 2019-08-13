
import { AbstractSchema } from "../src/schema"
import * as Fields from "../src/fields"


export class UserSchema extends AbstractSchema
{
    createFields()
    {
        let fields: Fields.AbstractField[] = [];

        fields.push(new Fields.Int({
            name: "id",
            loadName: "my_id",
            required: true,
            nullable: false
        }));
        fields.push(new Fields.Str({
            name: "my_name",
            required: true,
            defaultValue: "John Doe"
        }));
        fields.push(new Fields.Str({
            name: "password",
            loadOnly: true,
        }));
        fields.push(new Fields.DateTime({
            name: "created_at",
            dumpOnly: true,
            required: true,
            nullable: false
        }));

        return fields
    }
}


class MessageSchema extends AbstractSchema
{
    createFields()
    {
        return [
            new Fields.Int({name: "id", required: true}),
            new Fields.Str({name: "subject", required: true}),
            new Fields.Str({name: "body", defaultValue: null}),
            new Fields.NestedSchemaField({name: "user", schema: new UserSchema()})
        ]
    }
}


let schema = new MessageSchema();

let dumpData = {id: 1, subject: "hi!", user: {my_id: 1, created_at: new Date(), password: "my-secret-password"}};

// 'my_id' is renamed to 'id', 'password' is ignored and 'my_name' is set to 'John Doe'
console.log("DUMPING DATA");
console.log(schema.dump(dumpData));

let loadData = {id: 2, subject: "hello!", body: "good bye!",user: {id: 6, created_at: new Date(), password: "my-secret-password", my_name: "Mr. Dead"}};
console.log("LOADING DATA");
console.log(schema.load(loadData));
