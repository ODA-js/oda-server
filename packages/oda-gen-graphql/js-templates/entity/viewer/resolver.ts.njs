<#@ context 'entity' -#>

import RegisterConnectors from '../../../../data/registerConnectors';
import { emptyConnection, pagination } from 'oda-api-graphql';
import { query } from '../query/resolver';

export const viewer: { [key: string]: any } = {
  Viewer: query
};
