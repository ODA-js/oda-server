<#@ context 'entity' -#>
import * as log4js from 'log4js';
let logger = log4js.getLogger('graphql:mutations:#{entity.name}');

import RegisterConnectors from '../../../../../data/registerConnectors';
import { mutateAndGetPayload } from 'oda-api-graphql';
import { PubSubEngine } from 'graphql-subscriptions';

export const mutation = {
<#- for (let connection of entity.connections) {#>
  addTo#{connection.relationName}: mutateAndGetPayload(
    async (
      args: {
    <#- for (let f of connection.addArgs) {#>
        #{f.name}?: #{f.type},
    <#-}#>
      },
      context: { connectors: RegisterConnectors, pubsub: PubSubEngine },
      info
    ) => {
      logger.trace('addTo#{connection.relationName}');
      let #{entity.ownerFieldName} = args.#{entity.ownerFieldName};
      let #{connection.refFieldName} = args.#{connection.refFieldName};
      let payload = {
        #{entity.ownerFieldName},
        #{connection.refFieldName},
<#-
for (let fname of connection.ref.fields){
  if (fname !== 'id') { #>
        #{fname}: args.#{fname},
<#-
  }
}#>
      };

      await context.connectors.#{entity.name}.addTo#{connection.shortName}(payload);

      let source = await context.connectors.#{entity.name}.findOneById(#{entity.ownerFieldName});

      if (context.pubsub) {
        context.pubsub.publish('#{entity.name}', {
          #{entity.name}: {
            mutation: 'LINK',
            node: source,
            previous: null,
            updatedFields: [],
            payload: {
              args: {
                #{entity.ownerFieldName}: args.#{entity.ownerFieldName},
                #{connection.refFieldName}: args.#{connection.refFieldName},
<#- for (let fname of connection.ref.fields){
  if (fname !== 'id') { #>
                #{fname}: args.#{fname},
<#-
  }
}#>
              },
              relation: '#{connection.name}'
            }
          }
        });
      <#if(connection.opposite){#>
        let dest = await context.connectors.#{connection.refEntity}.findOneById(#{connection.refFieldName});

        context.pubsub.publish('#{connection.refEntity}', {
          #{connection.refEntity}: {
            mutation: 'LINK',
            node: dest,
            previous: null,
            updatedFields: [],
            payload: {
              args: {
                #{entity.ownerFieldName}: args.#{entity.ownerFieldName},
                #{connection.refFieldName}: args.#{connection.refFieldName},
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

  removeFrom#{connection.relationName}: mutateAndGetPayload(
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
      let #{connection.refFieldName} = args.#{connection.refFieldName};
      let payload = {
        #{entity.ownerFieldName},
        #{connection.refFieldName},
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
                #{connection.refFieldName}: args.#{connection.refFieldName},
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
                #{connection.refFieldName}: args.#{connection.refFieldName},
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

<#- } #>
};
