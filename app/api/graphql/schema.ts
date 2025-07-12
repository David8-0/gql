const schema = `#graphql
type User {
  id: ID!
  email: String!
  createdAt: String!
  token: String
  issues: [Issue]!
  products: [Product]!
}
enum IssueStatus {
  BACKLOG
  TODO
  INPROGRESS
  DONE
}
type Issue {
  id: ID!
  createdAt: String!
  userId: String!
  user: User!
  status: IssueStatus
  content: String!
  name: String!
}
type Product {
  id: ID!
  name: String!
  description: String
  price: Float!
  createdAt: String!
  userId: String!
  user: User!
}
input AuthInput {
  email: String!
  password: String!
}
input CreateIssueInput {
  name: String!
  content: String!
  status: IssueStatus
}
input EditIssueInput {
  name: String
  content: String
  status: IssueStatus
  id: ID!
}
input CreateProductInput {
  name: String!
  description: String
  price: Float!
}
input EditProductInput {
  id: ID!
  name: String
  description: String
  price: Float
}
input IssuesFilterInput {
  statuses: [IssueStatus]
}
type Query {
  me: User
  issues(input: IssuesFilterInput): [Issue]!
  products: [Product]!
  product(id: ID!): Product
}
type Mutation {
  deleteIssue(id: ID!): ID!
  createIssue(input: CreateIssueInput!): Issue!
  editIssue(input: EditIssueInput!): Issue!
  createUser(input: AuthInput!): User
  signin(input: AuthInput!): User
  createProduct(input: CreateProductInput!): Product!
  updateProduct(input: EditProductInput!): Product!
  deleteProduct(id: ID!): ID!
}
`
export default schema
