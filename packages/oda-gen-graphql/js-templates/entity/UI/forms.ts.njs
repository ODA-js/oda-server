<#@ context "entity" -#>
<#@ chunks "$$$main$$$" -#>

<#- chunkStart(`../../../${entity.name}/index`); -#>
#{partial(entity, 'forms-index')}

<#- chunkStart(`../../../${entity.name}/title`); -#>
#{partial(entity, 'forms-title')}

<#- chunkStart(`../../../${entity.name}/selectTitle`); -#>
#{partial(entity, 'forms-select-title')}

<#- chunkStart(`../../../${entity.name}/list`); -#>
#{partial(entity, 'forms-list')}

<#- chunkStart(`../../../${entity.name}/grid`); -#>
#{partial(entity, 'forms-grid')}

<#- chunkStart(`../../../${entity.name}/filter`); -#>
#{partial(entity, 'forms-filter')}

<#- chunkStart(`../../../${entity.name}/form`); -#>
#{partial(entity, 'forms-form')}

<#- chunkStart(`../../../${entity.name}/preview`); -#>
#{partial(entity, 'forms-preview')}

<#- chunkStart(`../../../${entity.name}/fragments`); -#>
#{partial(entity, 'forms-form-fragments')}

<#- chunkStart(`../../../${entity.name}/cardView`); -#>
#{partial(entity, 'grid-card')}

<#- chunkStart(`../../../${entity.name}/listView`); -#>
#{partial(entity, 'forms-grid-list')}

<#- chunkStart(`../../../${entity.name}/gridView`); -#>
#{partial(entity, 'forms-grid-view')}

<#- chunkStart(`../../../i18n/${entity.name}`); -#>
#{partial(entity, 'forms-i18n')}

<#- chunkStart(`../../../${entity.name}/styles`); -#>
const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
});

export default styles;