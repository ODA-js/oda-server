<#@ context 'model'#>
<#- for(let curr of model.packageList){#>
import #{curr.entry} from './data/registerConnectors';
<#- }#>

export default {
<#- for(let curr of model.packageList){#>
  #{curr.name}: #{curr.entry},
<#- }#>
};
