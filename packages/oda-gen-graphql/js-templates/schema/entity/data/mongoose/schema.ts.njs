<#@ context 'entity' -#>
<#@ alias 'data/schema/mongoose' #>

import * as mongoose from 'mongoose';
<#entity.embedded.forEach(name=>{#>
import #{name} from './../../#{name}/adapter/schema';
<#})#>
export default (args?: {
  schema: mongoose.Schema;
  fieldName: () => string;
  single?: boolean;
}) => {
  let $#{entity.name} = new mongoose.Schema({}, {
    collection: '#{entity.collectionName}',
    autoIndex: process.env.NODE_ENV !== 'production',
  <#-if(entity.strict !== undefined){#>
    strict: #{entity.strict ? 'true' : 'false'},
  <#}#>
  });

  $#{entity.name}.add({
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
  });

  <#- entity.relations.forEach(rel=>{#>
$#{entity.name}.add({
<#if(!rel.embedded){#>
    #{rel.name}: {
      type: #{rel.type},
      <#- if(rel.required){#>
      required: true,
      <#-}#>
    },
<#} else {#>
    #{rel.name}:<#if(!rel.single){#>[<#}#>#{rel.embedded}({ 
      schema: $#{entity.name}, 
      fieldName: ()=> args && args.fieldName ? [args.fieldName(),'#{rel.name}'].join('.') : '#{rel.name}', 
      single: #{rel.single?'true':'false'}})<#if(!rel.single){#>]<#}#>,
<#}#>
});
  <#-})#>

<#for(let index of entity.indexes.filter(f=>!f.options.unique)){
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
<#if(entity.indexes.filter(f=>f.options.unique).length > 0) {#>
  if (args && !args.single) {
    <#for(let index of entity.indexes.filter(f=>f.options.unique)){
    let customIndex = ~['text','2dsphere'].indexOf(index.name) ? `'${index.name}'`: 0;
  -#>

  args.schema.index({
    _id: 1,
<#- for(let field in index.fields){#>
    [args.fieldName ? [args.fieldName(),'#{field}'].join('.') : '#{field}']: #{customIndex || index.fields[field]},<#}#>
  }, {
<#- for(let field in index.options){#>
<#- if(index.options[field]){#>
    #{field}: 1,<# }#>
<#-}#>
  });
<#}-#>
  } else {
<#for(let index of entity.indexes.filter(f=>f.options.unique)){
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
  }
<#}#>
  return $#{entity.name};
};
