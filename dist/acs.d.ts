declare type UserType = "GUEST" | "USER" | "OWNER";
declare type ResourceAction = "CREATE" | "LIST" | "READ" | "UPDATE" | "DELETE";
export declare type AccessMatrix = {
    [user in UserType]?: {
        [action in ResourceAction]?: boolean;
    };
};
export declare type Response = {
    allowed: boolean;
    ownerOnly?: boolean;
};
export declare type UserAndRoles = {
    userId?: string | null;
    roles?: string[];
};
export declare type GetRolePermissions = (roles: string[]) => Promise<string[]>;
export declare const initializeAuthorization: (getRolePermissions: GetRolePermissions) => (accessMap?: AccessMatrix | undefined) => <User extends UserAndRoles>(user: User, resourceName: string, resourceAction: ResourceAction) => Promise<Response>;
export declare type fnInitializeAuthorization = typeof initializeAuthorization;
export declare type fnGetAuthorize = ReturnType<fnInitializeAuthorization>;
export declare type fnAuthorize = ReturnType<fnGetAuthorize>;
export {};
