"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorReport = (function () {
    function ErrorReport(reason, code, type, field, data, schema) {
        this.reason = reason;
        this.code = code;
        this.type = type;
        this.field = field;
        this.data = data;
        this.schema = schema;
    }
    return ErrorReport;
}());
exports.ErrorReport = ErrorReport;
