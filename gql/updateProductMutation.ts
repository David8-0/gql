import { gql } from 'urql'

export const UpdateProductMutation = gql`
  mutation UpdateProduct($input: EditProductInput!) {
    updateProduct(input: $input) {
      id
    }
  }
`
