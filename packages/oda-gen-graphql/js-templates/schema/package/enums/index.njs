<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'enums/index' #>

<#- chunkStart(`./enums/index.ts`); -#>
<# pkg.enums.forEach(s=>{#>
import #{s.name} from './#{s.name}';
import Where#{s.name} from './Where#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.enums',
items:[<# pkg.enums.forEach(s=>{#>
 #{s.name},
 Where#{s.name},
<#})#>],
});


<# pkg.enums.forEach(s=>{#>
<#- chunkStart(`./enums/${s.name}.ts`); -#>
import { Enum } from '../common';
import gql from 'graphql-tag';

export default new Enum({
  schema:gql`
    enum #{s.name} {
<# s.items.forEach(i=>{#>      
      #{i.name},
<#-})#>
    }
  `,
<#-if(s.hasCustomValue){#>
  resolver: {
<# s.items.forEach(i=> {
  const value = i.value || i.name;
#>      
    #{i.name}: '#{value}',
<#-})#>
  },
<#}#>
})

<#- chunkStart(`./enums/Where${s.name}.ts`); -#>
import { Input } from '../common';
import gql from 'graphql-tag';

export default new Input({
  schema: gql`
    input Where#{s.name} {
      eq: #{s.name}
      ne: #{s.name}
      in: [#{s.name}!]
      nin: [#{s.name}!]
      and: [Where#{s.name}!]
      or: [Where#{s.name}!]
      nor: [Where#{s.name}!]
      not: [Where#{s.name}!]
      exists: Boolean
    }
  `,
});

<#})#>