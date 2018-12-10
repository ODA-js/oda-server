<#@ context 'entity' -#>
import * as log4js from 'log4js';
let logger = log4js.getLogger('graphql:mutations:#{entity.name}');

import { mutateAndGetPayload, Filter } from 'oda-api-graphql';
import { pubsub } from '../../../../../model/pubsub';
import { withFilter } from 'graphql-subscriptions';

function filterIt(payload, queryCheck) {
  return queryCheck(payload);
}

export const subscriptions = {
  #{entity.name}: {
    subscribe: Filter.withContext(withFilter(() => pubsub.asyncIterator('#{entity.name}'), ({ #{entity.name} }, args, context, info) => {
      let allow = context.connectors.#{entity.name}.secure('read', { source: #{entity.name}.node });
      if (allow) {
        return filterIt(#{entity.name}, context.queryCheck);
      } else {
        return false;
      }
    }),{
<# let relFields = entity.
  relations
  .filter(f => f.ref.type === 'ID' && f.verb === 'BelongsTo')
  .map(f=>f.field);-#>
      id: '_id',
<# relFields.forEach(f=>{-#>
      #{f}: '#{f}',
<#})-#>
    }),
  },
};

export const resolver = {
  <#if(entity.connections.length > 0){#>
  #{entity.name}SubscriptionPayload : {
    __resolveType(obj, context, info) {
      if (
  <#-entity.unionCheck.forEach((fname, index)=>{-#><#-if(index > 0){#> || <#}-#>obj.#{fname}
  <#-})-#>) {
        return "Update#{entity.name}SubscriptionPayload";
      }
  <#-for ( let connection of entity.connections ) {#>
      if (obj.args && obj.args.#{entity.ownerFieldName} && obj.args.#{connection.refFieldName}) {
        return "#{connection.name}SubscriptionPayload";
      }
  <#-}#>
      return null;
    }
  },
  <#}#>
};
