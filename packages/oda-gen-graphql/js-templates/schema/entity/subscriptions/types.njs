<#@ chunks "$$$main$$$" -#>
<#@ alias 'subscriptions-types'#>
<#@ context 'entity' -#>

<# const hasConnections = entity.connections.length > 0; #>
<#-chunkStart(`./subscriptions/${hasConnections ? 'Update' : ''}${entity.name}SubscriptionPayload.ts`); -#>
<#- slot('export-subscriptions-slot',`${hasConnections ? 'Update' : ''}${entity.name}SubscriptionPayload`) #>
<#- slot('import-subscriptions-slot',`${hasConnections ? 'Update' : ''}${entity.name}SubscriptionPayload`) #>

import { ModelType, Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  type: ModelType.type,
  schema: gql`
    <#if(hasConnections){#>
    type Update#{entity.name}SubscriptionPayload {
    <#} else {#>
    type #{entity.name}SubscriptionPayload {
    <#}#>
    <#- for (let field of entity.update){#>
      #{field.name}: #{field.type}
    <#-}#>
    }
  `,
});

<#-chunkStart(`./subscriptions/${entity.name}Subscription.ts`); -#>
<#- slot('export-subscriptions-slot',`${entity.name}Subscription`) #>
<#- slot('import-subscriptions-slot',`${entity.name}Subscription`) #>
import { ModelType, Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  type: ModelType.type,
  schema: gql`
    type #{entity.name}Subscription {
      mutation: MutationKind!
      node: #{entity.name}!
      payload: #{entity.name}SubscriptionPayload
      updatedFields: [String]
      <#-if(hasConnections){#>
      previous: Update#{entity.name}SubscriptionPayload
      <#-} else {#>
      previous: #{entity.name}SubscriptionPayload
      <#-}#>
    }
  `,
});

<#- if(hasConnections) {#>
<#-for ( let connection of entity.connections ) {#>
<#-chunkStart(`./subscriptions/${connection.name}ArgsSubscriptionPayload.ts`); -#>
<#- slot('export-subscriptions-slot',`${connection.name}ArgsSubscriptionPayload`) #>
<#- slot('import-subscriptions-slot',`${connection.name}ArgsSubscriptionPayload`) #>

import { ModelType, Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  type: ModelType.type,
  schema: gql`
    type #{connection.name}ArgsSubscriptionPayload {
      #{entity.ownerFieldName}:ID!
      #{connection.refFieldName}:ID!
    <#- if (connection.fields.length > 0){#>
      #additional Edge fields
    <# connection.fields.forEach(f=>{-#>
      #{f.name}: #{f.type}
    <# });-#>
    <#-}#>
    }
  `,
});

<#-chunkStart(`./subscriptions/${connection.name}SubscriptionPayload.ts`); -#>
<#- slot('export-subscriptions-slot',`${connection.name}SubscriptionPayload`) #>
<#- slot('import-subscriptions-slot',`${connection.name}SubscriptionPayload`) #>
import { ModelType, Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  type: ModelType.type,
  schema: gql`
    type #{connection.name}SubscriptionPayload {
      args:#{connection.name}ArgsSubscriptionPayload
      relation: String
    }
  `,
});
<# }-#>

<#-chunkStart(`./subscriptions/${entity.name}SubscriptionPayload.ts`); -#>
<#- slot('export-subscriptions-slot',`${entity.name}SubscriptionPayload`) #>
<#- slot('import-subscriptions-slot',`${entity.name}SubscriptionPayload`) #>
import { ModelType, Type } from '../../../common';
import gql from 'graphql-tag';

export default new Type({
  type: ModelType.type,
  schema: gql`
    union #{entity.name}SubscriptionPayload = Update#{entity.name}SubscriptionPayload | <# entity.connections.forEach(function(item, index){-#>
    <#- if(index > 0){#> | <#} -#>
    #{item.name}SubscriptionPayload
    <#- })-#>
  `,
    resolver : {
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
});

<#}-#>