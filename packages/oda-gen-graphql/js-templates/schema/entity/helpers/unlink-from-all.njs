<#@ chunks "$$$main$$$" -#>
<#@ alias 'entity-helpers-unlink-from-all'#>
<#@ context 'entity'#>

<#- for (let r of entity.relations.filter(f=>!f.embedded)) {#>
<#-chunkStart(`./helpers/link${entity.name}To${r.cField}.ts`); -#>
import gql from 'graphql-tag';
<# slot('import-helpers-index-slot',`link${entity.name}To${r.cField}`) #>
<# slot('export-helpers-index-slot',`link${entity.name}To${r.cField}`) #>
export default async function link#{entity.name}To#{r.cField}({
  context,
  #{r.field},
  #{entity.ownerFieldName},
<#-r.fields.forEach(f=>{#>
  #{f.name},
<#-})#>
}) {
  if (#{r.field}) {
    await context.userGQL({
      query: gql`mutation addTo#{r.name}($input:addTo#{r.name}Input!) {
          addTo#{r.name}(input:$input){
            #{entity.ownerFieldName} {
              id
            }
          }
        }`,
      variables: {
        input: {
          #{entity.ownerFieldName}: #{entity.ownerFieldName}.id,
          #{r.ref.fieldName}: #{r.field}<#if(!r.embedded){#>.id<#}#>,
<#-r.fields.forEach(f=>{#>
          #{f.name},
<#-})#>
        }
      }
    });
  }
}

<#-chunkStart(`./helpers/unlink${entity.name}From${r.cField}.ts`); -#>
import gql from 'graphql-tag';
<# slot('import-helpers-index-slot',`unlink${entity.name}From${r.cField}`) #>
<# slot('export-helpers-index-slot',`unlink${entity.name}From${r.cField}`) #>
export default async function unlink#{entity.name}From#{r.cField}({
  context, 
  #{r.field},
  #{entity.ownerFieldName},
}) {
  if (#{r.field}) {
    await context.userGQL({
      query: gql`mutation removeFrom#{r.name}($input: removeFrom#{r.name}Input!) {
          removeFrom#{r.name}(input:$input){
            #{entity.ownerFieldName} {
              id
            }
          }
        }`,
      variables: {
        input: {
          #{entity.ownerFieldName}: #{entity.ownerFieldName}.id,
          <#-if(!r.embedded){#>
          #{r.ref.fieldName}: #{r.field}.id,
          <#-}#>
        }
      }
    });
  }
}
<#-}#>

<#-chunkStart(`./helpers/unlink${entity.name}FromAll.ts`); -#>
import {
  logger,
} from '../../../common';
import gql from 'graphql-tag';
<# slot('import-helpers-index-slot',`unlink${entity.name}FromAll`) #>
<# slot('export-helpers-index-slot',`unlink${entity.name}FromAll`) #>

export default async function unlink#{entity.name}FromAll(args:{
  key,
  type,
  value,
}[],
  context: {userGQL: (args: any)=>Promise<any>},
){
  if (args.length > 0 && context) {

    const variables = args.reduce((res, cur) => {
      res[cur.key] = cur.value;
      return res;
    }, {});

    const qArgs = args.reduce((res, cur) => {
      res.push(`$${cur.key}: ${cur.type}`);
      return res;
    }, []).join(',');

    const pArgs = args.reduce((res, cur) => {
      res.push(`${cur.key}: $${cur.key}`);
      return res;
    }, []).join(',');
    const unlinkFragment = gql`
      fragment Unlink#{entity.name} on #{entity.name} {
        id
        <#- for(let fld of entity.relations){ #>
        #{fld.field}Unlink: #{fld.field}<#-if(fld.single){#>{
          id
        }
      <#-} else {#>@_(get: "edges"){
          edges @_(map: "node"){
            node {
              id
            }
          }
        }
          <#-}#>
        <#-}#>
      }
    `;
    const input = await context.userGQL({
        query: gql`
          query getUnlink(${qArgs}) {
          input: #{entity.ownerFieldName}(${pArgs}){
            ...Unlink#{entity.name}
          }
        }
        ${unlinkFragment}
        `,
      variables,
    }).then(r => r.data && r.data.input);

    if(input){
      await context.userGQL({
        query: gql`
        mutation unlink($input: update#{entity.name}Input!) {
          update#{entity.name}(input: $input) {
            #{entity.ownerFieldName} {
              ...Unlink#{entity.name}
            }
          }
        }
        ${unlinkFragment}
        `,
        variables: {input}
      });
    }
  }
}
