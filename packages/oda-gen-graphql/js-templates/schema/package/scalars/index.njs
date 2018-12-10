<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'scalars/index' #>

<#- chunkStart(`./scalars/index.ts`); -#>
<# pkg.scalars.forEach(s=>{#>
import #{s.name} from './#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.scalars',
items:[<# pkg.scalars.forEach(s=>{#>
 #{s.name},
<#})#>],
});


<# pkg.scalars.forEach(s=>{#>
<#- chunkStart(`./scalars/${s.name}.ts`); -#>
import { Scalar } from '../common';
import gql from 'graphql-tag';

export default new Scalar({
  schema:gql`
  scalar #{s.name}
  `
})
<#})#>