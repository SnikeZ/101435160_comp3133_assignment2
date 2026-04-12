export const typeDefs = `#graphql
  scalar Date

  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
    created_at: Date!
    updated_at: Date!
  }

  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
    gender: String!
    designation: String!
    salary: Float!
    date_of_joining: Date!
    department: String!
    employee_photo: String
    created_at: Date!
    updated_at: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    getEmployees: [Employee!]!
    getEmployee(id: ID!): Employee
    searchEmployees(department: String, designation: String): [Employee!]!
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): AuthPayload!
    addEmployee(
      first_name: String!
      last_name: String!
      email: String!
      gender: String!
      designation: String!
      salary: Float!
      date_of_joining: Date!
      department: String!
      employee_photo: String
    ): Employee!
    updateEmployee(
      id: ID!
      first_name: String
      last_name: String
      email: String
      gender: String
      designation: String
      salary: Float
      date_of_joining: Date
      department: String
      employee_photo: String
    ): Employee
    deleteEmployee(id: ID!): Boolean!
  }
`;
