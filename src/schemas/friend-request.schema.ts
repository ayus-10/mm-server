import gql from "graphql-tag";

export const friendRequestSchema = gql`
  type User {
    id: Int!
    email: String!
    fullName: String!
  }

  type ModifiedFriendRequest {
    id: ID!
    senderId: Int!
    receiverId: Int!
    sentDate: String!
    status: String!
  }

  type FriendRequest {
    id: ID!
    senderId: Int!
    receiverId: Int!
    sentDate: String!
    status: String!
    sender: User!
    receiver: User!
  }

  type AllFriendRequests {
    sent: [FriendRequest!]
    received: [FriendRequest!]
  }

  type Mutation {
    sendFriendRequest(receiverId: Int!): ModifiedFriendRequest!
    acceptFriendRequest(id: Int!): ModifiedFriendRequest!
    rejectFriendRequest(id: Int!): ModifiedFriendRequest!
    cancelFriendRequest(id: Int!): ModifiedFriendRequest!
  }

  type Query {
    findUser(email: String!): User!
    getFriendRequests: AllFriendRequests!
  }

  type Subscription {
    friendRequestSent: ModifiedFriendRequest!
    friendRequestReceived: ModifiedFriendRequest!
    friendRequestAccepted: ModifiedFriendRequest!
    friendRequestRejected: ModifiedFriendRequest!
    friendRequestCanceled: ModifiedFriendRequest!
  }
`;
