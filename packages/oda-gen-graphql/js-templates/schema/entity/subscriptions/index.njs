<#@ chunks "$$$main$$$" -#>
<#@ alias 'subscriptions-index'#>
<#@ context 'ctx'#>

<#-chunkStart(`./subscriptions/index.ts`); -#>

#{slot('import-subscriptions-slot')}
import { Schema } from '../../../common';

export default new Schema({
  name: '#{ctx.name}.subscriptions',
  items: [
    #{slot('export-subscriptions-slot')}
  ],
});

<#-chunkEnd(); -#>
#{partial(ctx,'subscriptions-item')}
#{partial(ctx,'subscriptions-types')}
