"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var acs_1 = require("./acs");
var api_1 = require("./api");
var PrimsaRestApi = /** @class */ (function () {
    function PrimsaRestApi(getRolePermissions) {
        this.getRolePermissions = getRolePermissions;
        this.getAuthorize = (0, acs_1.initializeAuthorization)(this.getRolePermissions);
    }
    PrimsaRestApi.prototype.get = function (dbClient, resource) {
        return (0, api_1.getPrismaRestApi)(dbClient, resource, this.getAuthorize);
    };
    return PrimsaRestApi;
}());
exports.default = PrimsaRestApi;
