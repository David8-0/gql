import { gql } from 'urql'

export const ProductsQuery = gql`
  query Products {
    products {
      id
      name
      description
      price
      createdAt
    }
  }
`
