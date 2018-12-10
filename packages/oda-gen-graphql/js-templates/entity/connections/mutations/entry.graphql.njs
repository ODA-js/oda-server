<#@ context 'entity' -#>
<# for ( let connection of entity.connections ) {-#>
addTo#{connection.relationName}(input: addTo#{connection.relationName}Input):addTo#{connection.relationName}Payload
removeFrom#{connection.relationName}(input: removeFrom#{connection.relationName}Input):removeFrom#{connection.relationName}Payload
<#}-#>