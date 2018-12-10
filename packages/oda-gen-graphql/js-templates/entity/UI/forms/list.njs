<#@ context "entity" -#>
<#@ alias 'forms-list' -#>
<#- const listActions = entity.actions.filter(a=> a.actionType==='listAction') -#>
<#- const itemActions = entity.actions.filter(a=> a.actionType==='itemAction') -#>
import React from "react";
import PropTypes from 'prop-types';
<# if(listActions.length > 0){#>

const #{entity.name}ActionButtons = (props, { uix }) => (
  <React.Fragment>
<#listActions.forEach(action => {#>
    <uix.#{entity.name}.#{action.fullName} {...props} />
<#})#>
    {/* Add the default bulk delete action */}
    <uix.BulkDeleteButton {...props} />
  </React.Fragment>
);

#{entity.name}ActionButtons.contextTypes = {
  uix: PropTypes.object.isRequired,
};

<#}#>

const ListView = (props, {translate, uix}) => (
  <uix.List {...props} filters={<uix.#{entity.name}.Filter />} 
  title={translate("resources.#{entity.name}.name", { smart_count:2 })}
<#if(listActions.length > 0){#>
  bulkActionButtons={<#{entity.name}ActionButtons />}
<#}#>
  >
    <uix.#{entity.name}.Grid />
  </uix.List>
);


ListView.contextTypes = {
  uix: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
}

export default ListView;