<#@ chunks "$$$main$$$" -#>
<#@ alias 'entity-helpers-index' #>
<#@ context 'entity' #>

<# chunkStart(`./helpers/index.ts`); #>

#{slot('import-helpers-index-slot')}

export {
  #{slot('export-helpers-index-slot')}
}