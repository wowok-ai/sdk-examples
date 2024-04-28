import { ApolloClient } from "@apollo/client/core";
import { ApolloCache, InMemoryCache } from "@apollo/client/cache";
import { GRAPHQL_OBJECTS, GRAPHQL_OBJECTS_TYPE, GRAPHQL_OBJECT, GRAPHQL_OWNER} from 'wowok/src/graphql'
import { Passport } from "wowok";

export const client = new ApolloClient({
  uri: "https://sui-testnet.mystenlabs.com/graphql",
  cache: new InMemoryCache(),
});

export const graphql_object = async (objectid: string): Promise<any> => {
  if (!objectid) return false;

  return client.query({
    query: GRAPHQL_OBJECT,
    variables: { ObjectID: objectid },
  });
};
export const graphql_objects = async (objectids: string[]): Promise<any | boolean> => {
  if (objectids.length == 0 || objectids.length > Passport.MAX_GUARD_COUNT) return false;

  return client.query({
      query: GRAPHQL_OBJECTS,
      variables: {'filter':{"objectIds":objectids}},
    })
};

export const graphql_objects_type_version = async (objectids: string[]): Promise<any | boolean> => {
  if (objectids.length == 0) return false;
  return client.query({
      query: GRAPHQL_OBJECTS_TYPE,
      variables: {'filter':{"objectIds":objectids}},
    })
};

export const graphql_owner = async (objectid: string): Promise<any> => {
  if (!objectid) return false;
  return client.query({
    query: GRAPHQL_OWNER,
    variables: { ObjectID: objectid },
  });
};
