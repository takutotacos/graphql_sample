import {createServer} from 'node:http';
import {createYoga, createSchema} from 'graphql-yoga'
import {GraphQLError} from 'graphql'
import {useResponseCache} from "@graphql-yoga/plugin-response-cache";
import {usePersistedOperations} from '@graphql-yoga/plugin-persisted-operations'

const store = {
    ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38:
        '{__typename}'
}

const schema = createSchema({
    typeDefs: `
      type Query {
        hello: String
        slow: String
      }
    `,
    resolvers: {
        Query: {
            hello: (): string => 'Hello Hello Hello',
            slow: async () => {
                await new Promise((resolve) => setTimeout(resolve, 5000))
                return "i am slow"
            }
        },
    },
});

const yoga = createYoga({
    graphiql: {
        defaultQuery: `
        query {
            hello
        }
      `
    },
    cors: {
        origin: 'http://127.0.0.1',
        credentials: true,
        allowedHeaders: ['X-Custom-Header'],
        methods: ['POST']
    },
    plugins: [
        usePersistedOperations({
            getPersistedOperation(sha256Hash: string) {
                return store[sha256Hash]
            }
        }),
    ],
    schema: schema,
})


const server = createServer(yoga)
server.listen(4000, () => {
    console.info('Server is running on http://localhost:4000/graphql')
})
