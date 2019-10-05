"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractSchema = (function () {
    function AbstractSchema() {
    }
    AbstractSchema.prototype.load = function (data, target) {
        var _this = this;
        this.reset();
        var result = target ? target : this.createObject();
        var fields = this.getFields();
        fields.forEach(function (f) {
            if (f.dumpOnly)
                return;
            var name = f.dumpName;
            var val = f.load(data[name], data, result, _this);
            result[f.loadName] = val;
        });
        return result;
    };
    AbstractSchema.prototype.dump = function (data) {
        var _this = this;
        this.reset();
        var result = {};
        var fields = this.getFields();
        fields.forEach(function (f) {
            if (f.loadOnly)
                return;
            var name = f.loadName;
            var val = f.dump(data[name], data, result, _this);
            result[f.dumpName] = val;
        });
        return result;
    };
    AbstractSchema.prototype.reset = function () {
        this.errors = [];
    };
    AbstractSchema.prototype.hasErrors = function () {
        return !!this.errors.length;
    };
    AbstractSchema.prototype.getErrors = function () {
        return this.errors;
    };
    AbstractSchema.prototype.createFields = function () {
        return [];
    };
    AbstractSchema.prototype.createObject = function () {
        return {};
    };
    AbstractSchema.prototype.getFields = function () {
        if (this.fields === undefined)
            this.fields = this.createFields();
        return this.fields;
    };
    return AbstractSchema;
}());
exports.AbstractSchema = AbstractSchema;
