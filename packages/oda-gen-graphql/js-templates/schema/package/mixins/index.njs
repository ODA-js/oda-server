<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'mixins/index' #>

<#- chunkStart(`./mixins/index.ts`); -#>
<# pkg.mixins.forEach(s=>{#>
import #{s.name} from './#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.mixins',
items:[<# pkg.mixins.forEach(s=>{#>
 #{s.name},
<#})#>],
});


<# pkg.mixins.forEach(s=>{#>
<#- chunkStart(`./mixins/${s.name}.ts`); -#>
import { Union } from '../common';
import gql from 'graphql-tag';

export default new Union({
  schema:gql`
    interface #{s.name} {
<#- s.fields.forEach(field => { -#>
<# if(field.description){#>
  # #{field.description}
<#- }#>
  #{field.name}#{field.args}: #{field.type}
<#-})-#>
    }
  `,
  resolver: (obj, context, info) => {
    return obj.__type;
  },
})
<#})#>



