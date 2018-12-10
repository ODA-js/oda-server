<#@ context "entity" -#>
<#@ alias 'forms-title' -#>

import React from "react";
import PropTypes from 'prop-types';

const Title = ({ record },{translate, uix }) => (
  <span>
    {translate('resources.#{entity.name}.listName', {smart_count : 1})} "<uix.#{entity.name}.SelectTitle record={record}/>"
  </span>
);

Title.contextTypes = {
  translate: PropTypes.func.isRequired,
  uix: PropTypes.object.isRequired,
}

export default Title;