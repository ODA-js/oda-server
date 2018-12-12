import graphql from 'graphql-anywhere';

import { graphqlLodash } from './gql';

export function filter(doc: any, data: any) {
  const resolver = (
    fieldName: string,
    root: any,
    _args: any,
    _context: any,
    info: any,
  ) => {
    if (root.hasOwnProperty(fieldName)) {
      return root[fieldName];
    } else {
      return root[info.resultKey];
    }
  };

  return graphql(resolver, doc, data);
}

export default function reshape(doc: any, data: any) {
  const { transform, apply } = graphqlLodash(doc);
  const result = filter(doc, data);
  if (apply) {
    return transform(result);
  }
  return result;
}
