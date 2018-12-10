<#@ chunks "$$$main$$$" -#>
<#@ alias 'mutation-index'#>
<#@ context 'ctx'#>

<#-chunkStart(`./mutations/index.ts`); -#>
import create from './create';
import _delete from './delete';
import update from './update';
import embed#{ctx.types.name}Input from './embed#{ctx.types.name}Input';

import { Schema } from '../../../common';

export default new Schema({
  name: '#{ctx.types.name}.mutations',
  items: [create, _delete, update, embed#{ctx.types.name}Input],
});
<#- chunkEnd(); -#>

#{partial(ctx.types, 'mutations-embed')}
#{partial(ctx, 'mutations-create-index')}
#{partial(ctx, 'mutations-delete-index')}
#{partial(ctx, 'mutations-update-index')}



