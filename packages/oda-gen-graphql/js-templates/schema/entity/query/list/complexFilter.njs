<#@ chunks "$$$main$$$" -#>
<#@ alias 'query-list-complex-filter'#>
<#@ context 'entity'#>

<#-chunkStart(`./query/list/${entity.name}ComplexFilter.ts`); -#>
import { Input } from '../../../../common';
import gql from 'graphql-tag';
<#- slot('import-query-list-index-slot',`${entity.name}ComplexFilter`)-#>
<#- slot('item-query-list-index-slot',`${entity.name}ComplexFilter`)-#>
export default new Input({
  schema: gql`
    input #{entity.name}ComplexFilter {
      or: [#{entity.name}ComplexFilter]
      and: [#{entity.name}ComplexFilter]
    <#-entity.filter.forEach((item, index)=>{#>
      #{item}
    <#-})#>
    }
  `,
});
