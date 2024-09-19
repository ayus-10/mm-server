import gql from "graphql-tag";

export const friendRequestSchema = gql`
  type FriendRequest {
    id: ID!
    sender: String!
    receiver: String!
    sentDate: String!
    status: String!
  }

  type AllFriendRequests {
    sent: [FriendRequest!]
    received: [FriendRequest!]
  }

  type Mutation {
    sendFriendRequest(receiver: String!): FriendRequest!
    acceptFriendRequest(id: ID!): FriendRequest!
    rejectFriendRequest(id: ID!): FriendRequest!
    cancelFriendRequest(id: ID!): FriendRequest!
  }

  type Query {
    getFriendRequests: AllFriendRequests!
  }
`;
