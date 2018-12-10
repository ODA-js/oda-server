<#@ context 'items' -#>
<#@ alias 'use-action-type-func' -#>
<#-if(items.length > 0){-#>
 const actionType = consts.actionType;
<#-}-#>