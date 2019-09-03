data-exchange
=============

The main purpose of the library is to process data from transport format (e.g. simple object parsed from JSON) to typed JavaScript or TypeScript object and back.

Main features
-------------

* simple to use
* nesting schemas
* custom filters
* custom validation

Schemas
-------

Base building block is schema with fields. There are two ways to define fields:

1. set `fields` property of the `AbstractSchema` class
2. override a `createFields()` method

The first way is suitable for most cases of use. The second one can be used to define more complex schema with custom cross field validators and/or some custom special logic in schema definition.

Fields
------

There are few types of fields delivered with the library.

* Primitive fields
  * `Str` - strings
  * `Numeric` - all numeric values
  * `Int` - integer subset of numeric values (if value is float, it is rouned)
  * `Bool` - logic value
* Date fields - fields with date and time values
  * `Date_` - only date (field class has underscore suffix to avoid name conflict with JS built-on Date type)
  * `Time` - only time
  * `DateTime` - both date and time
* Complex fields - fields containing fields
  * `Nested` - nested schema
  * `List` - list of items with same type.

Common fields constructor interface is

1. field name
2. required arguments (e.g. another schema instance for `Nested`)
3. object with optional settings

Settings values common for all built-in fields are:

* `required` - true if value cannot be undefined
* `nullable` - true if value can be null
* `defaultValue` - default value if value is undefined
* `dumpName` - name of attribute in dumped object (default is `name`)
* `loadName` - name of attribute in loaded object (default is `name`)
* `dumpOnly` - if true, field will not be loaded
* `loadOnly` - if true, field will not be dumped
* `filters` - list of filters
* `validators` - list of validators

For Date like fields:

* `useUTC` - if true (default), UTC version of Date object's methods is used (e.g. `setUTCHours`)

Validation and filtration
-------------------------

Fields support validation and filtration of values. There is no validators or filters delivered with the library but custom validators and filters can be written by implementing `ValidatorInterface` and `FilterInterface`.

Examples
--------

Sample schema definition

```TypeScript
import { AbstractSchema, Int, Str, Date_, Nested, List } from "data-exchange"


class Ban
{
    reason: string;

    banned_at: Date;
}


class BanSchema extends AbstractSchema<Ban>
{
    createFields()
    {
        return [
            new Str("reason", {required: true}),
            new Date_("banned_at", {required: true})
        ]
    }

    createObject(): Ban
    {
        return new Ban();
    }
}


class UserSchema extends AbstractSchema
{
    fields = [
        new Int("id", {loadOnly: true, loadName: "id_user", required: true}),
        new Str("name", {required: true}),      // field cannot be undefined or NULL
        new DateTime("created_at", {required: true, nullable: false}), // field cannot be undefined, but NULL is OK
        new List("favorite_numbers", new Int(null, {required: true})),
        new Nested("last_ban", new BanSchema(), {required: true, nullable: false})
    ]
}


let data = {
    id_user: 1,
    name: "Karel Novak",
    created_at: "2019-09-03T07:01:30.073Z",
    favorite_numbers: [1, 13, 69],
    last_ban: {
        reason: "multiple accounts",
        bannted_at: "2019-09-03T07:01:30.073Z"
    }
}


let schema = new UserSchema();
let item = schema.load(data);

let dumpedData = schema.dump(item);

```

For more information see docstrings in code or examples in "sample" directory.
