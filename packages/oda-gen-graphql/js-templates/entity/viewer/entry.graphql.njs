  <#@ context 'entity' -#>
  #{entity.pluralEntry}( after: String, first: Int, before: String, last: Int, limit: Int, skip: Int, orderBy: [#{entity.name}SortOrder], filter: #{entity.name}Filter): #{entity.plural}Connection
  #{entity.singularEntry}(#{entity.unique}): #{entity.name}