<#@ context 'entity' -#>
import * as log4js from 'log4js';
let logger = log4js.getLogger('graphql:mutations:#{entity.name}');
import gql from 'graphql-tag';
import RegisterConnectors from '../../../../data/registerConnectors';
import { mutateAndGetPayload } from 'oda-api-graphql';
import { PubSubEngine } from 'graphql-subscriptions';

<#- for (let relEntity of entity.relEntities){#>
async function ensure#{relEntity.name}({
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

  <#- for (let f of relEntity.unique.find) {#>
  } else if (args.#{f.name}) {
    fArgs = '$#{f.name}: #{f.type}';
    filter = '#{f.name}: $#{f.name}';
    variables = {
      #{f.name}: args.#{f.name},
    };
  <#-}#>
  <#- for (let f of relEntity.unique.complex) {
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
  let #{relEntity.findQuery};
  if (filter) {
    #{relEntity.findQuery} = await context.userGQL({
      query: gql`query find#{relEntity.name}(${fArgs}){
            #{relEntity.findQuery}(${filter}){
              id
            }
          }
          `,
      variables,
    }).then(r => r.data.#{relEntity.findQuery});
  }

  if (!#{relEntity.findQuery}) {
    if (create) {
      #{relEntity.findQuery} = await context.userGQL({
        query: gql`mutation create#{relEntity.name}($#{relEntity.findQuery}: create#{relEntity.name}Input!) {
            create#{relEntity.name}(input: $#{relEntity.findQuery}) {
              #{relEntity.findQuery} {
                node {
                  id
                }
              }
            }
          }
          `,
        variables: {
          #{relEntity.findQuery}: {
<#- relEntity.fields.forEach(f=>{#>
            #{f.name}: args.#{f.name},
<#-})#>
          },
        }
      }).then(r => r.data.create#{relEntity.name}.#{relEntity.findQuery}.node);
    }
  } else {
    // update
    #{relEntity.findQuery} = await context.userGQL({
      query: gql`mutation update#{relEntity.name}($#{relEntity.findQuery}: update#{relEntity.name}Input!) {
            update#{relEntity.name}(input: $#{relEntity.findQuery}) {
              #{relEntity.findQuery} {
                id
              }
            }
          }
          `,
      variables: {
        #{relEntity.findQuery}: {
<#- relEntity.fields.forEach(f=>{#>
          #{f.name}: args.#{f.name},
<#-})#>
        },
      }
    }).then(r => r.data.update#{relEntity.name}.#{relEntity.findQuery});
  }
  return #{relEntity.findQuery};
}
<#-}#>

<#- for (let r of entity.relations) {#>

async function linkTo#{r.cField}({
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
          #{r.ref.fieldName}: #{r.field}.id,
<#-r.fields.forEach(f=>{#>
          #{f.name},
<#-})#>
        }
      }
    });
  }
}

async function unlinkFrom#{r.cField}({
  context, #{r.field},  #{entity.ownerFieldName},
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
          #{r.ref.fieldName}: #{r.field}.id,
        }
      }
    });
  }
}

<#-}#>

async function unlink#{entity.name}FromAll(args:{
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
    }).then(r => r.data || r.data.input);

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
        variables: input
      });
    }
  }
}

