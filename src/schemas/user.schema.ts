import gql from "graphql-tag";

export const userSchema = gql`
  type LoginToken {
    token: String!
  }

  type UserData {
    fullName: String!
    email: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input SignupInput {
    email: String!
    password: String!
    fullName: String!
  }

  type Query {
    loginUser(user: LoginInput!): LoginToken!
    auth: UserData!
  }

  type Mutation {
    createUser(user: SignupInput!): LoginToken!
  }
`;
