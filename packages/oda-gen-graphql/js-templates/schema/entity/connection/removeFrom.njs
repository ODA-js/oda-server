<#@ chunks "$$$main$$$" -#>
<#@ alias 'connection-mutations-removeFrom'#>
<#@ context 'ctx'#>

<#- 
const {entity, connection} = ctx;
chunkStart(`./connections/removeFrom${connection.relationName}.ts`); -#>
<# slot('import-connection-index-slot',`removeFrom${connection.relationName}`) #>
<# slot('export-connection-index-slot',`removeFrom${connection.relationName}`) #>
import {
  logger,
  RegisterConnectors,
  mutateAndGetPayload,
  PubSubEngine,
  Mutation,
} from '../../../common';
import gql from 'graphql-tag';

export default new Mutation({
  schema: gql`
    extend type RootMutation {
      removeFrom#{connection.relationName}(
        input: removeFrom#{connection.relationName}Input
      ): removeFrom#{connection.relationName}Payload
    }
  `,
  resolver: mutateAndGetPayload(
    async (
      args: {
      <#- for (let f of connection.removeArgs) {#>
        #{f.name}?: #{f.type},
      <#-}#>
      },
      context: { connectors: RegisterConnectors, pubsub: PubSubEngine },
      info
    ) => {
      logger.trace('removeFrom#{connection.relationName}');
      let #{entity.ownerFieldName} = args.#{entity.ownerFieldName};
      <#if(!connection.embedded){-#>
      let #{connection.refFieldName} = args.#{connection.refFieldName};
      <#-}#>
      let payload = {
        #{entity.ownerFieldName},
        <#if(!connection.embedded){-#>
        #{connection.refFieldName},
        <#-}#>
      };
      await context.connectors.#{entity.name}.removeFrom#{connection.shortName}(payload);

      let source = await context.connectors.#{entity.name}.findOneById(#{entity.ownerFieldName});

      if (context.pubsub) {
        context.pubsub.publish('#{entity.name}', {
          #{entity.name}: {
            mutation: 'UNLINK',
            node: source,
            previous: null,
            updatedFields: [],
            payload: {
              args: {
                #{entity.ownerFieldName}: args.#{entity.ownerFieldName},
                <#-if(!connection.embedded){#>
                #{connection.refFieldName}: args.#{connection.refFieldName},
                <#}-#>
              },
              relation: '#{connection.name}'
            }
          }
        });

      <#if(connection.opposite){#>
        let dest = await context.connectors.#{connection.refEntity}.findOneById(#{connection.refFieldName});

        context.pubsub.publish('#{connection.refEntity}', {
          #{connection.refEntity}: {
            mutation: 'UNLINK',
            node: dest,
            previous: null,
            updatedFields: [],
            payload: {
              args: {
                #{entity.ownerFieldName}: args.#{entity.ownerFieldName},
                <#-if(!connection.embedded){#>
                #{connection.refFieldName}: args.#{connection.refFieldName},
                <#-}#>
              },
              relation: '#{connection.opposite}'
            }
          }
        });
      <#}#>
    }

    return {
      #{entity.ownerFieldName}: source,
    };
  }),
});
