<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'queries/index' #>

<#- chunkStart(`./queries/index.ts`); -#>
<# pkg.queries.forEach(s=>{#>
import #{s.name} from './#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.queries',
items:[<# pkg.queries.forEach(s=>{#>
 #{s.name},
<#})#>],
});


<# pkg.queries.forEach(s=>{#>
<#- chunkStart(`./queries/${s.name}/index.ts`); -#>
import { Schema } from '../../common';
import gql from 'graphql-tag';
import query from './query';
import input from './input';
import payload from './payload';

export default new Schema({
  name: '#{s.name}.query',
  items:[query, input, payload],
})

<#- chunkStart(`./queries/${s.name}/query.ts`); -#>
import { Query, logger } from '../../common';
import gql from 'graphql-tag';

export default new Query({
  schema:gql`
    extend type RootQuery {
      #{s.name}(input: #{s.name}Input!): #{s.name}Payload
    }
  `,
  resolver:    async (
    owner,
    args: {
  <#- for (let f of s.args) {#>
      #{f.name}?: #{f.type.ts},
  <#-}#>
    },
    context,
    info
  ) => {
    logger.trace('#{s.name}');
    let result: {
      // what must be in output
  <#- for (let f of s.payload) {#>
      #{f.name}?: any; // #{f.type.ts},
  <#-}#>
    };
    result = {};
    // put your code here
    return result;
  }
})

<#- chunkStart(`./queries/${s.name}/input.ts`); -#>

import { Input } from '../../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input #{s.name}Input {
    <# for(let arg of s.args){-#>
      #{arg.name}: #{arg.type.gql}
    <#}-#>
    }
  `,
});



<#- chunkStart(`./queries/${s.name}/payload.ts`); -#>
import { Type } from '../../common';
import gql from 'graphql-tag';

export default new Type({
  schema: gql`
    type #{s.name}Payload {
    <# for(let arg of s.payload){-#>
      #{arg.name}: #{arg.type.gql}
    <#}-#>
    }
  `,
});

<#})#>
