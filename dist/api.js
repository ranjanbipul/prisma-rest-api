"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaRestApi = exports.ModelApi = void 0;
var express_1 = __importDefault(require("express"));
var pagination_1 = require("./pagination");
var packErrors = function () {
    var messages = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        messages[_i] = arguments[_i];
    }
    return ({
        errors: messages.map(function (message) { return ({ message: message }); }),
    });
};
var ModelApi = /** @class */ (function () {
    function ModelApi(dbClient, resource, getAuthorize) {
        var _this = this;
        this.dbClient = dbClient;
        this.resource = resource;
        this.getAuthorize = getAuthorize;
        this.router = express_1.default.Router();
        this.isAccessAllowed = getAuthorize(this.resource.accessMap);
        this.router.get("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var clause, acsResult, page, filterResult, results, skip, take, orderBy, include, select, remain, count;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        clause = { where: {} };
                        return [4 /*yield*/, this.isAccessAllowed(req, this.resource.name, "LIST")];
                    case 1:
                        acsResult = _c.sent();
                        if (!acsResult.allowed) {
                            res.status(403).send("Unauthorized");
                            return [2 /*return*/];
                        }
                        if (acsResult.ownerOnly) {
                            if (!this.resource.ownerId || !req.userId) {
                                res.status(404).json(packErrors("Something went wrong"));
                                return [2 /*return*/];
                            }
                            else {
                                clause["where"] = Object.assign(clause["where"], (_a = {},
                                    _a[this.resource.ownerId] = req.userId,
                                    _a));
                            }
                        }
                        page = { _limit: 10, _offset: 0 };
                        if (this.resource.pagination && !req.query.id) {
                            page = (0, pagination_1.getPageQuery)(req, this.resource.pagination);
                            clause.skip = page._offset;
                            clause.take = page._limit;
                        }
                        // Multiple id filter
                        if (Array.isArray(req.query.id)) {
                            clause["where"] = Object.assign({}, clause["where"], {
                                id: { in: req.query.id },
                            });
                        }
                        // Order By
                        if (req.query._sort) {
                            clause.orderBy = (_b = {},
                                _b[req.query._sort] = req.query._order
                                    ? req.query._order.toLowerCase()
                                    : "asc",
                                _b);
                        }
                        // Filter
                        if (this.resource.filterSchema) {
                            filterResult = this.resource.filterSchema.validate(req.query, {
                                stripUnknown: { objects: true },
                            });
                            console.log("Filter schema", filterResult);
                            if (filterResult.error) {
                                res
                                    .status(400)
                                    .json({
                                    errors: filterResult.error.details.map(function (x) { return ({
                                        message: x.message,
                                        path: x.path,
                                    }); }),
                                });
                                return [2 /*return*/];
                            }
                            clause["where"] = __assign(__assign({}, filterResult.value), clause["where"]);
                        }
                        return [4 /*yield*/, this.dbClient.findMany(clause)];
                    case 2:
                        results = _c.sent();
                        if (!(this.resource.pagination && !req.query.id)) return [3 /*break*/, 4];
                        skip = clause.skip, take = clause.take, orderBy = clause.orderBy, include = clause.include, select = clause.select, remain = __rest(clause, ["skip", "take", "orderBy", "include", "select"]);
                        return [4 /*yield*/, this.dbClient.count(remain)];
                    case 3:
                        count = _c.sent();
                        res.send((0, pagination_1.generatePage)(req, results, count, page));
                        return [3 /*break*/, 5];
                    case 4:
                        res.send(results);
                        _c.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        this.router.post("/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var acsResult, data, validationResult, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isAccessAllowed(req, this.resource.name, "CREATE")];
                    case 1:
                        acsResult = _a.sent();
                        if (!acsResult.allowed) {
                            res.status(403).send("Unauthorized");
                            return [2 /*return*/];
                        }
                        data = req.body;
                        if (this.resource.createSchema) {
                            validationResult = this.resource.createSchema.validate(req.body);
                            if (validationResult.error) {
                                res
                                    .status(400)
                                    .json({
                                    errors: validationResult.error.details.map(function (x) { return ({
                                        message: x.message,
                                        path: x.path,
                                    }); }),
                                });
                                return [2 /*return*/];
                            }
                            data = validationResult.value;
                        }
                        if (acsResult.ownerOnly) {
                            if (!this.resource.ownerId || !req.userId) {
                                res.status(404).json(packErrors("Something went wrong"));
                                return [2 /*return*/];
                            }
                            else {
                                data[this.resource.ownerId] = req.userId;
                            }
                        }
                        if (this.resource.ownerId && !data[this.resource.ownerId] && req.userId) {
                            data[this.resource.ownerId] = req.userId;
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        if (!this.resource.calculateFields) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.resource.calculateFields(data)];
                    case 3:
                        data = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, this.dbClient.create({ data: data })];
                    case 5:
                        result = _a.sent();
                        if (!this.resource.postCreate) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.resource.postCreate(result)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        res.status(201).json(result);
                        return [3 /*break*/, 9];
                    case 8:
                        err_1 = _a.sent();
                        console.error("Create error", err_1);
                        res
                            .status(400)
                            .json(packErrors("Unable to create " + this.resource.name.toLowerCase() + ": " + err_1));
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); });
        var updateHandler = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var acsResult, data, validationResult, resource, result, err_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.isAccessAllowed(req, this.resource.name, "UPDATE")];
                    case 1:
                        acsResult = _c.sent();
                        if (!acsResult.allowed) {
                            res.status(403).send("Unauthorized");
                            return [2 /*return*/];
                        }
                        data = req.body;
                        if (this.resource.updateSchema) {
                            validationResult = this.resource.updateSchema.validate(req.body, {
                                stripUnknown: { objects: true },
                            });
                            if (validationResult.error) {
                                res
                                    .status(400)
                                    .json({
                                    errors: validationResult.error.details.map(function (x) { return ({
                                        message: x.message,
                                        path: x.path,
                                    }); }),
                                });
                                return [2 /*return*/];
                            }
                            data = validationResult.value;
                        }
                        return [4 /*yield*/, this.dbClient.findUnique({
                                where: (_a = {}, _a[this.resource.id] = req.params.id, _a),
                            })];
                    case 2:
                        resource = _c.sent();
                        if (!resource) {
                            res.status(404).json(packErrors("Resource does not exist"));
                            return [2 /*return*/];
                        }
                        if (acsResult.ownerOnly) {
                            if (!this.resource.ownerId || !req.userId) {
                                res.status(404).json(packErrors("Something went wrong"));
                                return [2 /*return*/];
                            }
                            else if (resource[this.resource.ownerId] !== req.userId) {
                                res.status(403).json(packErrors("Unauthorized"));
                            }
                        }
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 9, , 10]);
                        if (!this.resource.calculateUpdateFields) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.resource.calculateUpdateFields(resource, data)];
                    case 4:
                        data = _c.sent();
                        _c.label = 5;
                    case 5: return [4 /*yield*/, this.dbClient.update({
                            where: (_b = {}, _b[this.resource.id] = req.params.id, _b),
                            data: data,
                        })];
                    case 6:
                        result = _c.sent();
                        if (!this.resource.postUpdate) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.resource.postUpdate(resource, result)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        res.status(200).json(result);
                        return [3 /*break*/, 10];
                    case 9:
                        err_2 = _c.sent();
                        console.error("Create error", err_2);
                        res
                            .status(400)
                            .json(packErrors("Unable to update " + this.resource.name.toLowerCase() + ": " + err_2));
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
        this.router.put("/:id/", updateHandler);
        this.router.patch("/:id/", updateHandler);
        if (this.resource.performAction)
            this.router.post("/:id/:action/", this.resource.performAction);
        this.router.get("/:id/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var acsResult, schema, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.isAccessAllowed(req, this.resource.name, "READ")];
                    case 1:
                        acsResult = _b.sent();
                        if (!acsResult.allowed) {
                            res.status(403).send("Unauthorized");
                            return [2 /*return*/];
                        }
                        schema = (_a = {},
                            _a[this.resource.id] = req.params.id,
                            _a);
                        if (acsResult.ownerOnly) {
                            if (!this.resource.ownerId || !req.userId) {
                                res.status(403).send("Unauthorized");
                                return [2 /*return*/];
                            }
                            else {
                                schema[this.resource.ownerId] = req.userId;
                            }
                        }
                        return [4 /*yield*/, this.dbClient.findFirst({ where: schema })];
                    case 2:
                        result = _b.sent();
                        if (result)
                            res.json(result);
                        else
                            res
                                .status(404)
                                .json(packErrors(this.resource.name + " [" + req.params.id + "] does not exist"));
                        return [2 /*return*/];
                }
            });
        }); });
        this.router.delete("/:id/", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var acsResult, schema, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.isAccessAllowed(req, this.resource.name, "DELETE")];
                    case 1:
                        acsResult = _b.sent();
                        if (!acsResult.allowed) {
                            res.status(403).send("Unauthorized");
                            return [2 /*return*/];
                        }
                        schema = (_a = {},
                            _a[this.resource.id] = req.params.id,
                            _a);
                        if (acsResult.ownerOnly) {
                            if (!this.resource.ownerId || !req.userId) {
                                res.status(403).send("Unauthorized");
                                return [2 /*return*/];
                            }
                            else {
                                schema[this.resource.ownerId] = req.userId;
                            }
                        }
                        return [4 /*yield*/, this.dbClient.deleteMany({ where: schema })];
                    case 2:
                        result = _b.sent();
                        if (result.count)
                            res.json(result);
                        else
                            res
                                .status(404)
                                .json(packErrors(this.resource.name + " [" + req.params.id + "] does not exist"));
                        return [2 /*return*/];
                }
            });
        }); });
    }
    return ModelApi;
}());
exports.ModelApi = ModelApi;
function getPrismaRestApi(dbClient, resource, getAuthorize) {
    return new ModelApi(dbClient, resource, getAuthorize);
}
exports.getPrismaRestApi = getPrismaRestApi;
