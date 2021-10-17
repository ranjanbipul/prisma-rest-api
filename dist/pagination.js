"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePage = exports.getPageQuery = exports.generateUrlWithParams = void 0;
var url_1 = require("url");
;
var generateUrlWithParams = function (url, params) {
    var uri = new url_1.URL(url);
    var searchParams = uri.searchParams;
    Object.keys(params).forEach(function (key) {
        searchParams.set(key, "" + params[key]);
    });
    uri.search = searchParams.toString();
    return uri.toString();
};
exports.generateUrlWithParams = generateUrlWithParams;
var getPageQuery = function (req, defaultSize, maxSize) {
    if (defaultSize === void 0) { defaultSize = 10; }
    if (maxSize === void 0) { maxSize = 100; }
    var _limit = parseInt(req.query._limit);
    var _offset = parseInt(req.query._offset);
    _limit =
        _limit && _limit >= 0
            ? _limit < maxSize
                ? _limit
                : maxSize
            : defaultSize;
    _offset = _offset && _offset >= 0 ? _offset : 0;
    return { _limit: _limit, _offset: _offset };
};
exports.getPageQuery = getPageQuery;
var generatePage = function (req, results, count, _a) {
    var _limit = _a._limit, _offset = _a._offset;
    return {
        count: count,
        results: results,
        next: _limit + _offset < count
            ? {
                _limit: _limit,
                _offset: _offset + _limit,
                url: (0, exports.generateUrlWithParams)(req.protocol + "://" + req.get("host") + req.originalUrl, {
                    _limit: _limit,
                    _offset: _offset - _limit,
                }),
            }
            : undefined,
        prev: _offset > 0
            ? {
                _limit: _limit,
                _offset: _offset > _limit ? _offset - _limit : undefined,
                url: (0, exports.generateUrlWithParams)(req.protocol + "://" + req.get("host") + req.originalUrl, {
                    _limit: _limit,
                    _offset: _offset > _limit ? _offset - _limit : 0,
                }),
            }
            : undefined,
    };
};
exports.generatePage = generatePage;
