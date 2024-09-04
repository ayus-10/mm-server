export const userSchema = `#graphql
  type LoginToken {
    token: String!
  }

  input UserCredentialsInput {
    email: String!
    password: String!
  }

  type Query {
    loginUser(user: UserCredentialsInput!): LoginToken
    auth: String
  }

  type Mutation {
    createUser(user: UserCredentialsInput!): LoginToken
  }
`;
