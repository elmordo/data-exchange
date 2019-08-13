
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


let schema = new UserSchema();
let dumpData = {my_id: 1, created_at: new Date(), password: "my-secret-password"};

// 'my_id' is renamed to 'id', 'password' is ignored and 'my_name' is set to 'John Doe'
console.log("DUMPING DATA");
console.log(schema.dump(dumpData));

let loadData = {id: 6, created_at: new Date(), password: "my-secret-password", my_name: "Mr. Dead"};
console.log("LOADING DATA");
console.log(schema.load(loadData));


let dumpDataInvalid = {created_at: new Date(), password: "my-secret-password"};

// 'my_id' is renamed to 'id', 'password' is ignored and 'my_name' is set to 'John Doe'
console.log("DUMPING INVALID DATA");

try
{
    console.log(schema.dump(dumpDataInvalid));
}
catch (err)
{
    console.log("Error was thrown - OK");
}

let loadDataInvalid = {created_at: new Date(), password: "my-secret-password", my_name: "Mr. Dead"};
console.log("LOADING INVALID DATA");

try
{
    console.log(schema.load(loadDataInvalid));
}
catch (err)
{
    console.log("Error was thrown - OK");
}
