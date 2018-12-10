<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutations-update-mutation'#>
<#@ context 'entity'#>

<#-chunkStart(`./mutations/update/update${entity.name}.ts`); -#>

import {
  logger,
  RegisterConnectors,
  mutateAndGetPayload,
  PubSubEngine,
  Mutation,
  #{slot('import-common-mutation-update-slot')}
} from '../../../../common';
import gql from 'graphql-tag';
import { merge } from 'lodash';

export default new Mutation({
  schema: gql`
    extend type RootMutation {
      update#{entity.name}(input: update#{entity.name}Input!): update#{entity.name}Payload
    }
  `,
  resolver: mutateAndGetPayload( async (args: {
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
    let payload = context.connectors.#{entity.name}.getPayload(args);

    let result;
    let previous;

    if (args.id) {
      previous = await context.connectors.#{entity.name}.findOneById(args.id);
      result = await context.connectors.#{entity.name}.findOneByIdAndUpdate(args.id, merge({}, previous, payload),);
    <#- for (let f of entity.args.update.find) {#>
    } else if (args.#{f.name}) {
      delete payload.#{f.name};
      previous = await context.connectors.#{entity.name}.findOneBy#{f.cName}(args.#{f.name});
      result = await context.connectors.#{entity.name}.findOneBy#{f.cName}AndUpdate(args.#{f.name}, merge({}, previous, payload),);
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
      result = await context.connectors.#{entity.name}.findOneBy#{findBy}AndUpdate(#{loadArgs}, merge({}, previous, payload),);
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

    <#- for (let r of entity.relations.filter(f=>!f.embedded)) {#>
    if (args.#{r.field}Unlink<#if(!r.single){#> && Array.isArray(args.#{r.field}Unlink) && args.#{r.field}Unlink.length > 0<#}#> ) {
    <#if(!r.single){#>
      for (let i = 0, len = args.#{r.field}Unlink.length; i < len; i++) {
    <#}#>
      let $item = args.#{r.field}Unlink<#if(!r.single){#>[i]<#}#>;
      if ($item) {
<# slot('import-common-mutation-update-slot',`ensure${r.ref.entity}`) -#>
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: false,
        });
<# slot('import-common-mutation-update-slot',`unlink${entity.name}From${r.cField}`) -#>
        await unlink#{entity.name}From#{r.cField}({
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
<# slot('import-common-mutation-update-slot',`ensure${r.ref.entity}`) -#>
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: true,
        });

<# slot('import-common-mutation-update-slot',`link${entity.name}To${r.cField}`) -#>
        await link#{entity.name}To#{r.cField}({
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

<# slot('import-common-mutation-update-slot',`ensure${r.ref.entity}`) -#>
        let #{r.field} = await ensure#{r.ref.entity}({
          args: $item,
          context,
          create: false,
        });

<# slot('import-common-mutation-update-slot',`link${entity.name}To${r.cField}`) -#>
        await link#{entity.name}To#{r.cField}({
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
});
