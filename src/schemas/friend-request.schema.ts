export const friendRequestSchema = `#graphql
  type FriendRequest {
    id: ID!
    sender: String!
    receiver: String!
    sentDate: String!
    status: String!
  }

  type Mutation {
    sendFriendRequest(receiver: String!): FriendRequest
    acceptFriendRequest(id: ID!): FriendRequest
    rejectFriendRequest(id: ID!): FriendRequest
    cancelFriendRequest(id: ID!): FriendRequest
  }

  type Query {
    getFriendRequests: [FriendRequest!]
  }
`;
