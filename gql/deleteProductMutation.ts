import { gql } from 'urql'

export const DeleteProductMutation = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`
