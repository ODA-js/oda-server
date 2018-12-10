<#@ context 'entity' -#>
create#{entity.name}(input: create#{entity.name}Input!): create#{entity.name}Payload
update#{entity.name}(input: update#{entity.name}Input!): update#{entity.name}Payload
delete#{entity.name}(input: delete#{entity.name}Input!): delete#{entity.name}Payload