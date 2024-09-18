import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { typeDefs } from "./schemas";
import { resolvers } from "./resolvers";
import { JWT_SECRET, PORT } from "./config";
import jwt from "jsonwebtoken";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

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
