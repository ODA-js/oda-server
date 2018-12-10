<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'directives/index' #>

<#- chunkStart(`./directives/index.ts`); -#>
<# pkg.directives.forEach(s=>{#>
import #{s.name} from './#{s.name}';
<#})#>
import { Schema } from '../common';

export default new Schema ({
  name: '#{pkg.name}.directives',
items:[<# pkg.directives.forEach(s=>{#>
 #{s.name},
<#})#>],
});


<# pkg.directives.forEach(s=>{#>
<#- chunkStart(`./directives/${s.name}.ts`); -#>
import { Directive } from '../common';
import gql from 'graphql-tag';

export default new Directive({
  schema:gql`
    directive @#{s.name} (#{s.args}) on #{s.on}
  `
})
<#})#>