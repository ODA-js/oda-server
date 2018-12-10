<#@ chunks "$$$main$$$" -#>
<#@ alias 'entity-index' #>
<#@ context 'entity' #>

<#- chunkStart(`./index.ts`); -#>
import connections from './connections';
import * as helpers from './helpers';
import mutations from './mutations';
import query from './query';
import subscriptions from './subscriptions';
import type from './type';
import { Schema } from 'oda-gen-common';

export { connections, mutations, query, subscriptions, type, helpers };

export default new Schema({
  name: '#{entity.name}',
  items: [connections, mutations, query, subscriptions, type],
});