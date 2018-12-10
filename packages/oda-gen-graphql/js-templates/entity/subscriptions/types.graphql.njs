<#@ context 'entity' -#>

# Input types for basic CUD

# input type for #{entity.name}
<#if(entity.connections.length > 0){#>
type Update#{entity.name}SubscriptionPayload {
<#} else {#>
type #{entity.name}SubscriptionPayload {
<#}#>
<#- for (let field of entity.update){#>
  #{field.name}: #{field.type}
<#-}#>
}

type #{entity.name}Subscription {
  mutation: MutationKind!
  node: #{entity.name}!
  payload: #{entity.name}SubscriptionPayload
  updatedFields: [String]
  <#-if(entity.connections.length > 0){#>
  previous: Update#{entity.name}SubscriptionPayload
  <#-} else {#>
  previous: #{entity.name}SubscriptionPayload
  <#-}#>
}

<#- if(entity.connections.length > 0) {#>
<#-for ( let connection of entity.connections ) {#>
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

type #{connection.name}SubscriptionPayload {
  args:#{connection.name}ArgsSubscriptionPayload
  relation: String
}
<# }-#>

union #{entity.name}SubscriptionPayload = Update#{entity.name}SubscriptionPayload | <# entity.connections.forEach(function(item, index){-#>
<#- if(index > 0){#> | <#} -#>
#{item.name}SubscriptionPayload
<#- })-#>
<#}-#>