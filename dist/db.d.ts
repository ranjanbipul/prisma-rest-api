export declare type Enumerable<T> = T[] | T;
declare type SortOrder = "asc" | "desc";
export declare type OrderByInput<T> = {
    [K in keyof T]?: SortOrder;
};
declare type RejectOnNotFound = boolean | ((error: Error) => Error);
interface FindUnique<Model, Select, Include, UniqueInput extends Partial<Model>> {
    select?: Select | null;
    include?: Include | null;
    rejectOnNotFound?: RejectOnNotFound;
    where: UniqueInput;
}
export interface FindMany<Model, Select, Include, Input extends Partial<Model>, UniqueInput, ScalarFieldEnum> {
    select?: Select | null;
    include?: Include | null;
    where?: Input;
    orderBy?: Enumerable<OrderByInput<Model>>;
    cursor?: UniqueInput;
    take?: number;
    skip?: number;
    distinct?: Enumerable<ScalarFieldEnum>;
}
interface Find<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum> extends FindMany<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum> {
    rejectOnNotFound?: RejectOnNotFound;
}
interface CreateArgs<Select, Include, CreateInput> {
    select?: Select | null;
    include?: Include | null;
    data: CreateInput;
}
interface CreateManyArgs<CreateManyInput> {
    data: Enumerable<CreateManyInput>;
    skipDuplicates?: boolean;
}
interface UpdateArgs<Select, Include, UniqueInput, UpdateInput> {
    select?: Select | null;
    include?: Include | null;
    where: UniqueInput;
    data: UpdateInput;
}
interface UpdateManyArgs<Input, UpdateManyInput> {
    data: Enumerable<UpdateManyInput>;
    where?: Input;
}
interface UpsertArgs<Select, Include, UniqueInput, CreateInput, UpdateInput> {
    select?: Select | null;
    include?: Include | null;
    where: UniqueInput;
    create: CreateInput;
    update: UpdateInput;
}
interface DeleteArgs<Select, Include, UniqueInput> {
    select?: Select | null;
    include?: Include | null;
    where: UniqueInput;
}
interface DeleteManyArgs<Input> {
    where?: Input;
}
interface CountArgs<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum, CountAggregate> extends Omit<FindMany<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum>, 'include' | 'select'> {
    select?: CountAggregate | true;
}
export declare type Delegate<Model extends Record<string, unknown>, Select, Include, ScalarFieldEnum, UniqueInput extends Partial<Model>, Input extends Partial<Model>, CreateInput, CreateManyInput, UpdateInput, UpdateManyInput, CountAggregate, AggregateArgs, AggregateResult> = {
    findUnique: (args: FindUnique<Model, Select, Include, UniqueInput>) => Promise<Model | null>;
    findFirst: (args: Find<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum>) => Promise<Model | null>;
    findMany: (args: FindMany<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum>) => Promise<Model[]>;
    create: (args: CreateArgs<Select, Include, CreateInput>) => Promise<Model>;
    createMany: (args: CreateManyArgs<CreateManyInput>) => Promise<{
        count: number;
    }>;
    delete: (args: DeleteArgs<Select, Include, UniqueInput>) => Promise<Model>;
    update: (args: UpdateArgs<Select, Include, UniqueInput, UpdateInput>) => Promise<Model>;
    deleteMany: (args: DeleteManyArgs<Input>) => Promise<{
        count: number;
    }>;
    updateMany: (args: UpdateManyArgs<Input, UpdateManyInput>) => Promise<{
        count: number;
    }>;
    upsert: (args: UpsertArgs<Select, Include, UniqueInput, CreateInput, UpdateInput>) => Promise<Model>;
    count: (args: CountArgs<Model, Select, Include, Input, UniqueInput, ScalarFieldEnum, CountAggregate>) => Promise<number>;
    aggregate: (args: AggregateArgs) => Promise<AggregateResult>;
};
export {};
