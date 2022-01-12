# Prisma Rest API

```
import PrismaRestApi from 'prisma-rest-api';
import { getUserPermissions } from './users/auth';

const prismaRestApi = new PrismaRestApi(getUserPermissions);

export default prismaRestApi;
```

```
export const permissionApi = prismaRestApi.get<typeof prisma.permission>(prisma.permission, {
  name: "PERMISSION",
  id: "id",
  accessMap: {},
  createSchema: Joi.object({
    id: constantSchema,
    name: Joi.string().trim().min(3).max(200),
  }),
});
```