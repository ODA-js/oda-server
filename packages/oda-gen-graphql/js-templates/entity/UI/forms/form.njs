<#@ context "entity" -#>
<#@ alias "forms-form" -#>
<# const rels = entity.relations.filter(r=>!r.single && !r.ref.embedded); #>
<# const btRels = entity.relations.filter(r=>r.verb === 'BelongsTo');#>

import React from "react";
import PropTypes from 'prop-types';
<# block 'init-record' : -#>
<#@ context 'btRels'#>
<#if (btRels.length > 0) {#>
  let redirect = 'edit';
  if(props.location && props.location.state && props.location.state.pathname){
    redirect =  props.location.state.pathname;
  }
<#}#>
<# end #>

  const CreateFormToolbar = (props, {uix}) => (
    <uix.Toolbar {...props}>
      <uix.SaveButton/>
      <uix.SaveButton
        label="uix.actions.create_and_add"
        redirect={false}
        submitOnEnter={false}
        variant="flat"
      />
    </uix.Toolbar>
  );

CreateFormToolbar.contextTypes = {
  uix: PropTypes.object.isRequired,
};

const EditSimple#{entity.name}Actions = ({ basePath, data }, {uix}) => (
  <uix.CardActions>
<# entity.actions.forEach(action=>{ #>
    <uix.#{entity.name}.#{action.fullName} record={data}/>
<#})#>
    <uix.ShowButton record={data} basePath={basePath} />
  </uix.CardActions>
);

EditSimple#{entity.name}Actions.contextTypes = {
  uix: PropTypes.object.isRequired,
}


const EditTabbed#{entity.name}Actions = ({ basePath, data }, {uix}) => (
  <uix.CardActions>
<# entity.actions.forEach(action=>{ #>
    <uix.#{entity.name}.#{action.fullName} record={data} />
<#})#>
    <uix.ShowButton record={data} basePath={basePath} />
  </uix.CardActions>
);

EditTabbed#{entity.name}Actions.contextTypes = {
  uix: PropTypes.object.isRequired,
}

const ShowSimple#{entity.name}Actions = ({ basePath, data }, {uix}) => (
  <uix.CardActions>
<# entity.actions.forEach(action=>{ #>
    <uix.#{entity.name}.#{action.fullName} record={data}/>
<#})#>
    <uix.EditButton record={data} basePath={basePath} />
  </uix.CardActions>
);

ShowSimple#{entity.name}Actions.contextTypes = {
  uix: PropTypes.object.isRequired,
}

const ShowTabbed#{entity.name}Actions = ({ basePath, data }, {uix}) => (
  <uix.CardActions>
<# entity.actions.forEach(action=>{ #>
    <uix.#{entity.name}.#{action.fullName} record={data}/>
<#})#>
    <uix.EditButton record={data} basePath={basePath} />
  </uix.CardActions>
);

ShowTabbed#{entity.name}Actions.contextTypes = {
  uix: PropTypes.object.isRequired,
}


