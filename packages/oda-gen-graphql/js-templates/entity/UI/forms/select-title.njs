<#@ context "entity" -#>
<#@ alias 'forms-select-title' -#>

import React from "react";

const Title = ({ record }) => (
  <span>{record ? (
    <#- entity.listLabel.forEach(ln=>{-#>
      record.#{ln} ||
    <#-})-#>
    record.id ):''}</span>
);

export default Title;