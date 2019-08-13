"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractField = (function () {
    function AbstractField(options) {
        this.required = false;
        this.nullable = true;
        this.dumpOnly = false;
        this.loadOnly = false;
        if (!options.dumpName)
            options.dumpName = options.name;
        if (!options.loadName)
            options.loadName = options.name;
        this.name = options.name;
        this.dumpName = options.dumpName;
        this.loadName = options.loadName;
        if (options.required !== undefined)
            this.required = options.required;
        if (options.nullable !== undefined)
            this.nullable = options.nullable;
        if (options.defaultValue !== undefined)
            this.defaultValue = false;
        if (options.dumpOnly !== undefined)
            this.dumpOnly = options.dumpOnly;
        if (options.loadOnly !== undefined)
            this.loadOnly = options.loadOnly;
    }
    return AbstractField;
}());
exports.AbstractField = AbstractField;
var FieldBase = (function (_super) {
    __extends(FieldBase, _super);
    function FieldBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FieldBase.prototype.dump = function (val) {
        if (this.loadOnly)
            throw new Error("This field is load only");
        val = this.resolveMissingAndNull(val);
        if (val !== null)
            val = this.dumpValue(val);
        return val;
    };
    FieldBase.prototype.load = function (val) {
        if (this.dumpOnly)
            throw new Error("This field is dump only");
        val = this.resolveMissingAndNull(val);
        if (val !== null)
            val = this.loadValue(val);
        return val;
    };
    FieldBase.prototype.resolveMissingAndNull = function (val) {
        this.resolveIsMissing(val);
        this.resolveIsNull(val);
    };
    FieldBase.prototype.resolveIsMissing = function (val) {
        if (this.required && val === undefined) {
            if (this.defaultValue === undefined)
                throw new Error("Value is missing");
            val = this.defaultValue;
        }
        return val;
    };
    FieldBase.prototype.resolveIsNull = function (val) {
        if (val === null && !this.nullable)
            throw new Error("Value is NULL");
        return val;
    };
    return FieldBase;
}(AbstractField));
exports.FieldBase = FieldBase;
var StringField = (function (_super) {
    __extends(StringField, _super);
    function StringField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StringField.prototype.dumpValue = function (val) {
        return val.toString();
    };
    StringField.prototype.loadValue = function (val) {
        return val.toString();
    };
    return StringField;
}(FieldBase));
exports.StringField = StringField;
var NumberField = (function (_super) {
    __extends(NumberField, _super);
    function NumberField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberField.prototype.dumpValue = function (val) {
        var result = Number(val);
        if (isNaN(result))
            throw new Error("Invalid field input");
        return result;
    };
    NumberField.prototype.loadValue = function (val) {
        var result = Number(val);
        if (isNaN(result))
            throw new Error("Invalid field input");
        return result;
    };
    return NumberField;
}(FieldBase));
exports.NumberField = NumberField;
var IntField = (function (_super) {
    __extends(IntField, _super);
    function IntField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IntField.prototype.dumpValue = function (val) {
        return val;
    };
    IntField.prototype.loadValue = function (val) {
        var result = Number(val);
        if (isNaN(result))
            throw new Error("Invalid field input");
        return Math.floor(result);
    };
    return IntField;
}(NumberField));
exports.IntField = IntField;
var DateFieldBase = (function (_super) {
    __extends(DateFieldBase, _super);
    function DateFieldBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFieldBase.prototype.loadValue = function (val) {
        var result = new Date();
        var parsedData = this.parseData(val);
        this.applyParsedData(parsedData, result);
        return result;
    };
    DateFieldBase.prototype.parseData = function (val) {
        var pattern = this.getPattern();
        var result = pattern.exec(val);
        if (result === null)
            throw new Error("Invalid date format");
        return this.processParsedData(result);
    };
    return DateFieldBase;
}(FieldBase));
exports.DateFieldBase = DateFieldBase;
var DateField = (function (_super) {
    __extends(DateField, _super);
    function DateField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateField.prototype.dumpValue = function (val) {
        return val.toISOString().split("T")[0];
    };
    DateField.prototype.processParsedData = function (data) {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3])
        };
    };
    DateField.prototype.getPattern = function () {
        return DateField.PARSE_PATTERN;
    };
    DateField.prototype.applyParsedData = function (data, target) {
        target.setUTCFullYear(data.year);
        target.setUTCMonth(data.month);
        target.setUTCDate(data.day);
    };
    DateField.PARSE_PATTERN = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
    return DateField;
}(DateFieldBase));
exports.DateField = DateField;
var TimeField = (function (_super) {
    __extends(TimeField, _super);
    function TimeField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeField.prototype.dumpValue = function (val) {
        return val.toISOString().split("T")[1];
    };
    TimeField.prototype.processParsedData = function (data) {
        if (data[4] === undefined)
            data[4] = "0";
        if (data[6] === undefined)
            data[6] = "0";
        return {
            hour: Number(data[1]),
            minute: Number(data[2]),
            second: Number(data[4]),
            millisecond: Number(data[6])
        };
    };
    TimeField.prototype.applyParsedData = function (parsedData, targetDate) {
        targetDate.setUTCHours(parsedData.hour, parsedData.minute, parsedData.second, parsedData.millisecond);
    };
    TimeField.prototype.getPattern = function () {
        return TimeField.PARSE_PATTERN;
    };
    TimeField.PARSE_PATTERN = /^([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]{1,3}))?)?$/;
    return TimeField;
}(DateFieldBase));
exports.TimeField = TimeField;
var DateTimeField = (function (_super) {
    __extends(DateTimeField, _super);
    function DateTimeField() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateTimeField.prototype.dumpValue = function (val) {
        return val.toISOString();
    };
    DateTimeField.prototype.getPattern = function () {
        return DateTimeField.PARSE_PATTERN;
    };
    DateTimeField.prototype.processParsedData = function (data) {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3]),
            hour: Number(data[4]),
            minute: Number(data[5]),
            second: Number(data[6]),
            millisecond: (data[8] === undefined) ? 0 : Number(data[8])
        };
    };
    DateTimeField.prototype.applyParsedData = function (data, date) {
        date.setUTCFullYear(data.year);
        date.setUTCMonth(data.month);
        date.setUTCDate(data.day);
        date.setUTCHours(data.hour, data.minute, data.second, data.millisecond);
    };
    DateTimeField.PARSE_PATTERN = /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(.([0-9]{1,3}))?Z/;
    return DateTimeField;
}(DateFieldBase));
exports.DateTimeField = DateTimeField;
