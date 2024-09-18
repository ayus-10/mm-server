import { friendRequestSchema } from "./friend-request.schema";
import { userSchema } from "./user.schema";

export const typeDefs = userSchema + friendRequestSchema;
