<#@ chunks "$$$main$$$" -#>
<#@ alias 'query-list'#>
<#@ context 'ctx'#>

<#-chunkStart(`./query/list/${ctx.entry.singularEntry}Items.ts`); -#>
<#- slot('import-query-list-index-slot',`${ctx.entry.singularEntry}Items`)-#>
<#- slot('item-query-list-index-slot',`${ctx.entry.singularEntry}Items`)-#>
import {
  Query,
  logger,
  RegisterConnectors,
} from '../../../../common';
import gql from 'graphql-tag';

export default new Query({
  schema: gql`
    extend type RootQuery {
      #{ctx.entry.singularEntry}Items( after: String, first: Int, before: String, last: Int, limit: Int, skip: Int, orderBy: [#{ctx.entry.name}SortOrder], filter: #{ctx.entry.name}ComplexFilter): [#{ctx.entry.name}]
    }
  `,
  resolver: async (
    owner,
    args: {
      after: string,
      first: number,
      before: string,
      last: number,
      limit: number,
      skip: number,
      orderBy: string | string[],
      filter: object,
    },
    context: { connectors: RegisterConnectors },
    info
  ) => {
    logger.trace('#{ctx.resolver.plural}');
    let idMap = {
      id: '#{ctx.resolver.adapter == 'mongoose' ? '_id' : 'id'}',
<# ctx.resolver.idMap.forEach(f=>{-#>
      #{f}: '#{f}',
<#})-#>
    };
    return await context.connectors.#{ctx.resolver.name}.getList({
      ...args,
      idMap,
    });
  },
});

<#- chunkStart(`./query/list/${ctx.entry.pluralEntry}.ts`); -#>
<#- slot('import-query-list-index-slot',`${ctx.entry.pluralEntry}`)-#>
<#- slot('item-query-list-index-slot',`${ctx.entry.pluralEntry}`)-#>
import {
  Query,
  logger,
  RegisterConnectors,
  get,
  traverse,
  pagination,
  detectCursorDirection,
  fixCount,
  consts,
  emptyConnection,
} from '../../../../common';
import gql from 'graphql-tag';

export default new Query({
  schema: gql`
    extend type RootQuery {
      #{ctx.entry.pluralEntry}( after: String, first: Int, before: String, last: Int, limit: Int, skip: Int, orderBy: [#{ctx.entry.name}SortOrder], filter: #{ctx.entry.name}ComplexFilter): #{ctx.entry.plural}Connection
    }
  `,
  resolver: async (
    owner,
    args: {
      after: string,
      first: number,
      before: string,
      last: number,
      limit: number,
      skip: number,
      orderBy: string | string[],
      filter: object,
    },
    context: { connectors: RegisterConnectors },
    info
  ) => {
    logger.trace('#{ctx.resolver.plural}');
    let result;
    let selectionSet = traverse(info);

    let idMap = {
      id: '#{ctx.resolver.adapter == 'mongoose' ? '_id' : 'id'}',
<# ctx.resolver.idMap.forEach(f=>{-#>
      #{f}: '#{f}',
<#})-#>
    };

    let list = get(selectionSet, 'edges.node') ? await context.connectors.#{ctx.resolver.name}.getList({
      ...args,
      idMap,
    }) : [];

    if (list.length > 0) {
      let cursor = pagination(args);
      let direction = detectCursorDirection(args)._id;

      let edges = get(selectionSet, 'edges') ?
        list.map(l => {
          return {
            cursor: l.id,
            node: l,
          };
        }) : null;

      let pageInfo = get(selectionSet, 'pageInfo') ?
        {
          startCursor: get(selectionSet, 'pageInfo.startCursor')
            ? edges[0].cursor : undefined,
          endCursor: get(selectionSet, 'pageInfo.endCursor')
            ? edges[edges.length - 1].cursor : undefined,
          hasPreviousPage: get(selectionSet, 'pageInfo.hasPreviousPage') ? (direction === consts.DIRECTION.BACKWARD ? list.length === cursor.limit : false) : undefined,
          hasNextPage: get(selectionSet, 'pageInfo.hasNextPage') ? (direction === consts.DIRECTION.FORWARD ? list.length === cursor.limit : false) : undefined,
          count: get(selectionSet, 'pageInfo.count') ?  await fixCount(list.length, cursor, () => context.connectors.#{ctx.resolver.name}.getCount({
              ...args,
              idMap,
            })) : 0,
        } : null;

      result = {
        edges,
        pageInfo,
      };
    } else {
      result = emptyConnection();
    }
    return result;
  },
});
