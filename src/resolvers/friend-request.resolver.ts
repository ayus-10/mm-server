import { GraphQLError } from "graphql";
import { AuthContext } from "../interfaces/auth-context.interface";
import { PrismaClient } from "@prisma/client";

interface SendFriendRequestArgs {
  receiverId: number;
}

interface HandleFriendRequestArgs {
  id: number;
}

const prisma = new PrismaClient();

const getIdFromEmail = async (email: string) => {
  const user = await prisma.user.findFirst({ where: { email } });
  return user?.id;
};

const isLoggedIn = (resolver: Function) => {
  return (parent: unknown, args: unknown, ctx: AuthContext, info: unknown) => {
    const { authEmail } = ctx;
    if (!authEmail) {
      throw new GraphQLError("Please log in to continue");
    }

    return resolver(parent, args, ctx, info);
  };
};

const handleFriendRequest = (resolver: Function) => {
  return async (
    parent: unknown,
    args: HandleFriendRequestArgs,
    ctx: AuthContext,
    info: unknown,
  ) => {
    const { id } = args;

    const userEmail = String(ctx.authEmail);

    const userId = await getIdFromEmail(userEmail);

    const friendRequest = await prisma.friendRequest.findFirst({
      where: { id },
    });

    const receiverId = friendRequest?.receiverId;
    const status = friendRequest?.status;

    if (userId !== receiverId) {
      throw new GraphQLError("Not authorized to handle the request");
    }
    if (status !== "PENDING") {
      throw new GraphQLError("The request has already been handled");
    }

    return resolver(parent, args, ctx, info);
  };
};

const isValidId = (resolver: Function) => {
  return async (
    parent: unknown,
    args: HandleFriendRequestArgs,
    ctx: AuthContext,
    info: unknown,
  ) => {
    const { id } = args;
    if (!id) {
      throw new GraphQLError("Please provide the ID");
    }

    const friendRequest = await prisma.friendRequest.findFirst({
      where: { id },
    });
    if (!friendRequest) {
      throw new GraphQLError("Invalid ID");
    }

    return resolver(parent, args, ctx, info);
  };
};

export const friendRequestResolver = {
  Query: {
    getFriendRequests: isLoggedIn(
      async (_parent: unknown, _args: unknown, ctx: AuthContext) => {
        const userEmail = String(ctx.authEmail);

        const userId = Number(await getIdFromEmail(userEmail));

        const sentRequests = await prisma.friendRequest.findMany({
          where: { AND: [{ senderId: userId }, { status: "PENDING" }] },
          include: {
            sender: { select: { email: true, fullName: true } },
            receiver: { select: { email: true, fullName: true } },
          },
        });

        const receivedRequests = await prisma.friendRequest.findMany({
          where: { AND: [{ receiverId: userId }, { status: "PENDING" }] },
          include: {
            sender: { select: { email: true, fullName: true } },
            receiver: { select: { email: true, fullName: true } },
          },
        });

        return {
          sent: sentRequests,
          received: receivedRequests,
        };
      },
    ),
  },
  Mutation: {
    sendFriendRequest: isLoggedIn(
      async (_: unknown, args: SendFriendRequestArgs, ctx: AuthContext) => {
        const { receiverId } = args;

        const senderEmail = String(ctx.authEmail);

        const senderId = Number(await getIdFromEmail(senderEmail));

        if (!receiverId) {
          throw new GraphQLError("Please provide a receiver");
        }

        if (senderId === receiverId) {
          throw new GraphQLError("Sender can't be the receiver");
        }

        // check if an entry exists containing either sender or reciever
        const prevRequest = await prisma.friendRequest.findFirst({
          where: {
            OR: [
              { senderId: senderId, receiverId: receiverId },
              { senderId: receiverId, receiverId: senderId },
            ],
          },
        });

        if (prevRequest) {
          throw new GraphQLError("Duplicate friend request");
        }

        const date = new Date().toISOString().slice(0, 23) + "Z";
        const initialStatus = "PENDING";

        const friendRequest = await prisma.friendRequest.create({
          data: {
            receiverId: receiverId,
            senderId: senderId,
            sentDate: date,
            status: initialStatus,
          },
        });

        return friendRequest;
      },
    ),
    acceptFriendRequest: isLoggedIn(
      isValidId(
        handleFriendRequest(
          async (
            _parent: unknown,
            args: HandleFriendRequestArgs,
            _ctx: unknown,
          ) => {
            const { id } = args;

            const updatedFriendRequest = await prisma.friendRequest.update({
              where: { id },
              data: {
                status: "ACCEPTED",
              },
            });

            return updatedFriendRequest;
          },
        ),
      ),
    ),
    rejectFriendRequest: isLoggedIn(
      isValidId(
        handleFriendRequest(
          async (
            _parent: unknown,
            args: HandleFriendRequestArgs,
            _ctx: unknown,
          ) => {
            const { id } = args;

            const updatedFriendRequest = await prisma.friendRequest.update({
              where: { id },
              data: {
                status: "REJECTED",
              },
            });

            return updatedFriendRequest;
          },
        ),
      ),
    ),
    cancelFriendRequest: isLoggedIn(
      isValidId(
        async (_: unknown, args: HandleFriendRequestArgs, ctx: AuthContext) => {
          const { id } = args;
          const friendRequest = await prisma.friendRequest.findFirst({
            where: { id },
          });

          const userEmail = String(ctx.authEmail);
          const userId = Number(await getIdFromEmail(userEmail));

          if (friendRequest?.senderId !== userId) {
            throw new GraphQLError("Not authorized to cancel the request");
          }

          const deletedFriendRequest = await prisma.friendRequest.delete({
            where: { id },
          });

          return deletedFriendRequest;
        },
      ),
    ),
  },
};
