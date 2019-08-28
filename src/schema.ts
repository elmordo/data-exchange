
import { SchemaInterface, FieldInterface } from "./interfaces"
import { ErrorReport } from "./errors"


/**
 * common schema
 *
 * There is two ways to define a schema:
 * 1. intiialize fields property inline (should be enough for most cases)
 * 2. define list of fields in createFields() method. This method is usable in cases with
 *     cross field validation, etc
 * @type {Object}
 */
export abstract class AbstractSchema implements SchemaInterface
{
    /**
     * list of fields
     * @type {FieldInterface[]}
     */
    protected fields: FieldInterface[];

    /**
     * error reports of the last validation
     * @type {ErrorReport[]}
     */
    private errors: ErrorReport[];

    /**
     * load data from raw JSON object, validate them and convert to the defined data format
     * @param  {Object} data raw data from source
     * @return {any}         converted and validated data
     */
    load(data: Object): any
    {
        this.reset();
        let result = this.createObject();
        let fields = this.getFields();

        fields.forEach(f =>
        {
            if (f.dumpOnly) return;

            let name = f.dumpName;
            let val = f.load(data[name], data, result, this);
            result[f.loadName] = val;
        });

        return result;
    }

    /**
     * validate data and convert them to the raw JSON object
     * @param  {any}    data data to be dumped
     * @return {Object}      raw JSON object
     */
    dump(data: any): Object
    {
        this.reset();
        let result = {};
        let fields = this.getFields();

        fields.forEach(f =>
        {
            if (f.loadOnly) return;

            let name = f.loadName;
            let val = f.dump(data[name], data, result, this);
            result[f.dumpName] = val;
        });

        return result;
    }

    /**
     * rest instance after validation
     * this method is called automaticaly when load or dump method is called
     */
    reset(): void
    {
        this.errors = [];
    }

    /**
     * test some error presence
     * @return {boolean} true if there is one error at least
     */
    hasErrors(): boolean
    {
        return !!this.errors.length;
    }

    /**
     * get list of errors produced in last dump or load method call
     * @return {ErrorReport[]} list of errors
     */
    getErrors(): ErrorReport[]
    {
        return this.errors;
    }

    /**
     * create list of fields (usable when there is more complex validation requried)
     * @return {FieldInterface[]} list of fields
     */
    createFields(): FieldInterface[]
    {
        return [];
    }

    /**
     * create an output object instance
     * @return {Object} Any object
     */
    createObject(): Object
    {
        return {};
    }

    /**
     * get fields from property. If there is no fields stored in property, craete new fields
     * by createFields() method, store them into the property and return them.
     *
     * @return {FieldInterface[]} list of fields
     */
    private getFields(): FieldInterface[]
    {
        if (this.fields === undefined)
            this.fields = this.createFields();

        return this.fields;
    }
}
