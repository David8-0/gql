// gql/signupMutation
import { gql } from '@urql/next'

export const SignupMutation = gql`
  mutation Mutation($input: AuthInput!) {
    createUser(input: $input) {
      token
    }
  }
`
