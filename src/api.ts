import Joi from "joi";
import { AccessMatrix, fnAuthorize, fnGetAuthorize } from "./acs";
import { Delegate, Enumerable, FindMany, OrderByInput } from "./db";
import express, { Request, Response, Router } from "express";
import { generatePage, getPageQuery, Page } from "./pagination";

declare global {
  namespace Express {
    interface Request {
      userId?: string | null;
      roles?: string[];
    }
  }
}

type StringProps<T> = {
  [K in keyof T]: T[K] extends string | null ? K : never;
}[keyof T];


const packErrors = (...messages: string[]) => ({
  errors: messages.map((message) => ({ message })),
});

export interface Resource<T extends Record<string, unknown>,
  UniqueInput extends Partial<T>,
  CreateInput,
  UpdateInput,
  // CreateManyInput,
  // Input,
  // Select,
  // Include,
  // ScalarFieldEnum,
  // UpdateManyInput,
  // CountArgs,
  // AggregateArgs,
  // AggregateResult
  > {
  name: string;
  id: keyof UniqueInput;
  pagination?: number;
  ownerId?: StringProps<T>;
  accessMap: AccessMatrix;
  createSchema?: Joi.ObjectSchema;
  updateSchema?: Joi.ObjectSchema;
  filterSchema?: Joi.ObjectSchema;
  idSchema?: Joi.StringSchema;
  calculateFields?: (
    initial: Record<string, unknown>,
    req?: Request
  ) => Promise<CreateInput>;
  calculateUpdateFields?: (
    current: T,
    data: Record<string, unknown>
  ) => Promise<UpdateInput>;
  postCreate?: (value: T) => Promise<any>;
  postUpdate?: (old: T, updated: T) => Promise<any>;
  performAction?: (req: Request, res: Response) => Promise<any>;
}

