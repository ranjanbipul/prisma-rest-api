import express from 'express';
import { URL } from 'url';

export interface Page {
  _limit: number;
  _offset: number;
};


export const generateUrlWithParams = (
  url: string,
  params: { [key: string]: string | number }
): string => {
  const uri = new URL(url);
  const searchParams = uri.searchParams;
  Object.keys(params).forEach((key) => {
    searchParams.set(key, "" + params[key]);
  });
  uri.search = searchParams.toString();
  return uri.toString();
};

export const getPageQuery = (
  req: express.Request,
  defaultSize = 10,
  maxSize = 100
): Page => {
  let _limit = parseInt(req.query._limit as string);
  let _offset = parseInt(req.query._offset as string);
  _limit =
    _limit && _limit >= 0
      ? _limit < maxSize
        ? _limit
        : maxSize
      : defaultSize;
  _offset = _offset && _offset >= 0 ? _offset : 0;
  return { _limit, _offset };
}

export const generatePage = (
  req: express.Request,
  results: any,
  count: number,
  { _limit, _offset }: Page
) => {
  return {
    count: count,
    results: results,
    next:
      _limit + _offset < count
        ? {
          _limit,
          _offset: _offset + _limit,
          url: generateUrlWithParams(
            `${req.protocol}://${req.get("host")}${req.originalUrl}`,
            {
              _limit,
              _offset: _offset - _limit,
            }
          ),
        }
        : undefined,
    prev:
      _offset > 0
        ? {
          _limit,
          _offset: _offset > _limit ? _offset - _limit : undefined,
          url: generateUrlWithParams(
            `${req.protocol}://${req.get("host")}${req.originalUrl}`,
            {
              _limit,
              _offset: _offset > _limit ? _offset - _limit : 0,
            }
          ),
        }
        : undefined,
  };
}
