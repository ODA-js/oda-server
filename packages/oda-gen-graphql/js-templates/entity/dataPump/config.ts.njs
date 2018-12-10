<#@ context 'entity' -#>
<#@ chunks '$$$main$$$' -#>

<# chunkStart(`../../../dataPump/${entity.name}/index`); #>
import imp from './import'
import exp from './export'

export default {
  ...imp,
  ...exp
}

<# chunkStart(`../../../dataPump/${entity.name}/import`); #>

import { utils } from 'oda-api-graphql';

const { validId } = utils;

export default {
  import: {
    queries : {
      #{entity.name}: {
        filter:`
          <#- for(let fld of entity.fields){ #>
          #{fld.name}
          <#-}#>`,
        uploader: {
          findQuery: {
    <#- for (let f of entity.unique) {#>
            #{f.name}: '#{entity.name}/findBy#{f.cName}.graphql',
    <#-}#>
    <#-if(entity.complexUnique && entity.complexUnique.length > 0){#>
    <#- for (let f of entity.complexUnique) {
      let findBy = f.fields.map(f=>f.uName).join('And');
    #>
            #{f.name}: '#{entity.name}/findBy#{findBy}.graphql',
    <#-}#>
    <#-}#>
          },
          // createQuery: '#{entity.name}/create.graphql',
          // updateQuery: '#{entity.name}/update.graphql',
          // dataPropName: '#{entity.ownerFieldName}',
          findVars: {
    <#- for (let f of entity.unique) {
      #>
            #{f.name} : (f) => f.hasOwnProperty('#{f.name}') ? { #{f.name}: f.#{f.name} } : null,
    <#-}#>
    <#-if(entity.complexUnique && entity.complexUnique.length > 0){#>
    <#- for (let f of entity.complexUnique) {
        let resultArgs = `{ ${f.fields.map(f=>`${f.name}: f.${f.name}`).join(', ')} }`;
        let condArgs = `( ${f.fields.map(f=>`f.hasOwnProperty('${f.name}')`).join(' && ')} )`;
    #>
            #{f.name} : (f) => #{condArgs} ? #{resultArgs} : null,
    <#-}#>
    <#-}#>
          }
        }
      }
    },
    relate : {
      #{entity.name}: {
        filter:`
          id
          <#- for(let fld of entity.relations){ #>
          #{fld.field}
          <#-}#>`,
        uploader: {
          findQuery: {
    <#- for (let f of entity.unique) {#>
            #{f.name}: '#{entity.name}/findBy#{f.cName}.graphql',
    <#-}#>
    <#-if(entity.complexUnique && entity.complexUnique.length > 0){#>
    <#- for (let f of entity.complexUnique) {
      let findBy = f.fields.map(f=>f.uName).join('And');
    #>
            #{f.name}: '#{entity.name}/findBy#{findBy}.graphql',
    <#-}#>
    <#-}#>
          },
          // createQuery: '#{entity.name}/create.graphql',
          // updateQuery: '#{entity.name}/update.graphql',
          // dataPropName: '#{entity.ownerFieldName}',
          findVars: {
    <#- for (let f of entity.unique) {
      #>
            #{f.name} : (f) => f.hasOwnProperty('#{f.name}') ? { #{f.name}: f.#{f.name}} : null,
    <#-}#>
    <#-if(entity.complexUnique && entity.complexUnique.length > 0){#>
    <#- for (let f of entity.complexUnique) {
        let resultArgs = `{ ${f.fields.map(f=>`${f.name}: f.${f.name}`).join(', ')} }`;
        let condArgs = `( ${f.fields.map(f=>`f.hasOwnProperty('${f.name}')`).join(' && ')} )`;
    #>
            #{f.name} : (f) => #{condArgs} ? #{resultArgs} : null,
    <#-}#>
    <#-}#>
          }
        }
      }
    },
  },
}
<# chunkStart(`../../../dataPump/${entity.name}/export`); #>
export default {
  export: {
    queries: {
      #{entity.name}: {
        query: '#{entity.name}/list.graphql',
        /*process: (f) => ({
          #{entity.name}: f.viewer.#{entity.dcPlural} ? f.viewer.#{entity.dcPlural}.edges.map(e => ({
            ...e.node,
          <#- for(let fld of entity.relations){ #>
          <#-if(!fld.single){#>
            #{fld.field} : e.node.#{fld.field} ? e.node.#{fld.field}.edges.map(s => ({
              ...s.node,
            })) : [],
          <#-}#>
          <#-}#>
          })) : [],
        }),*/
      }
    }
  }
}