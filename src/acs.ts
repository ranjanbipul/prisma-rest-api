type UserType = "GUEST" | "USER" | "OWNER";

type ResourceAction = "CREATE" | "LIST" | "READ" | "UPDATE" | "DELETE";

export type AccessMatrix = {
  [user in UserType]?: {
    [action in ResourceAction]?: boolean;
  };
};

export type Response = {
  allowed: boolean;
  ownerOnly?: boolean;
};

export type UserAndRoles = {
  userId?: string | null;
  roles?: string[];
};

export type GetRolePermissions = (roles: string[]) => Promise<string[]>;

export const initializeAuthorization = (getRolePermissions: GetRolePermissions) => {
  const getAuthorize = (accessMap?: AccessMatrix) => {
    const authorize = async <User extends UserAndRoles>(
      user: User,
      resourceName: string,
      resourceAction: ResourceAction
    ): Promise<Response> => {
      // Authenticated User
      if (user.userId) {
        // SuperAdmin
        if (user.roles && user.roles.indexOf("SUPERADMIN") !== -1) {
          return {
            allowed: true,
          };
        }
        // Permission Check
        if (
          user.roles &&
          user.roles.length &&
          (await getRolePermissions(user.roles)).indexOf(
            `${resourceAction}_${resourceName}`
          ) !== -1
        ) {
          return {
            allowed: true,
          };
        }
        // Access allowed to user
        if (accessMap?.USER && accessMap.USER[resourceAction]) {
          return {
            allowed: true,
          };
        }
        // Access allowed to owner only
        if (accessMap?.OWNER && accessMap.OWNER[resourceAction]) {
          return {
            allowed: true,
            ownerOnly: true,
          };
        }
      }
      // Guest User
      else {
        if (accessMap?.GUEST && accessMap.GUEST[resourceAction]) {
          return {
            allowed: true,
          };
        }
      }
      // Deny request
      return {
        allowed: false,
      };
    }
    return authorize;
  }
  return getAuthorize;
}

export type fnInitializeAuthorization = typeof initializeAuthorization;

export type fnGetAuthorize = ReturnType<fnInitializeAuthorization>;

export type fnAuthorize = ReturnType<fnGetAuthorize>;
