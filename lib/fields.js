"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = exports.Nested = exports.ComplexFieldBase = exports.DateTime = exports.Time = exports.Date_ = exports.DateBase = exports.Bool = exports.Int = exports.Numeric = exports.Str = exports.CommonBase = exports.AbstractField = exports.Base = void 0;
var Base = (function () {
    function Base(name, options) {
        this.dumpOnly = false;
        this.loadOnly = false;
        options = this.prepareOptions(options);
        if (!options.dumpName)
            options.dumpName = name;
        if (!options.loadName)
            options.loadName = name;
        this.name = name;
        this.localName = options.dumpName;
        this.remoteName = options.loadName;
        if (options.dumpOnly !== undefined)
            this.dumpOnly = options.dumpOnly;
        if (options.loadOnly !== undefined)
            this.loadOnly = options.loadOnly;
        this.filters = this.createFilterSettings(options);
        this.validators = this.createValidatorSettings(options);
    }
    Base.prototype.prepareOptions = function (options) {
        return options ? options : {};
    };
    Base.prototype.applyFilters = function (val, filters) {
        return filters.reduce(function (v, f) { return f.filter(v); }, val);
    };
    Base.prototype.applyValidators = function (val, context, result, schema, validators) {
        var isValid = validators.reduce(function (valid, f) { return valid && f.validate(val, context, result, schema); }, true);
        if (!isValid)
            throw new Error("Invalid value '" + val.toString() + "' in field '" + this.name + "'");
    };
    Base.prototype.createFilterSettings = function (options) {
        var filters = options.filters;
        if (!filters)
            return { inFilters: [], outFilters: [] };
        if (filters instanceof Array)
            return { inFilters: filters, outFilters: filters.slice().reverse() };
        else
            return filters;
    };
    Base.prototype.createValidatorSettings = function (options) {
        var validators = options.validators;
        if (!validators)
            return { inValidators: [], outValidators: [] };
        if (validators instanceof Array)
            return { inValidators: validators, outValidators: validators };
        else
            return validators;
    };
    return Base;
}());
exports.Base = Base;
var AbstractField = (function (_super) {
    __extends(AbstractField, _super);
    function AbstractField(name, options) {
        var _this = _super.call(this, name, options) || this;
        _this.required = false;
        _this.nullable = true;
        options = _this.prepareOptions(options);
        if (options.required !== undefined && options.nullable === undefined)
            options.nullable = !options.required;
        if (options.required !== undefined)
            _this.required = options.required;
        if (options.nullable !== undefined)
            _this.nullable = options.nullable;
        if (options.defaultValue !== undefined)
            _this.defaultValue = options.defaultValue;
        return _this;
    }
    AbstractField.prototype.resolveMissingAndNull = function (val) {
        val = this.resolveIsMissing(val);
        return this.resolveIsNull(val);
    };
    AbstractField.prototype.resolveIsMissing = function (val) {
        if (val === undefined) {
            if (this.required && this.defaultValue === undefined)
                throw new Error("Value " + this.name + " is missing");
            val = this.defaultValue;
        }
        return val;
    };
    AbstractField.prototype.resolveIsNull = function (val) {
        if (val === null && !this.nullable)
            throw new Error("Value '" + this.name + "' is NULL");
        return val;
    };
    return AbstractField;
}(Base));
exports.AbstractField = AbstractField;
var CommonBase = (function (_super) {
    __extends(CommonBase, _super);
    function CommonBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CommonBase.prototype.dump = function (val, context, result, schema) {
        if (this.loadOnly)
            throw new Error("This field is load only");
        val = this.applyFilters(val, this.filters.outFilters);
        val = this.resolveMissingAndNull(val);
        this.applyValidators(val, context, result, schema, this.validators.outValidators);
        if (val !== null && val !== undefined)
            val = this.dumpValue(val);
        return val;
    };
    CommonBase.prototype.load = function (val, context, result, schema) {
        if (this.dumpOnly)
            throw new Error("This field is dump only");
        val = this.applyFilters(val, this.filters.inFilters);
        val = this.resolveMissingAndNull(val);
        this.applyValidators(val, context, result, schema, this.validators.outValidators);
        if (val !== null && val !== undefined)
            val = this.loadValue(val);
        return val;
    };
    return CommonBase;
}(AbstractField));
exports.CommonBase = CommonBase;
var Str = (function (_super) {
    __extends(Str, _super);
    function Str() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Str.prototype.dumpValue = function (val) {
        return val.toString();
    };
    Str.prototype.loadValue = function (val) {
        return val.toString();
    };
    return Str;
}(CommonBase));
exports.Str = Str;
var Numeric = (function (_super) {
    __extends(Numeric, _super);
    function Numeric() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Numeric.prototype.dumpValue = function (val) {
        var result = Number(val);
        if (isNaN(result))
            throw new Error("Invalid field input");
        return result;
    };
    Numeric.prototype.loadValue = function (val) {
        var result = Number(val);
        if (isNaN(result))
            throw new Error("Invalid field input");
        return result;
    };
    return Numeric;
}(CommonBase));
exports.Numeric = Numeric;
var Int = (function (_super) {
    __extends(Int, _super);
    function Int() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Int.prototype.dumpValue = function (val) {
        return Math.floor(val);
    };
    Int.prototype.loadValue = function (val) {
        var result = Number(val);
        if (isNaN(result))
            throw new Error("Invalid field input");
        return Math.floor(result);
    };
    return Int;
}(Numeric));
exports.Int = Int;
var Bool = (function (_super) {
    __extends(Bool, _super);
    function Bool() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Bool.prototype.dumpValue = function (val) {
        return !!val;
    };
    Bool.prototype.loadValue = function (val) {
        return !!val;
    };
    return Bool;
}(CommonBase));
exports.Bool = Bool;
var DateBase = (function (_super) {
    __extends(DateBase, _super);
    function DateBase(name, options) {
        var _this = _super.call(this, name, options) || this;
        _this.useUTC = true;
        options = _this.prepareOptions(options);
        if (options.useUTC !== undefined)
            _this.useUTC = options.useUTC;
        return _this;
    }
    DateBase.prototype.loadValue = function (val) {
        var result = new Date();
        var parsedData = this.parseData(val);
        this.applyParsedData(parsedData, result);
        return result;
    };
    DateBase.prototype.parseData = function (val) {
        var pattern = this.getPattern();
        var result = pattern.exec(val);
        if (result === null)
            throw new Error("Invalid date format in field '" + this.name + "'");
        return this.processParsedData(result);
    };
    return DateBase;
}(CommonBase));
exports.DateBase = DateBase;
var Date_ = (function (_super) {
    __extends(Date_, _super);
    function Date_() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Date_.prototype.dumpValue = function (val) {
        return val.toISOString().split("T")[0];
    };
    Date_.prototype.processParsedData = function (data) {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3])
        };
    };
    Date_.prototype.getPattern = function () {
        return Date_.PARSE_PATTERN;
    };
    Date_.prototype.applyParsedData = function (data, target) {
        if (this.useUTC) {
            target.setUTCFullYear(data.year);
            target.setUTCMonth(data.month);
            target.setUTCDate(data.day);
        }
        else {
            target.setFullYear(data.year);
            target.setMonth(data.month);
            target.setDate(data.day);
        }
    };
    Date_.PARSE_PATTERN_STR = "([0-9]{4})-([0-9]{2})-([0-9]{2})";
    Date_.PARSE_PATTERN = new RegExp("^" + Date_.PARSE_PATTERN_STR + "$");
    return Date_;
}(DateBase));
exports.Date_ = Date_;
var Time = (function (_super) {
    __extends(Time, _super);
    function Time() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Time.prototype.dumpValue = function (val) {
        return val.toISOString().split("T")[1];
    };
    Time.prototype.processParsedData = function (data) {
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
    Time.prototype.applyParsedData = function (parsedData, targetDate) {
        if (this.useUTC) {
            targetDate.setUTCHours(parsedData.hour, parsedData.minute, parsedData.second, parsedData.millisecond);
        }
        else {
            targetDate.setHours(parsedData.hour, parsedData.minute, parsedData.second, parsedData.millisecond);
        }
    };
    Time.prototype.getPattern = function () {
        return Time.PARSE_PATTERN;
    };
    Time.PARSE_PATTERN_STR = "([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|([\+\-])([0-9]{2}):([0-9]{2}))?";
    Time.PARSE_PATTERN = new RegExp("^" + Time.PARSE_PATTERN_STR + "$");
    return Time;
}(DateBase));
exports.Time = Time;
var DateTime = (function (_super) {
    __extends(DateTime, _super);
    function DateTime() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateTime.prototype.dumpValue = function (val) {
        return val.toISOString();
    };
    DateTime.prototype.getPattern = function () {
        return DateTime.PARSE_PATTERN;
    };
    DateTime.prototype.processParsedData = function (data) {
        return {
            year: Number(data[1]),
            month: Number(data[2]) - 1,
            day: Number(data[3]),
            hour: Number(data[4]),
            minute: Number(data[5]),
            second: Number(data[7]),
            millisecond: (data[9] === undefined) ? 0 : Number(data[9])
        };
    };
    DateTime.prototype.applyParsedData = function (data, date) {
        if (this.useUTC) {
            date.setUTCFullYear(data.year);
            date.setUTCMonth(data.month);
            date.setUTCDate(data.day);
            date.setUTCHours(data.hour, data.minute, data.second, data.millisecond);
        }
        else {
            date.setFullYear(data.year);
            date.setMonth(data.month);
            date.setDate(data.day);
            date.setHours(data.hour, data.minute, data.second, data.millisecond);
        }
    };
    DateTime.PARSE_PATTERN_STR = Date_.PARSE_PATTERN_STR + "T" + Time.PARSE_PATTERN_STR;
    DateTime.PARSE_PATTERN = new RegExp("^" + DateTime.PARSE_PATTERN_STR + "$");
    return DateTime;
}(DateBase));
exports.DateTime = DateTime;
var ComplexFieldBase = (function (_super) {
    __extends(ComplexFieldBase, _super);
    function ComplexFieldBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ComplexFieldBase;
}(AbstractField));
exports.ComplexFieldBase = ComplexFieldBase;
var Nested = (function (_super) {
    __extends(Nested, _super);
    function Nested(name, schema, options) {
        var _this = _super.call(this, name, options) || this;
        options = _this.prepareOptions(options);
        _this.schema = schema;
        return _this;
    }
    Nested.prototype.dump = function (val) {
        this.resolveMissingAndNull(val);
        if (!val)
            return val;
        return this.schema.dump(val);
    };
    Nested.prototype.load = function (val) {
        this.resolveMissingAndNull(val);
        if (!val)
            return val;
        return this.schema.load(val);
    };
    return Nested;
}(ComplexFieldBase));
exports.Nested = Nested;
var List = (function (_super) {
    __extends(List, _super);
    function List(name, itemField, options) {
        var _this = _super.call(this, name, options) || this;
        options = _this.prepareOptions(options);
        _this.itemField = itemField;
        return _this;
    }
    List.prototype.load = function (val) {
        var _this = this;
        this.resolveMissingAndNull(val);
        if (!val)
            return val;
        return val.map(function (x) { return _this.itemField.load(x); });
    };
    List.prototype.dump = function (val) {
        var _this = this;
        this.resolveMissingAndNull(val);
        if (!val)
            return val;
        return val.map(function (x) { return _this.itemField.dump(x); });
    };
    List.prototype.resolveMissingAndNull = function (val) {
        _super.prototype.resolveMissingAndNull.call(this, val);
        if (val && !(val instanceof Array))
            throw new Error("Value must be instance of Array");
    };
    return List;
}(ComplexFieldBase));
exports.List = List;
