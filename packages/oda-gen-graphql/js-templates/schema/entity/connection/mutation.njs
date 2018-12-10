<#@ chunks "$$$main$$$" -#>
<#@ alias 'connection-mutations'#>
<#@ context 'entity'#>

<#- for (let connection of entity.connections.filter(f=>!f.embedded)) {
  const ctx = {
    entity,
    connection,
  }
#>

#{partial(ctx,'connection-mutations-addTo')}
#{partial(ctx,'connection-mutations-removeFrom')}

<#- } -#>