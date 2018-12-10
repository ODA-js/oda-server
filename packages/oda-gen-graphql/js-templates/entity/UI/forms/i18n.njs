<#@ context "entity" -#>
<#@ alias 'forms-i18n' -#>
<# const rels = entity.relations.filter(r=>!r.single && !r.ref.embedded); #>

export default {
  resources: {
    #{entity.name}: {
      summary: 'Summary',
      name: '#{entity.title} |||| #{ entity.titlePlural || entity.plural }',
      listName: '#{entity.name} |||| #{entity.plural}',
      fields: {

<#entity.props.forEach(f=>{
  if(!f.ref && !f.inheritedFrom){
-#>
        #{f.name}: '#{f.label}',
<#} else if(f.ref && !f.inheritedFrom) {-#>
        #{f.field}: '#{f.label}',
<#}
})-#>
      },
      actions:{
<# entity.actions.forEach(action=>{#>
        #{action.name}: '#{action.title}',
<#-})#>
<# rels.forEach(rel=>{#>
  #{rel.field}: 'Add to #{rel.cField}',
<#-})#>
      },
    }
  },
}