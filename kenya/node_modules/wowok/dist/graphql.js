import { gql } from "graphql-tag";
export const GRAPHQL_OBJECTS_TYPE = gql(`
 query objects_type_version($filter:ObjectFilter!) {
  objects(filter:$filter) {
    nodes {
      address
      version
      asMoveObject {
        contents {
          type {
            repr
          }
        }
    }
    }
  }
}
`);
export const GRAPHQL_CHILD_OBJECT = gql(`
  query object($ObjectID:SuiAddress!) {
    object(address:$ObjectID)  {
      address
      asMoveObject {
        contents {
          json
        }
      }
    }
  }
`);
export const GRAPHQL_OBJECT = gql(`
  query object($ObjectID:SuiAddress!) {
    object(address:$ObjectID)  {
      address
      asMoveObject {
        contents {
          json
          type {
            repr
          }
        }
      }
      dynamicFields {
        pageInfo {
            hasNextPage
            endCursor
        }
        nodes {
          name {
            json
          }
          value {
            ... on MoveValue {
              json
            }
            ... on MoveObject {
              contents {
                json
              }
            }
          }
        }
      }
    }
  }
`);
export const GRAPHQL_OWNER = gql(`
  query owner($ObjectID:SuiAddress!) {
    owner (address: $ObjectID) {
        address
        dynamicFields {
          pageInfo {
            hasNextPage
            endCursor
            }
            nodes {
                name {
                    json
                }
                value {
                ... on MoveValue {
                    json
                }
                ... on MoveObject {
                    contents {
                    json
                    }
                }
                }
            }
        }
    }
    }
`);
export const GRAPHQL_OBJECTS = gql(`
  query objects($filter:ObjectFilter!){
    objects(filter:$filter) {
      nodes {
        address
            asMoveObject {
        contents {
          json
          type {
            repr
          }
        }
      }
      }
  }
  }
`);
export const GRAPHQL_DECIMALS = gql(`
query getTotalSupply($coinType: String!) {
	coinMetadata(coinType: $coinType) {
		decimals
	}
} 
`);
