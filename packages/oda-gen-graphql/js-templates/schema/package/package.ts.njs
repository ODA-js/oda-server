<#@ chunks "$$$main$$$" -#>
<#@ alias 'schema/package' #>
<#@ context 'pkg' #>

<#- chunkStart(`./entities/index.ts`); -#>
<#- pkg.entities.forEach( ent => {#>
import #{ent.name} from './#{ent.name}';
<#-})#>
import { Schema } from 'oda-gen-common';

export default new Schema({
  name: '#{pkg.name}.entities',
  items:[
<#- pkg.entities.forEach( ent => {#>
  #{ent.name},
<#-})#>
  ]
})

<#- chunkStart(`./helpers.ts`); -#>
<#- pkg.entities.forEach( ent => {#>
export * from './entities/#{ent.name}/helpers';
<#-})#>

<# chunkStart(`./dataPump/index.ts`); -#>
import * as _ from 'lodash';
<# for(let entity of pkg.entities){-#>
import #{entity.name} from './#{entity.name}';
<#}-#>

const result = _.merge (
<# for(let entity of pkg.entities){-#>
    #{entity.name},
<#}-#>
)

export default {
  ...result
};

<#- chunkStart(`./index.ts`); -#>
import Entities from './entities';
import Types from './_Types';
import Scalars from './scalars';
import Directives from './directives';
import Enums from './enums';
import Unions from './unions';
import Mixins from './mixins';
import Queries from './queries';
import Mutations from './mutations';
import { Schema } from 'oda-gen-common';
import gql from 'graphql-tag';

export {
  Types,
  Entities,
  Directives,
  Scalars,
  Enums,
  Mixins,
  Unions,
  Queries,
  Mutations,
}

export default new Schema({
  name: '#{pkg.name}',
  schema: gql`
    schema {
      query: RootQuery
      mutation: RootMutation
      subscription: RootSubscription
    }
  `,
  items: [
    Types,
    Entities,
    Directives,
    Scalars,
    Enums,
    Mixins,
    Unions,
    Queries,
    Mutations,
  ],
})

<#- chunkStart(`./common.ts`); -#>

import * as log4js from 'log4js';
let logger = log4js.getLogger('graphql:query');
import { get } from 'lodash';

import { pubsub } from '../../model/pubsub';

export function filterIt(payload, queryCheck) {
  return queryCheck(payload);
}

import {
  emptyConnection,
  pagination,
  detectCursorDirection,
  consts,
  mutateAndGetPayload,
  Filter,
} from 'oda-api-graphql';
import { lib } from 'oda-gen-common';

import { PubSubEngine, withFilter } from 'graphql-subscriptions';

const { selectionTree: traverse } = lib;

import { utils, getWithType } from 'oda-api-graphql';
import RegisterConnectors from './data/registerConnectors';

const { validId } = utils;

export * from './helpers';

import {
  Enum,
  Input,
  Interface,
  ModelType,
  Mutation,
  ObjectResolver,
  EnumResolver,
  FieldDefinition,
  IGQLInput,
  ModelTypes,
  Query,
  Resolver,
  ResolverFunction,
  Scalar,
  Directive,
  Subscription,
  ScalarResolver,
  Type,
  Union,
  Schema,
  UnionInterfaceResolverFunction,
// } from '../typedef';
} from 'oda-gen-common';

export {
  Enum,
  Input,
  Interface,
  ModelType,
  Mutation,
  ObjectResolver,
  EnumResolver,
  FieldDefinition,
  IGQLInput,
  ModelTypes,
  Query,
  Resolver,
  ResolverFunction,
  Scalar,
  Directive,
  ScalarResolver,
  Subscription,
  Type,
  Union,
  Schema,
  UnionInterfaceResolverFunction,
  getWithType,
};

export async function fixCount(
  length: number,
  cursor: { skip?: number; limit?: number },
  getCount: () => Promise<Number>,
) {
  const count = await getCount();
  if (count > 0) {
    if (length == cursor.limit) {
      return count;
    }
    if (length < cursor.limit) {
      return cursor.skip + length;
    } else {
      return count;
    }
  }
  return count;
}

export {
  RegisterConnectors,
  validId,
  get,
  traverse,
  pagination,
  detectCursorDirection,
  logger,
  consts,
  emptyConnection,
  PubSubEngine,
  withFilter,
  Filter,
  pubsub,
  mutateAndGetPayload,
};

#{partial(pkg,'scalars/index')}
#{partial(pkg,'directives/index')}
#{partial(pkg,'enums/index')}
#{partial(pkg,'queries/index')}
#{partial(pkg,'mutations/index')}
#{partial(pkg,'unions/index')}
#{partial(pkg,'mixins/index')}
#{partial(pkg,'types/index')}
#{partial(pkg,'data-connectors/index')}