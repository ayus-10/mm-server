import { GraphQLError } from "graphql";
import { AuthContext } from "../interfaces/auth-context.interface";
import { PrismaClient } from "@prisma/client";

interface SendFriendRequestArgs {
  receiver: string;
}

interface HandleFriendRequestArgs {
  id: number;
}

const prisma = new PrismaClient();

const isLoggedIn = (resolver: Function) => {
  return (parent: unknown, args: unknown, ctx: AuthContext, info: unknown) => {
    const { authEmail } = ctx;
    if (!authEmail) {
      throw new GraphQLError("Please log in to continue");
    }

    return resolver(parent, args, ctx, info);
  };
};

export const friendRequestResolver = {
  Query: {
    getFriendRequests: isLoggedIn(() => {}),
  },
  Mutation: {
    sendFriendRequest: isLoggedIn(
      async (_: unknown, args: SendFriendRequestArgs, ctx: AuthContext) => {
        const receiver = args.receiver;
        const sender = String(ctx.authEmail);

        if (!receiver) {
          throw new GraphQLError("Please provide a receiver");
        }

        // check if an entry exists containing either sender or reciever
        const prevRequest = await prisma.friendRequest.findFirst({
          where: {
            OR: [
              { sender: sender, receiver: receiver },
              { sender: receiver, receiver: sender },
            ],
          },
        });

        if (prevRequest) {
          throw new GraphQLError("Duplicate friend request");
        }

        const date = new Date().toISOString().split("T")[0];
        const initialStatus = "PENDING";

        const friendRequest = await prisma.friendRequest.create({
          data: { receiver, sender, sentDate: date, status: initialStatus },
        });

        return friendRequest;
      },
    ),
    acceptFriendRequest: isLoggedIn(
      async (_: unknown, args: HandleFriendRequestArgs, ctx: AuthContext) => {
        const { id } = args;
        if (!id) {
          throw new GraphQLError("Please provide the ID");
        }

        const user = String(ctx.authEmail);

        const friendRequest = await prisma.friendRequest.findFirst({
          where: { id },
        });

        if (!friendRequest) {
          throw new GraphQLError("Invalid ID");
        }

        const { sender, receiver, status } = friendRequest;

        if (user !== receiver) {
          throw new GraphQLError("Not authorized to accept the request");
        }
        if (status !== "PENDING") {
          throw new GraphQLError("The request has already been handled");
        }

        const updatedFriendRequest = await prisma.friendRequest.update({
          where: { id },
          data: {
            status: "ACCEPTED",
          },
        });

        return updatedFriendRequest;
      },
    ),
    rejectFriendRequest: isLoggedIn(
      async (_: unknown, args: HandleFriendRequestArgs, ctx: AuthContext) => {},
    ),
    cancelFriendRequest: isLoggedIn(
      async (_: unknown, args: HandleFriendRequestArgs, ctx: AuthContext) => {},
    ),
  },
};
