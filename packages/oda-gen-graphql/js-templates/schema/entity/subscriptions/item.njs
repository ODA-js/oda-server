<#@ chunks "$$$main$$$" -#>
<#@ alias 'subscriptions-item'#>
<#@ context 'entity'#>

<#-chunkStart(`./subscriptions/${entity.name}.ts`); -#>
<#- slot('export-subscriptions-slot',entity.name) #>
<#- slot('import-subscriptions-slot',entity.name) #>

import { ModelType, Subscription, Filter, filterIt, pubsub, withFilter } from '../../../common';
import gql from 'graphql-tag';

export default new Subscription({
  type: ModelType.type,
  schema: gql`
    extend type RootSubscription {
      #{entity.name}(filter: #{entity.name}FilterSubscriptions): #{entity.name}Subscription
    }
  `,
  resolver: {
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
      id: 'id',
<# relFields.forEach(f=>{-#>
      #{f}: '#{f}',
<#})-#>
    }),
  },
});