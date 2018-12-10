<#@ context 'entity' -#>
<#@ alias 'data/model' #>

<#entity.embedded.forEach(name=>{-#>
import {I#{name}} from './../../#{name}/types/model';
<#})#>

export interface I#{entity.name} {
  <#- entity.fields.forEach(field => { #>
  #{field.name}<#- if(!field.required){#>?<#-}#>: #{field.type};
  <#- })#>
}

export class #{entity.name} implements I#{entity.name}{
  public __type: '#{entity.name}' = '#{entity.name}';
  <#- entity.fields.forEach(field => { #>
  public #{field.name}<#- if(!field.required){#>?<#-}#>: #{field.type};
  <#- })#>
  constructor(init: Partial#{entity.name}){
  <#- entity.fields.forEach(field => { #>
  this.#{field.name} = init.#{field.name};
  <#- })#>
  }
}

export function is#{entity.name}(obj): obj is I#{entity.name} {
  return obj instanceof #{entity.name} || obj.__type === '#{entity.name}' || (
  <#- entity.fields.forEach((field, index) => { -#>
  <#- if(index > 0){#> || <#}#>  obj.#{field.name}
  <#- })#>
  )
}

export type Partial#{entity.name} = {
  [P in keyof I#{entity.name}]?: I#{entity.name}[P]
}

export interface I#{entity.name}Edge {
  cursor: String;
  node: I#{entity.name};
}

export interface I#{entity.name}Connection {
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
    count?: number;
  };
  edges: I#{entity.name}Edge[];
}




