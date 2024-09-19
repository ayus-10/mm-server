import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { JWT_SECRET, PORT } from "./config";
import jwt from "jsonwebtoken";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { userSchema } from "./schemas/user.schema";
import { friendRequestSchema } from "./schemas/friend-request.schema";
import { userResolver } from "./resolvers/user.resolver";
import { friendRequestResolver } from "./resolvers/friend-request.resolver";

const schema = makeExecutableSchema({
  typeDefs: [userSchema, friendRequestSchema],
  resolvers: [userResolver, friendRequestResolver],
});

const server = new ApolloServer({ schema });

startStandaloneServer(server, {
  context: async ({ req }) => {
    const token = String(req.headers.authorization);
    let authEmail: string | null;
    try {
      const tokenData = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      const email = String(tokenData.email);
      authEmail = email;
    } catch {
      authEmail = null;
    }
    return { authEmail };
  },
  listen: { port: PORT },
}).then(({ url }) => {
  console.log(`🚀 Server is ready at: ${url}`);
});
