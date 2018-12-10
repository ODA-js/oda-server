<#@ context "entity" -#>
<#@ alias 'grid-card' -#>

import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

const cardStyle = {
  margin: '0.5rem',
  display: 'inline-block',
  verticalAlign: 'top',
};

const Label = ({ label }, { translate }) => (
  <label>{translate(label)}:&nbsp;</label>
);

Label.contextTypes = {
  translate: PropTypes.func.isRequired,
};

const prepareExcludeList = (name, excludeList) => {
  let result;
  if (Array.isArray(name)) {
    result = name.map(prepareExcludeList).reduce(
      (res, curr) => ({
        ...res,
        ...curr,
      }),
      {},
    );
  } else if (typeof name === 'string' && name.startsWith('!')) {
    result = { [name.slice(1)]: true };
  } else {
    result = {};
  }
  if(excludeList){
    result = {
      ...excludeList,
      ...result,
    }
  }
  return result;
};

const CardView = ({ ids, data, basePath, fields }, { translate, uix }) => {
  const excludedField = prepareExcludeList(fields)
  return (
  <div style={{ margin: '1em' }}>
    { ids.length > 0 ? (
      ids.map(id => (
        <Card key={id} style={cardStyle}>
<#- //slot('import-from-react-admin-grid-card-view', 'TextField')#>
          <CardHeader title={<uix.#{entity.name}.SelectTitle record={data[id]} />} />
          <CardContent>
            <div>
        <#- entity.fields.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary)
.filter(f=>entity.UI.list[f.name] || entity.UI.quickSearch.indexOf(f.name)!== -1)
.forEach(f=>{#>
              {!excludedField.hasOwnProperty('#{f.name}') && <div>
                <Label label="resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}" />
                <uix.primitive.#{f.type}.field record={data[id]} source="#{f.name}" />
              </div>}
<#})-#>
<#
entity.relations
.filter(f=>entity.UI.list[f.field])
.forEach(f=>{
-#><#-if(f.single && !f.ref.embedded){-#>
              {!excludedField.hasOwnProperty('#{f.field}') && <div>
                <Label label="resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}" />
                <uix.ReferenceField basePath="/#{f.ref.entity}" record={data[id]} label="resources.#{f.inheritedFrom || entity.name}.fields.#{f.field}" sortable={false} source="#{f.field}" reference="#{f.ref.entity}"<# if (!f.required){#> allowEmpty <#}#>>
                  <uix.#{f.ref.entity}.SelectTitle />
                </uix.ReferenceField>
              </div>}
<#}-#>
<#})#>
            </div>
          </CardContent>
          <CardActions style={{ textAlign: 'right' }}>
          <# entity.actions.forEach(action=>{ #>
              <uix.#{entity.name}.#{action.fullName} record={data}/>
          <#})#>
<# if(!(entity.embedded || entity.abstract)){#>
            <uix.EditButton
              resource="#{entity.name}"
              basePath="/#{entity.name}"
              record={data[id]}
            />
            <uix.ShowButton
              resource="#{entity.name}"
              basePath="/#{entity.name}"
              record={data[id]}
            />
            <uix.CloneButton
              resource="#{entity.name}"            
              basePath="/#{entity.name}"
              record={data[id]}
            />
            <uix.DeleteButton
              resource="#{entity.name}"            
              basePath="/#{entity.name}"
              record={data[id]}
            />
<#}#>
          </CardActions>
        </Card>
      ))
    ) : (
      <div style={{ height: '10vh' }} />
    )}
  </div>
);
}

CardView.defaultProps = {
  data: {},
  ids: [],
};

CardView.contextTypes = {
  uix: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
};

export default CardView;