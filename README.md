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
        new Int("id", {loadOnly: true, remoteName: "id_user", required: true}),
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

The `load` method has the second optional argument. It is target object where data is load into. If no
object is given, new empty object (by `createObject()` call) is created.
