<#@ context "ctx" -#>
<#@ alias 'edit-field' -#>
<#-
const {entity, f} = ctx;
-#>
<#if(f.inheritedFrom){-#>
  uix.#{f.inheritedFrom}.Fragments.#{f.name}.edit({uix, source})
<#} else {#>
<#-
const type = `${f.derived ? 'Derived(${f.type})' :f.type}`;
-#>
<uix.primitive.#{type}.input
  <#-if(f.defaultValue){#>
  defaultValue={#{f.defaultValue}}<#}#>
  key="resources.#{entity.name}.fields.#{f.name}"
  label="resources.#{entity.name}.fields.#{f.name}"
  source={`${source}#{f.source}`}
  <# if (!f.required){-#>
  allowEmpty<#} else {-#>
  validate={uix.required()}<#}#> 
/>
<#-}-#>
