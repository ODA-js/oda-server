<#@ context "entity" -#>
<#@ alias 'forms-filter' -#>

import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

<# var filteredFields = entity.fields.filter(f=>!f.derived ).filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary)
  .filter(f=>entity.UI.list[f.name]); #>
const FilterPanel = ({ classes, ...props }, {translate, uix}) => (
  <uix.Filter {...props} >

<#-if (Array.isArray(entity.UI.quickSearch) && entity.UI.quickSearch.length > 0) {#>
    <uix.TextInput label="uix.filter.search" source="q" allowEmpty alwaysOn />
<#}-#>

    {uix.#{entity.name}.getFields({ name: 'all', uix, type: 'filter' }).map(f =>
      f(classes, translate, uix),
    )}
  </uix.Filter>
);

FilterPanel.contextTypes = {
  translate: PropTypes.func.isRequired,
  uix: PropTypes.object.isRequired,
}

export default withStyles(styles)(FilterPanel);