export class ModelApi<Model extends Record<string, unknown>,
  Select,
  Include,
  ScalarFieldEnum,
  UniqueInput extends Partial<Model>,
  Input extends Partial<Model>,
  CreateInput,
  CreateManyInput,
  UpdateInput,
  UpdateManyInput,
  CountArgs,
  AggregateArgs,
  AggregateResult>
{
  router: Router = express.Router();
  isAccessAllowed: fnAuthorize;

  constructor(
    private dbClient: Delegate<
      Model,
      Select,
      Include,
      ScalarFieldEnum,
      UniqueInput,
      Input,
      CreateInput,
      CreateManyInput,
      UpdateInput,
      UpdateManyInput,
      CountArgs,
      AggregateArgs,
      AggregateResult
    >,
    private resource: Resource<Model, UniqueInput, CreateInput, UpdateInput>,
    private getAuthorize: fnGetAuthorize
  ) {
    this.isAccessAllowed = getAuthorize(this.resource.accessMap);
    this.router.get("/", async (req: Request, res: Response) => {
      const clause: FindMany<
        Model,
        Select,
        Include,
        Input,
        UniqueInput,
        ScalarFieldEnum
      > = { where: {} as Input };
      const acsResult = await this.isAccessAllowed(
        req,
        this.resource.name,
        "LIST"
      );
      if (!acsResult.allowed) {
        res.status(403).send("Unauthorized");
        return;
      }

      if (acsResult.ownerOnly) {
        if (!this.resource.ownerId || !req.userId) {
          res.status(404).json(packErrors("Something went wrong"));
          return;
        } else {
          clause["where"] = Object.assign(clause["where"], {
            [this.resource.ownerId]: req.userId,
          });
        }
      }

      // Pagination
      let page: Page = { _limit: 10, _offset: 0 };
      if (this.resource.pagination && !req.query.id) {
        page = getPageQuery(req, this.resource.pagination);
        clause.skip = page._offset;
        clause.take = page._limit;
      }
      // Multiple id filter
      if (Array.isArray(req.query.id)) {
        clause["where"] = Object.assign({}, clause["where"], {
          id: { in: req.query.id as string[] },
        });
      }
      // Order By
      if (req.query._sort) {
        clause.orderBy = {
          [req.query._sort as string]: req.query._order
            ? (req.query._order as string).toLowerCase()
            : "asc",
        } as Enumerable<OrderByInput<Model>>;
      }

      // Filter
      if (this.resource.filterSchema) {
        const filterResult = this.resource.filterSchema.validate(req.query, {
          stripUnknown: { objects: true },
        });
        console.log("Filter schema", filterResult);
        if (filterResult.error) {
          res
            .status(400)
            .json({
              errors: filterResult.error.details.map((x) => ({
                message: x.message,
                path: x.path,
              })),
            });
          return;
        }
        clause["where"] = {...filterResult.value,...clause["where"]}
      }

      const results = await this.dbClient.findMany(clause);
      if (this.resource.pagination && !req.query.id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { skip, take, orderBy, include, select, ...remain } = clause;
        const count = await this.dbClient.count(remain);
        res.send(generatePage(req, results, count, page));
      } else {
        res.send(results);
      }
    });

    this.router.post("/", async (req: Request, res: Response) => {
      const acsResult = await this.isAccessAllowed(
        req,
        this.resource.name,
        "CREATE"
      );
      if (!acsResult.allowed) {
        res.status(403).send("Unauthorized");
        return;
      }
      let data = req.body;
      if (this.resource.createSchema) {
        const validationResult = this.resource.createSchema.validate(req.body);
        if (validationResult.error) {
          res
            .status(400)
            .json({
              errors: validationResult.error.details.map((x) => ({
                message: x.message,
                path: x.path,
              })),
            });
          return;
        }
        data = validationResult.value;
      }
      if (acsResult.ownerOnly) {
        if (!this.resource.ownerId || !req.userId) {
          res.status(404).json(packErrors("Something went wrong"));
          return;
        } else {
          data[this.resource.ownerId as string] = req.userId;
        }
      }
      if (this.resource.ownerId && !data[this.resource.ownerId as string] && req.userId) {
        data[this.resource.ownerId as string] = req.userId;
      }
      try {
        if (this.resource.calculateFields) {
          data = await this.resource.calculateFields(data);
        }
        const result = await this.dbClient.create({ data });
        if (this.resource.postCreate) {
          await this.resource.postCreate(result);
        }
        res.status(201).json(result);
      } catch (err) {
        console.error("Create error", err);
        res
          .status(400)
          .json(
            packErrors(`Unable to create ${this.resource.name.toLowerCase()}: ${err}`)
          );
      }
    });

    const updateHandler = async (req: Request, res: Response) => {
      const acsResult = await this.isAccessAllowed(
        req,
        this.resource.name,
        "UPDATE"
      );
      if (!acsResult.allowed) {
        res.status(403).send("Unauthorized");
        return;
      }
      let data = req.body;
      if (this.resource.updateSchema) {
        const validationResult = this.resource.updateSchema.validate(req.body, {
          stripUnknown: { objects: true },
        });
        if (validationResult.error) {
          res
            .status(400)
            .json({
              errors: validationResult.error.details.map((x) => ({
                message: x.message,
                path: x.path,
              })),
            });
          return;
        }
        data = validationResult.value;
      }
      const resource = await this.dbClient.findUnique({
        where: { [this.resource.id]: req.params.id } as UniqueInput,
      });
      if (!resource) {
        res.status(404).json(packErrors("Resource does not exist"));
        return;
      }
      if (acsResult.ownerOnly) {
        if (!this.resource.ownerId || !req.userId) {
          res.status(404).json(packErrors("Something went wrong"));
          return;
        } else if (
          (resource[this.resource.ownerId] as unknown as string) !== req.userId
        ) {
          res.status(403).json(packErrors("Unauthorized"));
        }
      }
      try {
        if (this.resource.calculateUpdateFields) {
          data = await this.resource.calculateUpdateFields(resource, data);
        }
        const result = await this.dbClient.update({
          where: { [this.resource.id]: req.params.id } as UniqueInput,
          data,
        });
        if (this.resource.postUpdate) {
          await this.resource.postUpdate(resource, result);
        }
        res.status(200).json(result);
      } catch (err) {
        console.error("Create error", err);
        res
          .status(400)
          .json(
            packErrors(`Unable to update ${this.resource.name.toLowerCase()}: ${err}`)
          );
      }
    };

    this.router.put("/:id/", updateHandler);
    this.router.patch("/:id/", updateHandler);
    if (this.resource.performAction)
      this.router.post("/:id/:action/", this.resource.performAction);

    this.router.get("/:id/", async (req: Request, res: Response) => {
      const acsResult = await this.isAccessAllowed(
        req,
        this.resource.name,
        "READ"
      );
      if (!acsResult.allowed) {
        res.status(403).send("Unauthorized");
        return;
      }
      const schema: Record<string, string> = {
        [this.resource.id]: req.params.id as string,
      };
      if (acsResult.ownerOnly) {
        if (!this.resource.ownerId || !req.userId) {
          res.status(403).send("Unauthorized");
          return;
        } else {
          schema[this.resource.ownerId as string] = req.userId;
        }
      }
      const result = await this.dbClient.findFirst({ where: schema as Input });
      if (result) res.json(result);
      else
        res
          .status(404)
          .json(packErrors(`${this.resource.name} [${req.params.id}] does not exist`));
    });

    this.router.delete("/:id/", async (req: Request, res: Response) => {
      const acsResult = await this.isAccessAllowed(
        req,
        this.resource.name,
        "DELETE"
      );
      if (!acsResult.allowed) {
        res.status(403).send("Unauthorized");
        return;
      }
      const schema: Record<string, string> = {
        [this.resource.id]: req.params.id as string,
      };
      if (acsResult.ownerOnly) {
        if (!this.resource.ownerId || !req.userId) {
          res.status(403).send("Unauthorized");
          return;
        } else {
          schema[this.resource.ownerId as string] = req.userId;
        }
      }
      const result = await this.dbClient.deleteMany({ where: schema as Input });
      if (result.count) res.json(result);
      else
        res
          .status(404)
          .json(packErrors(`${this.resource.name} [${req.params.id}] does not exist`));
    });
  }
}

