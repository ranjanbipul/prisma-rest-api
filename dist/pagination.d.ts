import express from 'express';
export interface Page {
    _limit: number;
    _offset: number;
}
export declare const generateUrlWithParams: (url: string, params: {
    [key: string]: string | number;
}) => string;
export declare const getPageQuery: (req: express.Request, defaultSize?: number, maxSize?: number) => Page;
export declare const generatePage: (req: express.Request, results: any, count: number, { _limit, _offset }: Page) => {
    count: number;
    results: any;
    next: {
        _limit: number;
        _offset: number;
        url: string;
    } | undefined;
    prev: {
        _limit: number;
        _offset: number | undefined;
        url: string;
    } | undefined;
};
