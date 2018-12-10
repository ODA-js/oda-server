<#@ context "_enum" -#>
<#@ chunks "$$$main$$$" -#>

<#- chunkStart(`../../../${_enum.name}/index`); -#>
import React from 'react';
import PropTypes from 'prop-types';
export const translation = {
  enums: {
    #{_enum.name}: {
<# _enum.items.forEach(item=>{-#>
      #{item.name}: '#{item.title}',
<#})#>
    },
  },
};

const choices = [
<# _enum.items.forEach(item=>{-#>
  { id: '#{item.name}', name: 'enums.#{_enum.name}.#{item.name}' },
<#})#>
];
const input = (props, {uix}) => (
  <uix.SelectInput
    {...props}
    choices={choices}
  />
);

input.contextTypes = {
  uix: PropTypes.object.isRequired,
};

const field = (props, {uix}) => (<uix.SelectField {...props} choices={choices}/>)

field.contextTypes = {
  uix: PropTypes.object.isRequired,
};

export default {
  input,
  field,
  choices,
};
