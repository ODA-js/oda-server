<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'unions/index' #>

<#- chunkStart(`./unions/index.ts`); -#>
<# pkg.unions.forEach(s=>{#>
import #{s.name} from './#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.unions',
items:[<# pkg.unions.forEach(s=>{#>
 #{s.name},
<#})#>],
});


<# pkg.unions.forEach(s=>{#>
<#- chunkStart(`./unions/${s.name}.ts`); -#>
import { Union } from '../common';
import gql from 'graphql-tag';

export default new Union({
  schema:gql`
    union #{s.name} = 
<#- s.items.forEach((item, index)=>{ -#>      
     <# if(index > 0){#>|<#}#> #{item}
<#-})#>
  `,
  resolver: (obj, context, info) => {
    return obj.__type;
  },
})
<#})#>