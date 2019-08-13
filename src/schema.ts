
import { SchemaInterface, FieldInterface } from "./interfaces"
import { ErrorReport } from "./errors"


export abstract class AbstractSchema implements SchemaInterface
{
    protected fields: FieldInterface[];

    private errors: ErrorReport[];

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

    reset(): void
    {
        this.errors = [];
    }

    hasErrors(): boolean
    {
        return !!this.errors.length;
    }

    getErrors(): ErrorReport[]
    {
        return this.errors;
    }

    createFields(): FieldInterface[]
    {
        return [];
    }

    createObject(): Object
    {
        return {};
    }

    private getFields(): FieldInterface[]
    {
        if (this.fields === undefined)
            this.fields = this.createFields();

        return this.fields;
    }
}
