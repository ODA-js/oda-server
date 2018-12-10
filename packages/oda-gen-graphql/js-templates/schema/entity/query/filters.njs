<#@ chunks "$$$main$$$" -#>
<#@ alias 'query-filters'#>
<#@ context 'entity'#>

<#-chunkStart(`./query/filters/${entity.name}Filter.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input #{entity.name}Filter {
      or: [#{entity.name}FilterItem]
      and: [#{entity.name}FilterItem]
    <#-entity.filter.forEach((item, index)=>{#>
      #{item}
    <#-})#>
    }
  `,
});

<#-chunkStart(`./query/filters/${entity.name}FilterItem.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input #{entity.name}FilterItem {
    <#-entity.filter.forEach((item, index)=>{#>
      #{item}
    <#-})#>
    }
  `,
});

<#-chunkStart(`./query/filters/Embed${entity.name}Filter.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input Embed#{entity.name}Filter {
      or: [Embed#{entity.name}FilterItem]
      and: [Embed#{entity.name}FilterItem]
      some: #{entity.name}Filter
      none: #{entity.name}Filter
      every: #{entity.name}Filter
    }
  `,
});

<#-chunkStart(`./query/filters/Embed${entity.name}FilterItem.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input Embed#{entity.name}FilterItem {
      some: #{entity.name}Filter
      none: #{entity.name}Filter
      every: #{entity.name}Filter
    }
  `,
});

<#-chunkStart(`./query/filters/${entity.name}FilterSubscriptionsItem.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input #{entity.name}FilterSubscriptionsItem {
    <#-entity.filter.forEach((item, index)=>{#>
      #{item}
    <#-})#>
    }
  `,
});


<#-chunkStart(`./query/filters/${entity.name}FilterSubscriptions.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input #{entity.name}FilterSubscriptions {
      or: [#{entity.name}FilterSubscriptions]
      and: [#{entity.name}FilterSubscriptions]
      mutation: WhereMutationKind
      node: #{entity.name}FilterSubscriptionsItem
      previous: #{entity.name}FilterSubscriptionsItem
      updatedFields: WhereListOfStrings
    }
  `,
});

<#-chunkStart(`./query/filters/index.ts`); -#>

import Embed#{entity.name}Filter from './Embed#{entity.name}Filter';
import Embed#{entity.name}FilterItem from './Embed#{entity.name}FilterItem';
import #{entity.name}Filter from './#{entity.name}Filter';
import #{entity.name}FilterItem from './#{entity.name}FilterItem';
import #{entity.name}FilterSubscriptions from './#{entity.name}FilterSubscriptions';
import #{entity.name}FilterSubscriptionsItem from './#{entity.name}FilterSubscriptionsItem';
import { Schema } from '../../../../common';

export default new Schema({
  name: '#{entity.name}.queries.filter',
  items: [
    #{entity.name}FilterItem,
    #{entity.name}Filter,
    #{entity.name}FilterSubscriptionsItem,
    #{entity.name}FilterSubscriptions,
    Embed#{entity.name}Filter,
    Embed#{entity.name}FilterItem,
  ],
});
