import Joi from "joi";
import { AccessMatrix, fnAuthorize, fnGetAuthorize } from "./acs";
import { Delegate } from "./db";
import { Request, Response, Router } from "express";
declare global {
    namespace Express {
        interface Request {
            userId?: string | null;
            roles?: string[];
        }
    }
}
declare type StringProps<T> = {
    [K in keyof T]: T[K] extends string | null ? K : never;
}[keyof T];
export interface Resource<T extends Record<string, unknown>, UniqueInput extends Partial<T>, CreateInput, UpdateInput> {
    name: string;
    id: keyof UniqueInput;
    pagination?: number;
    ownerId?: StringProps<T>;
    accessMap: AccessMatrix;
    createSchema?: Joi.ObjectSchema;
    updateSchema?: Joi.ObjectSchema;
    filterSchema?: Joi.ObjectSchema;
    idSchema?: Joi.StringSchema;
    calculateFields?: (initial: Record<string, unknown>, req?: Request) => Promise<CreateInput>;
    calculateUpdateFields?: (current: T, data: Record<string, unknown>) => Promise<UpdateInput>;
    postCreate?: (value: T) => Promise<any>;
    postUpdate?: (old: T, updated: T) => Promise<any>;
    performAction?: (req: Request, res: Response) => Promise<any>;
}
export declare class ModelApi<Model extends Record<string, unknown>, Select, Include, ScalarFieldEnum, UniqueInput extends Partial<Model>, Input extends Partial<Model>, CreateInput, CreateManyInput, UpdateInput, UpdateManyInput, CountArgs, AggregateArgs, AggregateResult> {
    private dbClient;
    private resource;
    private getAuthorize;
    router: Router;
    isAccessAllowed: fnAuthorize;
    constructor(dbClient: Delegate<Model, Select, Include, ScalarFieldEnum, UniqueInput, Input, CreateInput, CreateManyInput, UpdateInput, UpdateManyInput, CountArgs, AggregateArgs, AggregateResult>, resource: Resource<Model, UniqueInput, CreateInput, UpdateInput>, getAuthorize: fnGetAuthorize);
}
export declare type GetPrismaModel<X> = X extends Delegate<infer Model, infer Select, infer Include, infer ScalarFieldEnum, infer UniqueInput, infer Input, infer CreateInput, infer CreateManyInput, infer UpdateInput, infer UpdateManyInput, infer CountArgs, infer AggregateArgs, infer AggregateResult> ? {
    model: Model;
    select: Select;
    include: Include;
    scalarFieldEnum: ScalarFieldEnum;
    uniqueInput: UniqueInput;
    input: Input;
    createInput: CreateInput;
    createManyInput: CreateManyInput;
    updateInput: UpdateInput;
    updateManyInput: UpdateManyInput;
    countArgs: CountArgs;
    aggregateArgs: AggregateArgs;
    aggregateResult: AggregateResult;
} : never;
export declare function getPrismaRestApi<X>(dbClient: Delegate<GetPrismaModel<X>["model"], GetPrismaModel<X>["select"], GetPrismaModel<X>["include"], GetPrismaModel<X>["scalarFieldEnum"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["input"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["createManyInput"], GetPrismaModel<X>["updateInput"], GetPrismaModel<X>["updateManyInput"], GetPrismaModel<X>["countArgs"], GetPrismaModel<X>["aggregateArgs"], GetPrismaModel<X>["aggregateResult"]>, resource: Resource<GetPrismaModel<X>["model"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["updateInput"]>, getAuthorize: fnGetAuthorize): ModelApi<GetPrismaModel<X>["model"], GetPrismaModel<X>["select"], GetPrismaModel<X>["include"], GetPrismaModel<X>["scalarFieldEnum"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["input"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["createManyInput"], GetPrismaModel<X>["updateInput"], GetPrismaModel<X>["updateManyInput"], GetPrismaModel<X>["countArgs"], GetPrismaModel<X>["aggregateArgs"], GetPrismaModel<X>["aggregateResult"]>;
export {};