export const mutation = {
  create#{entity.name}: mutateAndGetPayload( async (args: {
    <#- for (let f of entity.args.create.args) {#>
      #{f.name}?: #{f.type},
    <#-}#>
    <#- for (let r of entity.relations) {#>
      #{r.field}?: object/*#{r.ref.entity}*/<#if(!r.single){#>[]<#}#>,
    <#-}#>
    },
    context: { connectors: RegisterConnectors, pubsub: PubSubEngine },
    info,
  ) => {
    logger.trace('create#{entity.name}');
    let create: any = {
    <#- for (let f of entity.args.create.find) {#>
      #{f.name}: args.#{f.name},
    <#-}#>
    };

    if(args.id) {
      create.id = args.id;
    }

    let result = await context.connectors.#{entity.name}.create(create);

    if (context.pubsub) {
      context.pubsub.publish('#{entity.name}', {
        #{entity.name}: {
          mutation: 'CREATE',
          node: result,
          previous: null,
          updatedFields: [],
          payload: args,
        }
      });
    }

    let #{entity.ownerFieldName}Edge = {
      cursor: result.id,
      node: result,
    };

    <#- for (let r of entity.relations) {#>

    if (args.#{r.field}<#if(!r.single){#> && Array.isArray(args.#{r.field}) && args.#{r.field}.length > 0<#}#> ) {
    <#if(!r.single){#>
      for (let i = 0, len = args.#{r.field}.length; i < len; i++) {
    <#}#>
      let $item = args.#{r.field}<#if(!r.single){#>[i]<#}#> as { id,<#r.fields.forEach(f=>{#> #{f.name},<#})#> };
      if ($item) {
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: true,
        });

        await linkTo#{r.cField}({
          context,
          #{r.field},
          #{entity.ownerFieldName}: result,
          <#-r.fields.forEach(f=>{#>
          #{f.name}: $item.#{f.name},
          <#-})#>
        });
      }
    <#if(!r.single){#>
      }
    <#}#>
    }

    <#-}#>
    return {
      #{entity.ownerFieldName}: #{entity.ownerFieldName}Edge,
    };
  }),

  update#{entity.name}:  mutateAndGetPayload( async (args:  {
    <#- for (let f of entity.args.update.args) {#>
      #{f.name}?: #{f.type},
    <#-}#>
    <#- for (let r of entity.relations) {#>
      #{r.field}?: object/*#{r.ref.entity}*/<#if(!r.single){#>[]<#}#>,
      #{r.field}Unlink?: object/*#{r.ref.entity}*/<#if(!r.single){#>[]<#}#>,
      #{r.field}Create?: object/*#{r.ref.entity}*/<#if(!r.single){#>[]<#}#>,
    <#-}#>
    },
    context: { connectors: RegisterConnectors, pubsub: PubSubEngine },
    info,
  ) => {
    logger.trace('update#{entity.name}');
    let payload = {
    <#- for (let f of entity.args.update.payload) {#>
      #{f.name}: args.#{f.name},
    <#-}#>
    };

    let result;
    let previous;
    if (args.id) {
      previous = await context.connectors.#{entity.name}.findOneById(args.id);
      result = await context.connectors.#{entity.name}.findOneByIdAndUpdate(args.id, payload);
    <#- for (let f of entity.args.update.find) {#>
    } else if (args.#{f.name}) {
      delete payload.#{f.name};
      previous = await context.connectors.#{entity.name}.findOneBy#{f.cName}(args.#{f.name});
      result = await context.connectors.#{entity.name}.findOneBy#{f.cName}AndUpdate(args.#{f.name}, payload);
    <#-}#>
    <#- for (let f of entity.complexUnique) {
      let findBy = f.fields.map(f=>f.uName).join('And');
      let loadArgs = `${f.fields.map(f=>`args.${f.name}`).join(', ')}`;
      let condArgs = `${f.fields.map(f=>`args.${f.name}`).join(' && ')}`;
    #>
    } else if (#{condArgs}) {
      <#-for(let fn of f.fields){#>
      delete payload.#{fn.name};
      <#-}#>
      previous = await context.connectors.#{entity.name}.findOneBy#{findBy}(#{loadArgs});
      result = await context.connectors.#{entity.name}.findOneBy#{findBy}AndUpdate(#{loadArgs}, payload);
    <#-}#>
    }

    if (!result) {
      throw new Error('item of type #{entity.name} is not found for update');
    }

    if (context.pubsub) {
      context.pubsub.publish('#{entity.name}', {
        #{entity.name}: {
          mutation: 'UPDATE',
          node: result,
          previous,
          updatedFields: Object.keys(payload).filter(f => payload[f]!== undefined),
          payload: args,
        }
      });
    }

    <#- for (let r of entity.relations) {#>
    if (args.#{r.field}Unlink<#if(!r.single){#> && Array.isArray(args.#{r.field}Unlink) && args.#{r.field}Unlink.length > 0<#}#> ) {
    <#if(!r.single){#>
      for (let i = 0, len = args.#{r.field}Unlink.length; i < len; i++) {
    <#}#>
      let $item = args.#{r.field}Unlink<#if(!r.single){#>[i]<#}#>;
      if ($item) {
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: false,
        });

        await unlinkFrom#{r.cField}({
          context,
          #{r.field},
          #{entity.ownerFieldName}: result,
        });
      }
    <#if(!r.single){#>
      }
    <#}#>
    }

    if (args.#{r.field}Create<#if(!r.single){#> && Array.isArray(args.#{r.field}Create) && args.#{r.field}Create.length > 0<#}#> ) {
    <#if(!r.single){#>
      for (let i = 0, len = args.#{r.field}Create.length; i < len; i++) {
    <#}#>
      let $item = args.#{r.field}Create<#if(!r.single){#>[i]<#}#> as { id,<#r.fields.forEach(f=>{#> #{f.name},<#})#> };
      if ($item) {
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: true,
        });

        await linkTo#{r.cField}({
          context,
          #{r.field},
          #{entity.ownerFieldName}: result,
          <#-r.fields.forEach(f=>{#>
          #{f.name}: $item.#{f.name},
          <#-})#>
        });
      }
    <#if(!r.single){#>
      }
    <#}#>
    }

    if (args.#{r.field}<#if(!r.single){#> && Array.isArray(args.#{r.field}) && args.#{r.field}.length > 0<#}#> ) {
    <#if(!r.single){#>
      for (let i = 0, len = args.#{r.field}.length; i < len; i++) {
    <#}#>
      let $item = args.#{r.field}<#if(!r.single){#>[i]<#}#> as { id,<#r.fields.forEach(f=>{#> #{f.name},<#})#> };
      if ($item) {
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: false,
        });

        await linkTo#{r.cField}({
          context,
          #{r.field},
          #{entity.ownerFieldName}: result,
          <#-r.fields.forEach(f=>{#>
          #{f.name}: $item.#{f.name},
          <#-})#>
        });
      }
    <#if(!r.single){#>
      }
    <#}#>
    }

    <#-}#>
    return {
      #{entity.ownerFieldName}: result,
    };
  }),

  delete#{entity.name}:  mutateAndGetPayload(async (args: {
    <#- for (let f of entity.args.remove.args) {#>
      #{f.name}?: #{f.type},
    <#-}#>
    <#- for (let f of entity.complexUnique) {
      let args = `${f.fields.map(f=>`${f.name}?: ${f.type}`).join(', ')}`;
      #>
      // #{f.name}
      #{args},
    <#-}#>
    },
    context: {
      connectors: RegisterConnectors,
      pubsub: PubSubEngine,
      userGQL: (args: any)=>Promise<any> },
    info,
  ) => {
    logger.trace('delete#{entity.name}');
    let result;
    if (args.id) {

      await unlink#{entity.name}FromAll([{
        key: 'id',
        type: 'ID',
        value: args.id,
      }],
        context,
      );

      result = await context.connectors.#{entity.name}.findOneByIdAndRemove(args.id);
    <#- for (let f of entity.args.remove.find) {#>
    } else if (args.#{f.name}) {

      await unlink#{entity.name}FromAll([{
        key: '#{f.name}',
        type: '#{f.gqlType}',
        value: args.#{f.name},
      }],
        context,
      );

      result = await context.connectors.#{entity.name}.findOneBy#{f.cName}AndRemove(args.#{f.name});
    <#-}#>
    <#- for (let f of entity.complexUnique) {
      let findBy = f.fields.map(f=>f.uName).join('And');
      let loadArgs = `${f.fields.map(f=>`args.${f.name}`).join(', ')}`;
      let condArgs = `${f.fields.map(f=>`args.${f.name}`).join(' && ')}`;
      #>
    } else if (#{condArgs}) {

      await unlink#{entity.name}FromAll([
        <#-f.fields.forEach((f, i)=>{#>
        <#-if(i>0){#>, <#}#>{
          key: '#{f.name}',
          type: '#{f.gqlType}',
          value: args.#{f.name},
        }
        <#-});-#>],
        context,
      );

      result = await context.connectors.#{entity.name}.findOneBy#{findBy}AndRemove(#{loadArgs});
    <#-}#>
    }

    if (!result) {
      throw new Error('item of type #{entity.name} is not found for delete');
    }

    if (context.pubsub) {
      context.pubsub.publish('#{entity.name}', {
        #{entity.name}: {
          mutation: 'DELETE',
          node: result,
          previous: null,
          updatedFields: [],
          payload: args,
        }
      });
    }

    return {
      deletedItemId: result.id,
      #{entity.ownerFieldName}: result,
    };
  }),
}
;
