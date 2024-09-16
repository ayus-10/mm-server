import { PrismaClient } from "@prisma/client";
import { GraphQLError } from "graphql";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

interface UserCredentials {
  user: {
    email: string;
    password: string;
    fullName?: string;
  };
}

interface AuthContext {
  authEmail?: string;
}

const PASSWORD_OPTIONS = {
  minLength: 8,
  minSymbols: 0,
  minNumbers: 1,
  minUppercase: 0,
};

const prisma = new PrismaClient();

const checkLoggedIn = (resolver: Function) => {
  return (
    parent: unknown,
    args: UserCredentials,
    ctx: AuthContext,
    info: unknown,
  ) => {
    const { authEmail } = ctx;
    if (authEmail) {
      throw new GraphQLError(`Already logged in as ${authEmail}`);
    }

    return resolver(parent, args, ctx, info);
  };
};

export const userResolver = {
  Query: {
    loginUser: checkLoggedIn(async (_: unknown, args: UserCredentials) => {
      const {
        user: { email, password },
      } = args;

      const userFound = await prisma.user.findFirst({
        where: { email: email },
      });
      if (!userFound) {
        throw new GraphQLError(`User ${email} does not exist`);
      }

      const passwordCorrect = await bcrypt.compare(
        password,
        userFound.password,
      );
      if (!passwordCorrect) {
        throw new GraphQLError("The password is incorrect");
      }

      const token = jwt.sign({ email }, JWT_SECRET, {
        expiresIn: "1y",
      });
      return { token };
    }),
    auth: async (_parent: unknown, _args: unknown, ctx: AuthContext) => {
      const { authEmail } = ctx;
      if (!authEmail) {
        throw new GraphQLError("You are not logged in");
      }

      const user = await prisma.user.findFirst({
        where: { email: authEmail },
      });

      return { email: authEmail, fullName: String(user?.fullName) };
    },
  },
  Mutation: {
    createUser: checkLoggedIn(async (_: unknown, args: UserCredentials) => {
      const {
        user: { email, password, fullName },
      } = args;

      if (!fullName) {
        throw new GraphQLError("Full name required to sign up");
      }

      const userFound = await prisma.user.findFirst({
        where: { email: email },
      });
      if (userFound) {
        throw new GraphQLError("User with that email already exists");
      }

      if (!validator.isEmail(email)) {
        throw new GraphQLError("Please provide a valid email");
      }
      if (!validator.isStrongPassword(password, PASSWORD_OPTIONS)) {
        throw new GraphQLError(
          "Password must be at least 8 characters, both alphabet and numbers",
        );
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, fullName },
      });

      const token = jwt.sign({ email }, JWT_SECRET, {
        expiresIn: "1y",
      });
      return { token };
    }),
  },
};
