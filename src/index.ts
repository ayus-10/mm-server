import { createSchema, createYoga, YogaInitialContext } from "graphql-yoga";
import { userSchema } from "./schemas/user.schema";
import { friendRequestSchema } from "./schemas/friend-request.schema";
import { userResolver } from "./resolvers/user.resolver";
import { friendRequestResolver } from "./resolvers/friend-request.resolver";
import { JWT_SECRET, PORT } from "./config";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { AuthContext } from "./interfaces/auth-context.interface";
import { PubSubContext } from "./interfaces/pub-sub-context.interface";
import { pubSub } from "./pubsub";

export type GraphQLContext = PubSubContext & AuthContext & YogaInitialContext;

const schema = createSchema({
  typeDefs: [userSchema, friendRequestSchema],
  resolvers: [userResolver, friendRequestResolver],
});

const yoga = createYoga<GraphQLContext>({
  schema,
  context: (req) => {
    const token = String(req.request.headers.get("authorization"));
    let authEmail: string | null;
    try {
      const tokenData = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      const email = String(tokenData.email);
      authEmail = email;
    } catch {
      authEmail = null;
    }
    return { authEmail, pubSub };
  },
});

const server = createServer(yoga);

server.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`));
