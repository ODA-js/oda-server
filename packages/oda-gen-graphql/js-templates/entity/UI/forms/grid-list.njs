<#@ context "entity" -#>
<#@ alias 'forms-grid-list' -#>

import React from 'react';
import PropTypes from 'prop-types';

const SmallList = (props,{uix}) => (
  <uix.SimpleList {...props} primaryText={record => 
    <#- entity.listLabel.forEach(ln=>{-#>
      record.#{ln} ||
    <#-})-#>
    record.id } />
);

SmallList.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export default SmallList;
