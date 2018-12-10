<#@ context "entity" -#>
<#@ alias 'forms-grid-view' -#>

import React from "react";
import PropTypes from 'prop-types';

const Grid = ({ fields, ...props }, { uix }) => (
  <uix.Datagrid {...props} rowClick="edit" >
    {uix.#{entity.name}.getFields({
<# const list = !(entity.embedded || entity.abstract) ? 'list': 'all' #>
      name: fields ? ['#{list}', fields] : '#{list}',
      uix, type: 'show'})}
    <# entity.actions.forEach(action=>{ #>
        <uix.#{entity.name}.#{action.fullName} />
    <#})#>
<# if(!(entity.embedded || entity.abstract)){#>
    <uix.ShowButton label="" />
    <uix.CloneButton label="" />
<#}#>
  </uix.Datagrid>
);

Grid.contextTypes = {
  uix: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
}

export default Grid;