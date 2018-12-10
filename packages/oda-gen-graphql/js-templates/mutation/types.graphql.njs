<#@ context 'mutation' -#>

input #{mutation.name}Input {
  clientMutationId: String
<# for(let arg of mutation.args){-#>
  #{arg.name}: #{arg.type}
<#}-#>
}

type #{mutation.name}Payload {
  clientMutationId: String
  viewer: Viewer
<# for(let arg of mutation.payload){-#>
  #{arg.name}: #{arg.type}
<#}-#>
}
