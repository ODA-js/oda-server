<#@ context 'entity' -#>
<#@ chunks '$$$main$$$' -#>

<#- chunkStart(`../../../${entity.name}/queries/index`); -#>
<#- if(entity.relations.length > 0){#>
import { data } from 'oda-ra-data-provider';
<#}-#>
import { fragments, queries } from './queries';
import {set} from 'lodash';

export default {
  queries,
  fragments,
  name: '#{entity.name}',
  role: '#{entity.role}',
  fields: {
  <#- entity.fields.forEach(f => {#>
    #{f.name}: { type: '#{f.resourceType}' },
  <#-})#>
  <#- entity.relations.forEach(f => {#>
    #{f.field}: {
      ref: {
        resource: '#{f.ref.entity}',
        <#-if(f.ref.embedded){#>
        embedded:true,
        <#-}#>
        type: data.resource.interfaces.refType.#{f.verb},
      },
    },
  <#-})#>
  },
  operations: {
    GET_LIST: {
      filterBy: (params, operation) => Object.keys(params.filter).reduce((acc, key) => {
        if (key === 'ids') {
          return { ...acc, id: { in: params.filter[key] } };
        }
        if (key === 'q') {
<#-if (Array.isArray(entity.UI.quickSearch) && entity.UI.quickSearch.length > 0){#>
          return { ...acc,
            or: [
<#- entity.UI.quickSearch.forEach(sf=>{ #>
              { #{sf}: { imatch: params.filter[key] } },
<# });-#>
            ]
          };
<#-} else {#>
          return acc;
<#-}#>
        }
<#entity.relations.filter(f=>f.ref.embedded).forEach(f=>{#>
        if(key === '#{f.name}'){
          const filter = operation.resource.resourceContainer.resources.#{f.ref.entity}.operations.GET_LIST.filterBy({filter:params.filter[key]}, operation);
          return set(acc, key, filter);
        } 
<#})#>
        return set(acc, key.replace('-', '.'), params.filter[key]);
      }, {}),
    },
    // GET_ONE: {},
    // GET_MANY: {},
    // GET_MANY_REFERENCE: {},
    // CREATE: {},
    // UPDATE: {},
    // DELETE: {},
  },
};

<#- chunkStart(`../../../${entity.name}/queries/queries`); -#>
import gql from 'graphql-tag';
// fragments

export const fragments = {
  #{entity.name}Result: (frg) => gql`fragment #{entity.name}Result on #{entity.name} {
<# entity.fields.forEach( f=> {-#>
    #{f.name}
<#})-#>
<# entity.relations.forEach(f => {
  const embedded = entity.UI.embedded.hasOwnProperty(f.field);
-#>
<#- if(f.ref.embedded){-#>
    #{f.field}{
      ...#{f.ref.entity}Result
    }
<#} else if(f.single) {#>
    #{f.field}: #{f.field} <#if(!embedded) {#>@_(get:"id")<#}#>
     {
<# if(embedded){#>
      ...#{f.ref.entity}Result
<#} else {-#>
      id
<#}#>      
    }
<#-} else {#>
    #{f.field}: #{f.field} @_(get:"edges") {
      edges @_( <#if(embedded) {#>each: {assign:"node"}<#} else {#>map:"node"<#}#> ) {
<#- embedded && f.ref.fields.forEach(fld=>{#>
        #{fld.name}
<#-})#>
        node <#if(!embedded) {#>@_(get:"id") <#}#> {
<# if(embedded){#>
          ...#{f.ref.entity}Result
<#} else {-#>
          id
<#}#>  
        }
      }
    }
<#-}-#>
<#-})-#>
  }
<# entity.relations.filter(f=>entity.UI.embedded.hasOwnProperty(f.field)).forEach(f => {-#>
  ${frg.#{f.ref.entity}Result(frg)}
<#})#>
  `,
  #{entity.name}Full: (frg) => gql`fragment #{entity.name}Full on #{entity.name} {
<# entity.fields.forEach( f=> {-#>
    #{f.name}
<#})-#>
<# entity.relations.forEach( f=> {
  const embedded = entity.UI.embedded.hasOwnProperty(f.field);
-#>
    #{f.field} {
<# if(f.ref.embedded){#>
      ...#{f.ref.entity}Full
<#} else if(f.single) {#>
<# if(embedded){-#>
      ...#{f.ref.entity}Full
<#} else {-#>
      id
<#}-#>  
    <#} else {#>
      edges {
<#- embedded && f.ref.fields.forEach(fld=>{#>
        #{fld.name}
<#-})#>
        node {
<# if(embedded){-#>
          ...#{f.ref.entity}Full
<#} else {-#>
          id
<#}-#>  
        }
      }
    <#}#>}
<#})-#>
  }
