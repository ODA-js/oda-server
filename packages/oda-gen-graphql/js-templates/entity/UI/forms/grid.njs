<#@ context "entity" -#>
<#@ alias 'forms-grid' -#>

import React from "react";
import PropTypes from 'prop-types';

const Grid = ({fields, ...props}, {uix}) =>  (
  <uix.Responsive {...props} 
    xsmall={<uix.#{entity.name}.ListView />}
    small={<uix.#{entity.name}.CardView fields={fields}/>}
    medium={<uix.#{entity.name}.GridView fields={fields}/>}
  />
);

Grid.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export default Grid;