
import { AbstractSchema } from "../src/schema"
import * as Fields from "../src/fields"


export class UserSchema extends AbstractSchema
{
    createFields()
    {
        let fields: Fields.AbstractField[] = [];

        fields.push(new Fields.Int(
            "id", {
                remoteName: "my_id",
                required: true,
                nullable: false
            }
        ));
        fields.push(new Fields.Str(
            "my_name",
            {
                required: true,
                defaultValue: "John Doe"
            }
        ));
        fields.push(new Fields.Str(
            "password",
            {
                loadOnly: true,
            }
        ));
        fields.push(new Fields.DateTime(
            "created_at",
            {
                dumpOnly: true,
                required: true,
                nullable: false
            }
        ));

        return fields
    }
}


// fields can be defined in inline property
class MessageSchema extends AbstractSchema
{
    fields = [
        new Fields.Int("id", {required: true}),
        new Fields.Str("subject", {required: true}),
        new Fields.Str("body", {defaultValue: null}),
        new Fields.Nested("user", new UserSchema()),
        new Fields.List("recipients", new Fields.Str(""))
    ]
}


let schema = new MessageSchema();

let dumpData = {id: 1, subject: "hi!", user: {id: 1, created_at: new Date(), password: "my-secret-password"}, recipients: ["Alice", "Bob", "Žitomír"]};

// 'my_id' is renamed to 'id', 'password' is ignored and 'my_name' is set to 'John Doe'
console.log("DUMPING DATA");
console.log(schema.dump(dumpData));

let loadData = {id: 2, subject: "hello!", body: "good bye!",user: {my_id: 6, created_at: new Date(), password: "my-secret-password", my_name: "Mr. Dead"}, recipients: ["Alice", "Bob", "Žitomír"]};
console.log("LOADING DATA");
console.log(schema.load(loadData));