export const CreateFormSimple = (props, {uix}) => {
  #{content('init-record',btRels)}
  return (
  <uix.Create {...props} >
    <uix.SimpleForm 
     toolbar={<CreateFormToolbar />}
    <#if(btRels.length> 0){#> redirect={redirect} <#}#>>
      {uix.#{entity.name}.getFields({name:'createSimple', uix, type: 'edit'})}
    </uix.SimpleForm>
  </uix.Create >
  );
};

CreateFormSimple.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export const EditFormSimple = (props, {uix}) => {
  return (
  <uix.Edit title={<uix.#{entity.name}.Title />} {...props} actions={<EditSimple#{entity.name}Actions />}>
    <uix.SimpleForm>
      {uix.#{entity.name}.getFields({name:'all', uix, type: 'edit'})}
    </uix.SimpleForm>
  </uix.Edit >
  );
};

EditFormSimple.contextTypes = {
  uix: PropTypes.object.isRequired,
}

// tabbed forms
export const CreateFormTabbed = (props, {uix}) => {
 #{content('init-record',btRels)}
  return (
  <uix.Create {...props} >
    <uix.TabbedForm
      toolbar={<CreateFormToolbar />}
     <#if(btRels.length> 0){#> redirect={redirect} <#}#>>
      <uix.FormTab label="resources.#{entity.name}.summary">
        {uix.#{entity.name}.getFields({name:'create', uix, type: 'edit'})}
      </uix.FormTab>
<#- entity.relations
  .filter(f => (entity.UI.edit[f.field] || entity.UI.list[f.field] || entity.UI.show[f.field]) && entity.UI.edit[f.field]!== false)
  .forEach(f => {
    const embedded = entity.UI.embedded.hasOwnProperty(f.field);
    if (((f.single && !embedded )|| !f.single) && !f.ref.embedded) {
      return;
    }
#>
      <uix.FormTab label="resources.#{f.inheritedFrom || entity.name}.fields.#{f.field}" path="#{f.field}">
        {uix.#{entity.name}.getFields({name:'#{f.field}Fields', uix, type: 'edit'})}
      </uix.FormTab>
<#-})#>
    </uix.TabbedForm>
  </uix.Create >
  );
};

CreateFormTabbed.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export const EditFormTabbed = (props, {uix}) => {
  return (
  <uix.Edit title={<uix.#{entity.name}.Title />} {...props} actions={<EditTabbed#{entity.name}Actions />}>
    <uix.TabbedForm>
      <uix.FormTab label="resources.#{entity.name}.summary">
        {uix.#{entity.name}.getFields({name:'summary', uix, type: 'edit'})}
      </uix.FormTab>
<#- entity.relations
  .filter(f => (entity.UI.edit[f.field] || entity.UI.list[f.field] || entity.UI.show[f.field]) && entity.UI.edit[f.field]!== false)
  .forEach(f => {
    const embedded = entity.UI.embedded.hasOwnProperty(f.field);
    if ( f.single && !embedded ) {
      return;
    }
#>
      <uix.FormTab label="resources.#{f.inheritedFrom || entity.name}.fields.#{f.field}" path="#{f.field}">
        {uix.#{entity.name}.getFields({name:'#{f.field}Fields', uix, type: 'edit'})}
      </uix.FormTab>
<#-})#>
    </uix.TabbedForm>
  </uix.Edit >
  );
};

EditFormTabbed.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export const ShowSimpleView = (props, {uix}) => {
  return (
    <uix.Show title={<uix.#{entity.name}.Title />} {...props} actions={<ShowSimple#{entity.name}Actions />}>
      <uix.SimpleShowLayout>
        { uix.#{entity.name}.getFields({name:'all', uix, type: 'show'})}
      </uix.SimpleShowLayout>
    </uix.Show>
  );
};

ShowSimpleView.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export const ShowTabbedView = (props, {uix}) => {
  return (
    <uix.Show title={<uix.#{entity.name}.Title />} {...props} actions={<ShowTabbed#{entity.name}Actions />}>
      <uix.TabbedShowLayout>
        <uix.Tab label="resources.#{entity.name}.summary">
          {uix.#{entity.name}.getFields({name:'summary', uix, type: 'show'})}
        </uix.Tab>
<#- entity.relations
  .filter(f => (entity.UI.edit[f.field] || entity.UI.list[f.field] || entity.UI.show[f.field]) && entity.UI.edit[f.field]!== false)
  .forEach(f => {
    const embedded = entity.UI.embedded.hasOwnProperty(f.field);
    if ( f.single && !embedded ) {
      return;
    }
#>
        <uix.Tab label="resources.#{f.inheritedFrom || entity.name}.fields.#{f.field}" path="#{f.field}">
          {uix.#{entity.name}.getFields({name:'#{f.field}Fields', uix, type: 'show'})}
        </uix.Tab>
      <#-})#>
      </uix.TabbedShowLayout>
    </uix.Show>
  );
};

ShowTabbedView.contextTypes = {
  uix: PropTypes.object.isRequired,
}