<# entity.relations.filter(f=>entity.UI.embedded.hasOwnProperty(f.field)).forEach(f => {-#>
  ${frg.#{f.ref.entity}Full(frg)}
<#})#>
  `,
}

export const queries = {
  // getList
  getListResult: (frg ) => gql`query getListOf#{entity.name}Result {
    items {
      total: pageInfo @_(get:"count") {
        count
      }
      data: edges @_(each: {assign:"node"}) {
        node {
          ...#{entity.name}Result
        }
      }
    }
  }
  ${frg.#{entity.name}Result(frg)}
  `,
  getList: (frg) => gql`query getListOf#{entity.name}($skip: Int, $limit: Int, $orderBy: [#{entity.name}SortOrder], $filter: #{entity.name}ComplexFilter) {
    items: #{entity.listName}(skip:$skip, limit: $limit, orderBy: $orderBy, filter: $filter) {
      pageInfo {
        count
      }
      edges {
        node {
          ...#{entity.name}Full
        }
      }
    }
  }
  ${frg.#{entity.name}Full(frg)}
  `,
  //getOne
  getOneResult: (frg) => gql`{
    item {
      ...#{entity.name}Result
    }
  }
  ${frg.#{entity.name}Result(frg)}
  `,
  getOne: (frg) => gql`query #{entity.name}($id: ID) {
    item: #{entity.ownerFieldName}(id: $id) {
      ...#{entity.name}Full
    }
  }
  ${frg.#{entity.name}Full(frg)}
  `,
  // getMany
  getManyResult: (frg) => gql`{
    items @_(get:"edges") {
      edges @_(map: "node")  {
        node {
          ...#{entity.name}Result
        }
      }
    }
  }
  ${frg.#{entity.name}Result(frg)}
  `,
  getMany: (frg) => gql`query #{entity.plural}($filter: #{entity.name}ComplexFilter) {
    items: #{entity.listName}(filter: $filter) {
      edges {
        node {
          ...#{entity.name}Full
        }
      }
    }
  }
  ${frg.#{entity.name}Full(frg)}
  `,
  //delete
  deleteResult: (frg) => gql`{
    item @_(get:"node") {
      node {
        ...#{entity.name}Result
      }
    }
  }
  ${frg.#{entity.name}Result(frg)}
  `,
  delete: (frg) => gql`mutation delete#{entity.name} ($input : delete#{entity.name}Input!) {
    item: delete#{entity.name} (input: $input) {
      node: #{entity.ownerFieldName} {
        ...#{entity.name}Full
      }
    }
  }
  ${frg.#{entity.name}Full(frg)}
  `,
  //create
  createResult: (frg) => gql`{
    item @_(get: "edge.node") {
      edge {
        node {
          ...#{entity.name}Result
        }
      }
    }
  }
  ${frg.#{entity.name}Result(frg)}
  `,
  create: (frg) => gql`mutation create#{entity.name}($input: create#{entity.name}Input!) {
    item : create#{entity.name} (input : $input) {
      edge: #{entity.ownerFieldName} {
        node {
          ...#{entity.name}Full
        }
      }
    }
  }
  ${frg.#{entity.name}Full(frg)}
  `,
  //update
  updateResult: (frg) => gql`{
    item @_(get:"node") {
      node {
        ...#{entity.name}Result
      }
    }
  }
  ${frg.#{entity.name}Result(frg)}
  `,
  update: (frg) => gql`mutation update#{entity.name}($input: update#{entity.name}Input!) {
        item : update#{entity.name} (input : $input) {
          node: #{entity.ownerFieldName} {
            ...#{entity.name}Full
          }
        }
      }
    ${frg.#{entity.name}Full(frg)}
  `,
  //getManyReference
  getManyReference: (frg) => ({
  <# entity.relations
  .forEach( f=> {
    if(f.verb === 'BelongsToMany') {
    -#>
    #{f.field}: gql`query #{f.shortName}_#{f.ref.cField}($id: ID, $skip: Int, $limit: Int, $orderBy: [#{entity.name}SortOrder], $filter: #{entity.name}ComplexFilter) {
      opposite: #{f.ref.queryName}(id:$id) {
        id
        items: #{f.ref.opposite}(skip:$skip, limit: $limit, orderBy: $orderBy, filter: $filter) {
          pageInfo {
            count
          }
          edges {
            node {
              ...#{entity.name}Full
            }
          }
        }
      }
    }
    ${frg.#{entity.name}Full(frg)}
  `,
  <#} else {#>
    #{f.field}: gql`query #{f.shortName}_#{f.ref.cField}($skip: Int, $limit: Int, $orderBy: [#{entity.name}SortOrder], $filter: #{entity.name}ComplexFilter) {
      items: #{entity.listName}(skip:$skip, limit: $limit, orderBy: $orderBy, filter: $filter) {
        pageInfo {
          count
        }
        edges {
          node {
            ...#{entity.name}Full
          }
        }
      }
    }
    ${frg.#{entity.name}Full(frg)}
  `,
  <#}})-#>
  }),
  getManyReferenceResultOpposite: (frg) => gql`{
    items: opposite @_(get:"items") {
      items {
        total: pageInfo @_(get:"count") {
          count
        }
        data: edges @_(each: {assign:"node"}) {
          node {
            ...#{entity.name}Result
          }
        }
      }
    }
  }
    ${frg.#{entity.name}Result(frg)}
  `,
  getManyReferenceResultRegular: (frg) => gql`{
    items {
      total: pageInfo @_(get:"count") {
        count
      }
      data: edges @_(each: {assign:"node"}) {
        node {
          ...#{entity.name}Result
        }
      }
    }
  }
    ${frg.#{entity.name}Result(frg)}
  `,
  getManyReferenceResult: (frg, { getManyReferenceResultOpposite, getManyReferenceResultRegular }) => ({
<# entity.relations
  .forEach(f => {
    if( f.verb === 'BelongsToMany' ) {-#>
    #{f.field}: getManyReferenceResultOpposite(frg),
<#} else {-#>
    #{f.field}: getManyReferenceResultRegular(frg),
<#}})-#>
  }),
}
