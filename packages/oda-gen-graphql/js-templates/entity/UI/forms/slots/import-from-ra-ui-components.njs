<#@ context 'items' #>
<#@ alias 
  'import-from-ra-ui-components-form'
-#>
<#- const separatedItems = Object.keys(items
  .reduce((res, it) => {
    it.split(',')
      .map(i=>i.trim())
      .filter(f=>f)
      .reduce((r,cur)=>{
        r[cur]=1;
        return r;
      },res);
    return res;
  }, {}));
-#>
<#- if(separatedItems.length > 0){-#>
import { components } from 'oda-ra-ui';
const {
<#-
    separatedItems.forEach(item=>{
#>
  #{item.trim()},
<#  });-#>
} = components;
<#}-#>