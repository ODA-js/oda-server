<#@ context 'entity' -#>
import * as mongoose from 'mongoose';

export default () => {
  let $#{entity.name} = new mongoose.Schema({
<#- entity.fields.forEach(field => { #>
    #{field.name}: {
      type: #{field.type},
      <#- if(field.required){#>
      required: true,
      <#-}#>
      <#- if(field.defaultValue){#>
      default: #{field.defaultValue},
      <#-}#>
    },
  <#- })#>
  <#- entity.relations.forEach(rel=>{#>
    #{rel.name}: {
      type: #{rel.type},
      <#- if(rel.required){#>
      required: true,
      <#-}#>
    },
  <#-})#>
  }, {
    collection: '#{entity.collectionName}',
    autoIndex: process.env.NODE_ENV !== 'production',
  <#-if(entity.strict !== undefined){#>
    strict: #{entity.strict ? 'true' : 'false'},
  <#}#>
  });

<#for(let i = 0, len = entity.indexes.length; i < len; i++){
    let index = entity.indexes[i];
    let customIndex = ~['text','2dsphere'].indexOf(index.name) ? `'${index.name}'`: 0;
  -#>

  $#{entity.name}.index({
<#- for(let field in index.fields){#>
    #{field}: #{customIndex || index.fields[field]},<#}#>
  }, {
<#- for(let field in index.options){#>
<#- if(index.options[field]){#>
    #{field}: 1,<# }#>
<#-}#>
  });
<#}-#>

  return $#{entity.name};
};
