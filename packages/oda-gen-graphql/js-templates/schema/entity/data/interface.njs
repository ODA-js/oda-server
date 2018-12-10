<#@ context 'entity' -#>
<#@ alias 'data/connector/interface' #>

import { Connector } from 'oda-api-graphql';
import { Partial#{ entity.name } } from '../types/model';
<#entity.embedded.forEach(name=>{#>
import {Partial#{name}} from './../../#{name}/types/model';
<#})#>

export interface #{ entity.name }Connector extends Connector<Partial#{ entity.name }>{
<#- for (let f of entity.args.update.find) {
  let ukey = f.name;
  let type = f.type;
#>
  findOneBy#{f.cName}: (#{ukey}: #{type})=> Promise<Partial#{entity.name}>
  findOneBy#{f.cName}AndUpdate: (#{ukey}: #{type}, payload: Partial#{entity.name})=> Promise<Partial#{entity.name}>
  findOneBy#{f.cName}AndRemove: (#{ukey}: #{type})=> Promise<Partial#{entity.name}>
<#}-#>
<#- entity.complexUniqueIndex.forEach(f=> {
  let findBy = f.fields.map(f=>f.uName).join('And');
  let findArgs = f.fields.map(f=>`${f.name}: ${f.type}`).join(', ');
    #>
  findOneBy#{findBy}:(#{findArgs}) => Promise<Partial#{entity.name}>
  findOneBy#{findBy}AndUpdate:(#{findArgs}, payload: Partial#{entity.name}) => Promise<Partial#{entity.name}>
  findOneBy#{findBy}AndRemove:(#{findArgs}) => Promise<Partial#{entity.name}>
  <#});-#>

<#- for (let connection of entity.relations) {#>
  addTo#{ connection.shortName }(args: {
    <#- for (let f of connection.addArgs) {#>
      #{f.name}?: #{f.type},
    <#-}#>
  }): Promise<void>;
  removeFrom#{ connection.shortName }(args: {
    <#- for (let f of connection.addArgs) {#>
      #{f.name}?: #{f.type},
    <#-}#>
  }): Promise<void>;
<#}#>
}