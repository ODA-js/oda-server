<#@ chunks "$$$main$$$" -#>
<#@ alias 'data-index'#>
<#@ context 'ctx'#>

<#- chunkStart(`../../data/${ctx.name}/types/model.ts`); -#>
#{partial(ctx.model,'data/model')}
<#- chunkEnd(); -#>
<#if(ctx.adapter==='mongoose'){#>
<#- chunkStart(`../../data/${ctx.name}/adapter/connector.ts`); -#>
#{partial(ctx.connector,'data/connector/mongoose')}
<#- chunkStart(`../../data/${ctx.name}/adapter/interface.ts`); -#>
#{partial(ctx.connector,'data/connector/interface')}
<#- chunkStart(`../../data/${ctx.name}/adapter/schema.ts`); -#>
#{partial(ctx.schema,'data/schema/mongoose')}
<#- chunkEnd(); -#>
<# } else {#>
<#- chunkStart(`../../data/${ctx.name}/adapter/connector.ts`); -#>
#{partial(ctx.connector,'data/connector/sequelize')}
<#- chunkStart(`../../data/${ctx.name}/adapter/interface.ts`); -#>
#{partial(ctx.connector,'data/connector/interface')}
<#- chunkStart(`../../data/${ctx.name}/adapter/schema.ts`); -#>
#{partial(ctx.schema,'data/schema/sequelize')}
<#- chunkEnd(); -#>
<#}#>

