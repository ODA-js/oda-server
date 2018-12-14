import 'jest';

import gql from 'graphql-tag';
import model from '../schema';
import { reshape } from 'oda-lodash';

import { MetaModel } from 'oda-model';
const query = gql`
  {
    packages {
      name
    }
    entities @_(filter: { name: "MediaFiles" }) {
      metadata
      name
      props: fields {
        name
      }
    }
  }
`;

describe('model', () => {
  it('loads', () => {
    const repository = new MetaModel(model as any);
    // const resolver = (fieldName: string, root: any) => {
    //   return root[fieldName];
    // };

    const result = reshape(query, repository.toObject());
    expect(result).toMatchSnapshot('packages');
    expect(repository).toMatchSnapshot('repository');
    expect(repository.toObject()).toMatchSnapshot('repository.toObject');
  });
});
