<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutations-create-index'#>
<#@ context 'ctx'#>

<#-chunkStart(`./mutations/create/index.ts`); -#>
import { Schema } from '../../../../common';
import create#{ctx.types.name} from './create#{ctx.types.name}';
import create#{ctx.types.name}Input from './create#{ctx.types.name}Input';
import create#{ctx.types.name}Payload from './create#{ctx.types.name}Payload';
#{slot('import-embed-entity-create-rel-mutation-types')}

export default new Schema({
  name: '#{ctx.types.name}.mutation.create',
  items: [
#{slot('use-embed-entity-create-rel-mutation-types')}
    create#{ctx.types.name}, create#{ctx.types.name}Input, create#{ctx.types.name}Payload,
    ],
});
<#- chunkEnd(); -#>
#{partial(ctx.types, 'mutations-create-types')}
#{partial(ctx.resolver, 'mutations-create-mutation')}



