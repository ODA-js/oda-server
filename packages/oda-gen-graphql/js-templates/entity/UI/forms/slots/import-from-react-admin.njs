<#@ context 'items' -#>
<#@ alias 
'import-from-react-admin-fragments'
'import-from-react-admin-form-simple'
'import-from-react-admin-form-tab'
'import-from-react-admin-show'
'import-from-react-admin-show-simple'
'import-from-react-admin-show-tab'
'import-from-react-admin'
'import-from-react-admin-filter'
'import-from-react-admin-grid-card-view'
-#>
<#- 
const separatedItems = Object.keys(items
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
<#- separatedItems.forEach(item=>{#>
#{item},
<#- }) -#>