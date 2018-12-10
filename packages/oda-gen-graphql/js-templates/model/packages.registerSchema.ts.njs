<#@ context 'model'#>
<#- for(let curr of model.packageList){#>
import #{curr.entry} from './#{curr.name}/entity/registerSchema';
<#- }#>

export default {
<#- for(let curr of model.packageList){#>
  #{curr.name}: #{curr.entry},
<#- }#>
};
