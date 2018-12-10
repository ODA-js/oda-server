<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'mutations/index' #>

<#- chunkStart(`./mutations/index.ts`); -#>
<# pkg.mutations.forEach(s=>{#>
import #{s.name} from './#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.mutations',
items:[<# pkg.mutations.forEach(s=>{#>
 #{s.name},
<#})#>],
});


<# pkg.mutations.forEach(s=>{#>
<#- chunkStart(`./mutations/${s.name}/index.ts`); -#>
import { Schema } from '../../common';
import gql from 'graphql-tag';
import mutation from './mutation';
import input from './input';
import payload from './payload';

export default new Schema({
  name: '#{s.name}.mutation',
  items:[mutation, input, payload],
})

<#- chunkStart(`./mutations/${s.name}/mutation.ts`); -#>
import { Mutation, logger, mutateAndGetPayload } from '../../common';
import gql from 'graphql-tag';

export default new Mutation({
  schema:gql`
    extend type RootMutation {
      #{s.name}(input: #{s.name}Input!): #{s.name}Payload
    }
  `,
  resolver: mutateAndGetPayload(
    async (
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
  })
})

<#- chunkStart(`./mutations/${s.name}/input.ts`); -#>

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



<#- chunkStart(`./mutations/${s.name}/payload.ts`); -#>
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
