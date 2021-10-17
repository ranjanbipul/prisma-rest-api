import { fnGetAuthorize, GetRolePermissions, initializeAuthorization } from "./acs";
import { GetPrismaModel, getPrismaRestApi, Resource } from "./api";
import { Delegate } from "./db";

export default class PrimsaRestApi {
  getAuthorize: fnGetAuthorize;

  constructor(
    private getRolePermissions: GetRolePermissions,
  ){
    this.getAuthorize = initializeAuthorization(this.getRolePermissions);
  }

  get<X>(dbClient: Delegate<GetPrismaModel<X>["model"], GetPrismaModel<X>["select"], GetPrismaModel<X>["include"], GetPrismaModel<X>["scalarFieldEnum"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["input"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["createManyInput"], GetPrismaModel<X>["updateInput"], GetPrismaModel<X>["updateManyInput"], GetPrismaModel<X>["countArgs"], GetPrismaModel<X>["aggregateArgs"], GetPrismaModel<X>["aggregateResult"]>, resource: Resource<GetPrismaModel<X>["model"], GetPrismaModel<X>["uniqueInput"], GetPrismaModel<X>["createInput"], GetPrismaModel<X>["updateInput"]>){
    return getPrismaRestApi<X>(dbClient, resource, this.getAuthorize)
  }
}
