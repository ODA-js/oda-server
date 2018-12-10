<#@ chunks "$$$main$$$" -#>
<#@ context 'entity'#>
<#@ alias 'entity-helpers-ensure-entity'#>

<#- chunkStart(`./helpers/ensure${entity.name}.ts`); -#>
import gql from 'graphql-tag';
<# slot('import-helpers-index-slot',`ensure${entity.name}`) #>
<# slot('export-helpers-index-slot',`ensure${entity.name}`) #>
export default async function ensure#{entity.name}({
  args, context, create
}) {
  // find
  let filter;
  let fArgs;
  let variables;
  if (args.id) {
    fArgs = '$id: ID';
    filter = 'id: $id';
    variables = {
      id: args.id,
    };

  <#- for (let f of entity.unique.find) {#>
  } else if (args.#{f.name}) {
    fArgs = '$#{f.name}: #{f.type}';
    filter = '#{f.name}: $#{f.name}';
    variables = {
      #{f.name}: args.#{f.name},
    };
  <#-}#>
  <#- for (let f of entity.unique.complex) {
    let condArgs = `${f.fields.map(f=>`args.${f.name}`).join(' && ')}`;
    let fArgs = f.fields.map(fld=>`$${fld.name}: ${fld.type}`).join(', ');
    let filter = f.fields.map(fld=>`${fld.name}: $${fld.name}`).join(', ');
    #>
  } else if (#{condArgs}) {
    fArgs = '#{fArgs}';
    filter  ='#{filter}';
    variables = {
    <#- f.fields.forEach((fld, indx)=>{#>
      #{fld.name}: args.#{fld.name},
    <#-})#>
    };
  <#-}#>
  }
  let #{entity.findQuery};
  if (filter) {
    #{entity.findQuery} = await context.userGQL({
      query: gql`query find#{entity.name}(${fArgs}){
            #{entity.findQuery}(${filter}){
              id
            }
          }
          `,
      variables,
    }).then(r => r.data.#{entity.findQuery});
  }

  if (!#{entity.findQuery}) {
    if (create) {
      #{entity.findQuery} = await context.userGQL({
        query: gql`mutation create#{entity.name}($#{entity.findQuery}: create#{entity.name}Input!) {
            create#{entity.name}(input: $#{entity.findQuery}) {
              #{entity.findQuery} {
                node {
                  id
                }
              }
            }
          }
          `,
        variables: {
          #{entity.findQuery}: {
<#- entity.fields.forEach(f=>{#>
            #{f.name}: args.#{f.name},
<#-})#>
          },
        }
      }).then(r => r.data.create#{entity.name}.#{entity.findQuery}.node);
    }
  } else {
    // update
    #{entity.findQuery} = await context.userGQL({
      query: gql`mutation update#{entity.name}($#{entity.findQuery}: update#{entity.name}Input!) {
            update#{entity.name}(input: $#{entity.findQuery}) {
              #{entity.findQuery} {
                id
              }
            }
          }
          `,
      variables: {
        #{entity.findQuery}: {
<#- entity.fields.forEach(f=>{#>
          #{f.name}: args.#{f.name},
<#-})#>
        },
      }
    }).then(r => r.data.update#{entity.name}.#{entity.findQuery});
  }
  return #{entity.findQuery};
}
