import { db } from '@/db/db'
import {
  InsertIssues,
  InsertProduct,
  SelectIssues,
  issues,
  products,
  users,
  SelectProduct,
} from '@/db/schema'
import { GQLContext } from '@/types'
import { getUserFromToken, signin, signup } from '@/utils/auth'
import { and, asc, desc, eq, or, sql } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
const resolvers = {
  IssueStatus: {
    BACKLOG: 'backlog',
    TODO: 'todo',
    INPROGRESS: 'inprogress',
    DONE: 'done',
  },
  Issue: {
    user: (issue: SelectIssues, args: any, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      return db.query.users.findFirst({
        where: eq(users.id, issue.userId),
      })
    },
  },
  Product: {
    user: (product: SelectProduct, args: any, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      return db.query.users.findFirst({
        where: eq(users.id, product.userId),
      })
    },
  },
  User: {
    issues: (user: { id: string }, args: any, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      return db.query.issues.findMany({
        where: eq(issues.userId, user.id),
      })
    },
    products: (user: { id: string }, args: any, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      return db.query.products.findMany({
        where: eq(products.userId, user.id),
      })
    },
  },
  Query: {
    me: async (_: any, __: any, ctx: GQLContext) => {
      return ctx.user
    },
    issues: async (
      _: any,
      {
        input,
      }: {
        input?: {
          statuses?: SelectIssues['status'][]
          projects?: SelectIssues['projectId'][]
        }
      },
      ctx: GQLContext
    ) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      const andFilters = [eq(issues.userId, ctx.user.id)]
      if (input && input.statuses && input.statuses.length) {
        const statusFilters = input.statuses.map((status) =>
          eq(issues.status, status)
        )
        if (statusFilters.length > 0) {
          andFilters.push(or(...statusFilters))
        }
      }
      const data = await db.query.issues.findMany({
        where: and(...andFilters),
        orderBy: [
          asc(sql`case ${issues.status}
        when "backlog" then 1
        when "inprogress" then 2
        when "done" then 3
      end`),
          desc(issues.createdAt),
        ],
      })
      return data
    },
    products: async (_: any, __: any, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      return db.query.products.findMany({
        where: eq(products.userId, ctx.user.id),
      })
    },
    product: async (_: any, { id }: { id: string }, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      return db.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.userId, ctx.user.id)),
      })
    },
  },
  Mutation: {
    deleteIssue: async (_: any, { id }: { id: string }, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      await db.delete(issues).where(eq(issues.id, id))
      return id
    },
    createIssue: async (
      _: any,
      { input }: { input: Omit<InsertIssues, 'userId'> },
      ctx: GQLContext
    ) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      const issue = await db
        .insert(issues)
        .values({ ...input, userId: ctx.user.id })
        .returning()
      return issue[0]
    },
    createUser: async (_: any, args: { input: any }) => {
      const data = await signup(args.input)
      if (!data || !data.user || !data.token) {
        throw new GraphQLError('could not create user', {
          extensions: { code: 'AUTH_ERROR' },
        })
      }
      return { ...data.user, token: data.token }
    },
    editIssue: async (
      _: any,
      { input }: { input: { id: string } & Partial<InsertIssues> },
      ctx: GQLContext
    ) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      const { id, ...updates } = input
      const issue = await db
        .update(issues)
        .set(updates)
        .where(eq(issues.id, id))
        .returning()
      return issue[0]
    },
    signin: async (_: any, args: { input: any }) => {
      const data = await signin(args.input)
      if (!data || !data.user || !data.token) {
        throw new GraphQLError('UNAUTHORIZED', {
          extensions: { code: 'AUTH_ERROR' },
        })
      }
      return { ...data.user, token: data.token }
    },
    createProduct: async (
      _: any,
      { input }: { input: InsertProduct },
      ctx: GQLContext
    ) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      const product = await db
        .insert(products)
        .values({ ...input, userId: ctx.user.id })
        .returning()
      return product[0]
    },
    updateProduct: async (
      _: any,
      { input }: { input: { id: string } & Partial<InsertProduct> },
      ctx: GQLContext
    ) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      const { id, ...updates } = input
      const product = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, id))
        .returning()
      return product[0]
    },
    deleteProduct: async (_: any, { id }: { id: string }, ctx: GQLContext) => {
      if (!ctx.user)
        throw new GraphQLError('UNAUTHORIZED', { extensions: { code: 401 } })
      await db.delete(products).where(eq(products.id, id))
      return id
    },
  },
}
export default resolvers
