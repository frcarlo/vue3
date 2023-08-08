import { GraphQLSchema, GraphQLObjectType, GraphQLString } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      hello: {
        type: GraphQLJSONObject,
        args: {
          id: { type: GraphQLString },
        },
        resolve: async (source, args, ctx, meta) => {
          const { esClient } = ctx;
          const ping = await esClient.ping();
          return {
            ping,
            result: true,
          };
        },
      },
    },
  }),
});
