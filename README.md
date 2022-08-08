data-exchange
=============

The main purpose of the library is to process data from transport format (e.g. simple object parsed from JSON) to typed JavaScript or TypeScript object and back.

Main features
-------------

* easy to use
* dumping data (convert local objects to remote ones)
* loading data (convert remote objects to local ones)
* nested schemas
* custom filters
* custom validation

Schemas
-------

Schemas are container for fields. There are two schema definition approach you can use.

### Extending the `AbstractSchema` class (legacy)

Base building block is schema with fields. There are two ways to define fields:

1. set `fields` property of the `AbstractSchema` class
2. override a `createFields()` method

The first way is suitable for most cases of use. The second one can be used to define more complex schema with custom cross field validators and/or some custom special logic in schema definition.

### Declarative approach (recommended)

From version `2.3` you can use the declarative approach to define your schemas.

Create object extending the `DeclarativeSchema` class and defined fields as its properties:

```typescript
class MyDeclarativeSchema extends DeclarativeSchema {
    id = new Int({required: true});
    name = new Str({required: true});
    description = new Str({required: true, nullable: false});
}


class MyOtherSchema extends MyDeclarativeSchema {
    ownerName = new Str({required: true, remoteName: "owner_name"})
}
```

The declarative schema is recommended because it is more intuitive and it can be easily extended by inheritance.

A field names are resolved by following algorithm:

* if `name` attribute is `null`, set it to property name (the `name` attribute can be set by explicit assign in constructor `attr = new Str("some_explicit_name", {...})`)
* if `remoteName` attribute is `null`, set it to property name
* if `localName` attribute is `null`, set it to property name

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
  * `Dict` - key value pairs stored in simple object.
  * `Map_` - key value pairs stored in the `Map` object.

Common fields constructor interface is

1. field name (can be omitted from version `2.3`)
2. required arguments (e.g. another schema instance for `Nested`)
3. object with optional settings

Settings values common for all built-in fields are:

* `required: boolean` - true if value cannot be undefined
* `nullable: boolean` - true if value can be null
* `defaultValue: unknown` - default value if value is undefined
* `localName: string` - name of attribute in local object (default is `name`)
* `remoteName: string` - name of attribute in remote object (default is `name`)
* `dumpOnly: boolean` - if true, field will not be loaded
* `loadOnly: boolean` - if true, field will not be dumped
* `filters: FilterSettings|FilterInterface[]` - list of filters
* `validators: ValidatorSettings|ValidatorInterface[]` - list of validators
* `skipIfUndefined: boolean|SkipIfUndefinedSettings` - if true (default) a property will not be included in a result 
   object if the value should be `undefined`
* ~~dumpName - legacy name for the localName~~
* ~~loadName - legacy name for the remoteName~~

For Date like fields:

* `formatter` - instance of the date formatter (default is `IsoFormatter` with UTC as default timezone)
* ~~useUTC - if true (default), UTC version of Date object's methods is used (e.g. setUTCHours)~~

Date and time formatters
------------------------

At this time, only ISO format is supported (the `IsoFormatter` class). 
Configuration object of the `IsoFormatter` has the following structure:

* `defaultTimeZone?: string|null` - time zone used for parsing when an input data has no timezone set. Default is `Z`
(e.g. `2021-02-03T12:31:01` -> `2021-02-03T12:31:01Z`).

Validation and filtration
-------------------------

Fields support validation and filtration of values. There is no validators or filters delivered with the library but 
custom validators and filters can be written by implementing `ValidatorInterface` and `FilterInterface`.

Order of the operations is:

1. Apply filters
2. Validate data
3. dump or load data

Important types
---------------

### DateTimeFormatter (interface)

* `parseDate(inp: string): Date` - parse date from string
* `parseTime(inp: string): Date` - parse time from string
* `parseDateTime(inp: string): Date` - parse date and time from string
* `formatDate(date: Date): string` - format date as string
* `formatTime(date: Date): string` - format time as string
* `formatDateTime(date: Date): string` - format date and time as string

### ValidatorInterface

* `validate(val: any, context?: any, result?: any, schema?: SchemaInterface) -> boolean` - return true if value is 
   valid, return false otherwise
* `getLastErrors() -> ErrorReportInterface[]` - get errors of the last validation

### FilterInterface

* `filter(val: any) -> any` - apply filtration to the `val` and return result

### SkipIfUndefinedSettings

* `whenLoad: boolean` - apply `skipIfUndefined` settings to `load()` method
* `whenDump: boolean` - apply `skipIfUndefined` settings to `dump()` method 

### FilterSettings

* `inFilters: FilterInterface[]` - filters applied in `load()` method
* `outFilters: FilterInterface[]` - filters applied in `dump()` method

### FilterSettings

* `inValidators: FilterInterface[]` - validators applied in `load()` method
* `outValidators: FilterInterface[]` - validators applied in `dump()` method

### ValidatorSettings

Examples
--------

Sample schema definition

```TypeScript
import { DeclarativeSchema, Int, Str, Date_, Nested, List } from "data-exchange"


class Ban
{
    reason: string;

    banned_at: Date;
}


class BanSchema extends DeclarativeSchema<Ban>
{
    reason = new Str({required: true});
    banne_at = new Date_({required: true});

    createObject(): Ban
    {
        return new Ban();
    }
}


class UserSchema extends DeclarativeSchema
{
    id = new Int({loadOnly: true, remoteName: "id_user", required: true});
    name = new Str({required: true})      // field cannot be undefined or NULL
    created_at = new DateTime({required: true, nullable: false}) // field cannot be undefined, but NULL is OK
    favorite_numbers = new List(new Int(null, {required: true}))  // list of integers
    allowed_actions = new Dict(new Str(null, {required: true}), new Bool(null, {required: true})) // the key is string and value is boolean
    some_mappoing = new Map_(new Date_(null, {required: true}), new Str(null, {required: true, nullable: true}))  // the key is Date object and value is string
    last_ban = new Nested(new BanSchema(), {required: true, nullable: false})
}


let data = {
    id_user: 1,
    name: "Karel Novak",
    created_at: "2019-09-03T07:01:30.073Z",
    favorite_numbers: [1, 13, 69],
    allowed_actions: {"action_1": true, "action_2": false},
    some_mapping: {"2021-09-09": "foo", "2021-09-10": "bar"},
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

The `load` method has the second optional argument. It is target object where data is load into. If no
object is given, new empty object (by `createObject()` call) is created.
