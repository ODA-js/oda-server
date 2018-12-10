<#@ chunks "$$$main$$$" -#>
<#@ context 'pkg' #>
<#@ alias 'data-connectors/index' #>

<#- chunkStart(`./data/index.ts`); -#>
<#- chunkStart(`./data/connectorIndex.ts`);-#>
#{partial(pkg,'connectorIndex')}
<#- chunkStart(`./data/registerConnectors.ts`); -#>
#{partial(pkg,'registerConnectors')}
