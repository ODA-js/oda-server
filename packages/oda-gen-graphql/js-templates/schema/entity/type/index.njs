<#@ chunks "$$$main$$$" -#>
<#@ context 'entity' #>
<#@ alias 'type-index'#>

<#- chunkStart(`./type/index.ts`); -#>
#{partial(entity.type.resolver, 'type-resolver-imports')}
export default new Type({
  schema: gql`
    #{partial(entity.type.entry, 'type-entry')}
  `,
  resolver: {
    id: ({ id }) => id,
    #{partial(entity.type.resolver, 'type-resolver')}
  }
});