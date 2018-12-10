<#@ chunks "$$$main$$$" -#>
<#@ alias 'query-index'#>
<#@ context 'ctx'#>

<#-chunkStart(`./query/item/index.ts`); -#>
import #{ctx.entry.singularEntry} from './#{ctx.entry.singularEntry}';
import #{ctx.entry.singularEntry}UniqueKeys from './#{ctx.entry.singularEntry}UniqueKeys';
import { Schema } from '../../../../common';

export default new Schema({
  name: '#{ctx.entry.name}.queries.single',
  items: [#{ctx.entry.singularEntry}, #{ctx.entry.singularEntry}UniqueKeys],
});

<#-chunkStart(`./query/list/index.ts`); -#>
#{slot('import-query-list-index-slot')}
import { Schema } from '../../../../common';
export default new Schema({
  name: '#{ctx.entry.name}.queries.list',
  items: [
    #{slot('item-query-list-index-slot')}
  ],
});

<#-chunkStart(`./query/index.ts`); -#>

import list from './list';
import item from './item';
import filters from './filters';

import { Schema } from '../../../common';

export default new Schema({
  name: '#{ctx.entry.name}.query',
  items: [list, item, filters],
});

<#- chunkEnd(); -#>

#{partial(ctx,'query-single')}
#{partial(ctx,'query-list')}
#{partial(ctx.sortOrder,'query-list-sort-order')}
#{partial(ctx.filter,'query-list-complex-filter')}
#{partial(ctx.filter,'query-filters')}
