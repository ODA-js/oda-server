<#@ context 'entity' -#>
import * as Sequelize from 'sequelize';
import { IdGenerator } from 'oda-isomorfic';

export default (sequelize, DataTypes: Sequelize.DataTypes) => {
  let $#{entity.name} = sequelize.define('#{entity.name}', {
<#- if(entity.useDefaultPK){#>
    id: {
      type: DataTypes.CHAR(24), defaultValue: ()=> IdGenerator.generateMongoId(),
      primaryKey: true,
    },
<#}#>
<#- entity.fields.forEach(field => { #>
    #{field.name}: {
      type: #{field.type},
      allowNull: #{!field.required},
      <#- if(field.primaryKey){#>
      primaryKey: true,
      <#-}#>
      <#- if(field.defaultValue){#>
      defaultValue: #{field.defaultValue},
      <#-}#>
    },
  <#- })#>
  <#- entity.relations.forEach(rel=>{#>
    #{rel.name}: {
      type: #{rel.type},
      allowNull: #{!rel.required},
    },
  <#-})#>
  }, {
      tableName: '#{entity.collectionName}',
      timestamps: false,
      createdAt: false,
      updatedAt: false,
      underscored: false,
      indexes: [
<#-for(let i = 0, len = entity.indexes.length; i < len; i++){
    let index = entity.indexes[i];
  -#><#if(i > 0){#>, <#}#>{
  <#- if(index.options.unique){#>
        unique: true,
  <#-}#>
        fields: [
<#- for(let field in index.fields){#>
          { attribute: '#{field}', order: '#{index.fields[field] ? "ASC": "DESC"}' },<#}#>
        ],
      }
<#-}-#>]
    });

  return $#{entity.name};
};
