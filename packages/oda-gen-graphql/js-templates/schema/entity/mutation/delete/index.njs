<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutations-delete-index'#>
<#@ context 'ctx'#>

<#-chunkStart(`./mutations/delete/index.ts`); -#>
import { Schema } from '../../../../common';
import delete#{ctx.types.name} from './delete#{ctx.types.name}';
import delete#{ctx.types.name}Input from './delete#{ctx.types.name}Input';
import delete#{ctx.types.name}Payload from './delete#{ctx.types.name}Payload';

export default new Schema({
  name: '#{ctx.types.name}.mutation.delete',
  items: [delete#{ctx.types.name}, delete#{ctx.types.name}Input, delete#{ctx.types.name}Payload],
});
<#- chunkEnd(); -#>
#{partial(ctx.types, 'mutations-delete-types')}
#{partial(ctx.resolver, 'mutations-delete-mutation')}



