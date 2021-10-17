import { fnGetAuthorize, GetRolePermissions } from "./acs";
import { GetPrismaModel, Resource } from "./api";
import { Delegate } from "./db";
export default class PrimsaRestApi {
    private getRolePermissions;
    getAuthorize: fnGetAuthorize;
    constructor(getRolePermissions: GetRolePermissions);
    get<X>(dbClient: Delegate<GetPrismaModel<X>["model"], GetPrismaModel<X>["select"], GetPrismaModel<X>["include"], GetPrismaModel<X>["scalarFieldEnum"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["input"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["createManyInput"], GetPrismaModel<X>["updateInput"], GetPrismaModel<X>["updateManyInput"], GetPrismaModel<X>["countArgs"], GetPrismaModel<X>["aggregateArgs"], GetPrismaModel<X>["aggregateResult"]>, resource: Resource<GetPrismaModel<X>["model"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["updateInput"]>): import("./api").ModelApi<GetPrismaModel<X>["model"], GetPrismaModel<X>["select"], GetPrismaModel<X>["include"], GetPrismaModel<X>["scalarFieldEnum"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["input"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["createManyInput"], GetPrismaModel<X>["updateInput"], GetPrismaModel<X>["updateManyInput"], GetPrismaModel<X>["countArgs"], GetPrismaModel<X>["aggregateArgs"], GetPrismaModel<X>["aggregateResult"]>;
}
