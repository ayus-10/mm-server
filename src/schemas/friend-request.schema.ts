import gql from "graphql-tag";

export const friendRequestSchema = gql`
  type FriendRequest {
    id: ID!
    sender: Int!
    receiver: Int!
    sentDate: String!
    status: String!
  }

  type AllFriendRequests {
    sent: [FriendRequest!]
    received: [FriendRequest!]
  }

  type Mutation {
    sendFriendRequest(receiverId: Int!): FriendRequest!
    acceptFriendRequest(id: Int!): FriendRequest!
    rejectFriendRequest(id: Int!): FriendRequest!
    cancelFriendRequest(id: Int!): FriendRequest!
  }

  type Query {
    getFriendRequests: AllFriendRequests!
  }
`;