export type GetPrismaModel<X> = X extends Delegate<
  infer Model,
  infer Select,
  infer Include,
  infer ScalarFieldEnum,
  infer UniqueInput,
  infer Input,
  infer CreateInput,
  infer CreateManyInput,
  infer UpdateInput,
  infer UpdateManyInput,
  infer CountArgs,
  infer AggregateArgs,
  infer AggregateResult
>
  ? {
    model: Model,
    select: Select,
    include: Include,
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
  }
  : never;

export function getPrismaRestApi<X>(dbClient: Delegate<GetPrismaModel<X>["model"], GetPrismaModel<X>["select"], GetPrismaModel<X>["include"], GetPrismaModel<X>["scalarFieldEnum"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["input"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["createManyInput"], GetPrismaModel<X>["updateInput"], GetPrismaModel<X>["updateManyInput"], GetPrismaModel<X>["countArgs"], GetPrismaModel<X>["aggregateArgs"], GetPrismaModel<X>["aggregateResult"]>, resource: Resource<GetPrismaModel<X>["model"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["updateInput"]>, getAuthorize: fnGetAuthorize) {
  type prisma = GetPrismaModel<X>;
  return new ModelApi<
    prisma["model"],
    prisma["select"],
    prisma["include"],
    prisma["scalarFieldEnum"],
    prisma["uniqueInput"],
    prisma["input"],
    prisma["createInput"],
    prisma["createManyInput"],
    prisma["updateInput"],
    prisma["updateManyInput"],
    prisma["countArgs"],
    prisma["aggregateArgs"],
    prisma["aggregateResult"]
  >(dbClient, resource, getAuthorize);
}