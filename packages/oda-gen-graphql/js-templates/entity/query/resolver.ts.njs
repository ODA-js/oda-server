<#@ context 'entity' -#>
import * as log4js from 'log4js';
let logger = log4js.getLogger('graphql:query');
import {get} from 'lodash';

import RegisterConnectors from '../../../../data/registerConnectors';
import { emptyConnection, pagination, detectCursorDirection, consts } from 'oda-api-graphql';
import { lib } from 'oda-gen-common';

const { selectionTree: traverse } = lib;

import { utils } from 'oda-api-graphql';

const { validId } = utils;

export async function fixCount(length: number, cursor: { skip?: number, limit?: number; }, getCount: () => Promise<Number>) {
  const count = await getCount();
  if (count > 0) {
    if (length == cursor.limit) {
      return count
    }
    if (length < cursor.limit) {
      return cursor.skip + length;
    } else {
      return count;
    }
  }
  return count;
}

export const query: { [key: string]: any } = {
  #{entity.plural}: async (
    owner,
    args: {
      after: string,
      first: number,
      before: string,
      last: number,
      orderBy: string | string[],
      filter: object,
      limit: number,
      skip: number,
    },
    context: { connectors: RegisterConnectors },
    info
  ) => {
    logger.trace('#{entity.plural}');
    let result;
    let selectionSet = traverse(info);

    let idMap = {
      id: '#{entity.adapter == 'mongoose' ? '_id' : 'id'}',
<# entity.idMap.forEach(f=>{-#>
      #{f}: '#{f}',
<#})-#>
    };

    let list = get(selectionSet, 'edges.node') ? await context.connectors.#{entity.name}.getList({
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
          count: get(selectionSet, 'pageInfo.count') ?  await fixCount(list.length, cursor, () => context.connectors.#{entity.name}.getCount({
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
  #{entity.singular}: async (
    owner,
    args: {
    <#- for (let f of entity.unique.args) {#>
      #{f.name}?: #{f.type},
    <#-}#>
    <#- for (let f of entity.unique.complex) {
        let args = `${f.fields.map(f=>`${f.name}?: ${f.type}`).join(', ')}`;
      #>
      // #{f.name}
      #{args},
    <#-}#>
    },
    context: { connectors: RegisterConnectors },
    info
  ) => {
    logger.trace('#{entity.singular}');
    let result;
    if (args.id) {
      result = await context.connectors.#{entity.name}.findOneById(args.id);
    <#- for (let f of entity.unique.find) {#>
    } else if (args.#{f.name}) {
      result = await context.connectors.#{entity.name}.findOneBy#{f.cName}(args.#{f.name});
    <#-}#>
    <#- for (let f of entity.unique.complex) {
      let findBy = f.fields.map(f=>f.uName).join('And');
      let loadArgs = `${f.fields.map(f=>`args.${f.name}`).join(', ')}`;
      let condArgs = `${f.fields.map(f=>`args.${f.name}`).join(' && ')}`;
#>
    } else if (#{condArgs}) {
      result = await context.connectors.#{entity.name}.findOneBy#{findBy}(#{loadArgs});
    <#-}#>
    }
    return result;
  },
};