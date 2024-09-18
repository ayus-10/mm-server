import { friendRequestResolver } from "./friend-request.resolver";
import { userResolver } from "./user.resolver";

export const resolvers = { ...userResolver, ...friendRequestResolver };
