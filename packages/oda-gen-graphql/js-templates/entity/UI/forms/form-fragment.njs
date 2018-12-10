<#@ context "entity" -#>
<#@ alias 'forms-form-fragments' -#>
<# const rels = entity.relations.filter(r=>!r.single && !r.ref.embedded); #>

import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import AddIcon from '@material-ui/icons/Add';
<# if(entity.actions.length > 0){#>
import { connect } from 'react-redux';
import ExecuteActionIcon from '@material-ui/icons/Settings';
<#}#>

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

/**
 *
 * @param { { name: string | string[], uix: {#{entity.name}: typeof Fragments}, source: string, type: 'form'|'show'|'filter' } } param0
 */
export const getFields = ({ name, uix, source, type, ...rest },_excludeList) => {
  const fragment = uix.#{entity.name}.Fragments;
  const fieldSet = uix.#{entity.name}.FieldSets;
  const excludeList = prepareExcludeList(name, _excludeList);
  if (Array.isArray(name)) {
    return name.reduce((res, cur) => {
      if (!excludeList.hasOwnProperty(cur)) {
        const item = getFields({ name: cur, type, uix, source, ...rest }, excludeList);
        if (Array.isArray(item)) {
          res.push(...item);
        } else if (item){
          res.push(item);
        }
      }
      return res;
    }, []);
  } else {
    if (name.startsWith('!')) {
      name = name.slice(1);
    }
    if (!excludeList.hasOwnProperty(name)) {
      if (fieldSet.hasOwnProperty(name)) {
        return getFields({ name: fieldSet[name], uix, source, type, ...rest}, excludeList);
      } else {
        return fragment[name][type] && fragment[name][type]({ uix, source, ...rest});
      }
    }
  }
};

export const FieldSets = {
  all: [<#entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary).forEach(f=>{-#>
    '#{f.name}',
  <#})#>],
  list: [
    <# entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary)
.filter(f =>entity.UI.list[f.name] || entity.UI.quickSearch.indexOf(f.name)!== -1)
.forEach(f => {
  if (!f.ref) {-#>
  '#{f.name}',
<#} else if(f.ref && f.single) {-#>
'#{f.field}',
<#-}-#>
<#-})#>
  ],
  summary: [<#entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary).filter(f=> !f.ref || (f.ref && f.single && !entity.UI.embedded.hasOwnProperty(f.field)) ).forEach(f=>{-#>
    '#{f.name}',
  <#})#>],
  preview: [<#entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary).filter(f=> !f.ref).forEach(f=>{-#>
    '#{f.name}',
  <#})#>],
  create: [<#entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary).filter(f=> !f.ref || (f.ref && f.single && !entity.UI.embedded.hasOwnProperty(f.field)) ).forEach(f=>{-#>
    '#{f.name}',
  <#})#>],
  createSimple: [<#entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary).filter(f=> !f.ref || (f.ref && (f.ref.embedded ||(f.single && !entity.UI.embedded.hasOwnProperty(f.field)))) ).forEach(f=>{-#>
    '#{f.name}',
  <#})#>],
  'quick-create': [<#entity.props.filter(f=>(!entity.dictionary && f.name!== "id") || entity.dictionary).filter(f=> !f.ref ).forEach(f=>{-#>
    '#{f.name}',
  <#})#>],
  <#- entity.relations.filter(f=> !(f.single && !entity.UI.embedded.hasOwnProperty(f.field)))
.forEach(f => {
#>
  #{f.field}Fields:['#{f.field}'],
<#-})#>
}

// form fragments
#{content('form-fragment')}

// action definitions
#{content('actions')}

// rel buttons
#{content('add-buttons')}

<# block 'form-fragment' : -#>
export const Fragments = {
<#- entity.props.forEach((f, index) => {
  const ctx = {entity, f};#>
  #{f.name}: {
<#if (!f.ref) {#>
        edit: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "edit-field")});
        },
        show: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "show-field")});
        },
        #{content('field-filter', ctx)}
<#-
  } else { 
    const embedded = entity.UI.embedded.hasOwnProperty(f.field);
-#>
<#   if ( f.single ) {-#>
<#     if(embedded) {
  #>
        edit: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "edit-rel-single-embed")});
        },
        show: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "show-rel-single-embed")});
        },
<#-   } else {#>
        edit: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "edit-rel-single-not-embed-w-preview")});
        },
        show: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "show-rel-single-not-embed")});
        },
    <#}#>
<#-} else {#>
<#- if(embedded){ 
  -#>
        edit: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "edit-rel-multiple-embed")});
        },
        show: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          return (#{partial(ctx, "show-rel-multiple-embed")});
        },
<#-} else {-#>
        edit: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          <#if(f.verb!=='BelongsToMany' || (f.verb==='BelongsToMany' && f.ref.using)){#>
          return (#{partial(ctx, "edit-show-rel-multiple-not-embed")});
          <#}else{#>
          return (#{partial(ctx, "edit-rel-multiple-not-embed")});
          <#}#>
        },
        show: ({ source, uix }) => {
          <#if(!f.inheritedFrom){-#>
          source = source ? `${source}.` : '';
          <#}-#>
          <#if(f.verb!=='BelongsToMany' || (f.verb==='BelongsToMany' && f.ref.using)){#>
          return (#{partial(ctx, "show-rel-multiple-not-embed")});
          <#}else{#>
          return (#{partial(ctx, "show-rel-multiple-not-embed-stored")});
          <#}#>
        },
<#-}#>
<#-}#>
      <#if(!f.emdedeb && f.verb === 'BelongsTo'){#>
        #{content('bt-filter', ctx)}
      <#}#>
      <#if(f.embedded){#>
      filter: ({ source, uix, label }) => {
        source = source ? `${source}.` : '';
        label = label ? `${label} resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}` : `resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}`;
        return uix.#{f.ref.entity}.getFields({ name: 'all', uix, type: 'filter', source:`${source}#{f.name}`, label });
      }
      <#}#>
<#-}-#>
  },
<#
});
#>
}
<# end #>

<# block 'actions' : -#>
<# entity.actions.forEach(action=>{#>
export const #{action.actionName} = '#{action.actionName}';
export const #{action.actionCreatorName} = (data) => ({
  type: #{action.actionName},
  payload: { data, resource: '#{entity.name}' },
  // dataProvider hack
  meta: { fetch: 'EXECUTE', resource: '#{action.actionCreatorName}' },
});

/**
  // define this method in dataProvider to use this
  async function #{action.actionCreatorName}(data, resource){
    
  }
*/

const #{action.fullName}Action  = ({ #{action.actionCreatorName}, record, selectedIds, children }, {uix}) => (
<#- //slot('import-from-react-admin-fragments', 'Button')#>
  <uix.Button onClick={() =>
    #{action.actionCreatorName}({record, selectedIds})
  } 
  label="resources.#{entity.name}.actions.#{action.name}"
  >
    {children ? children : (<ExecuteActionIcon/>)}
  </uix.Button>);


#{action.fullName}Action.propTypes = {
  #{action.actionCreatorName}: PropTypes.func.isRequired,
  record: PropTypes.object,
};

#{action.fullName}Action.contextTypes = {
  uix: PropTypes.object.isRequired,
}


export const #{action.fullName}Button = connect(null, {
  #{action.actionCreatorName},
})(#{action.fullName}Action);
<#})#>

export const actions = {
<# entity.actions.forEach(action=>{#>
  #{action.name}:{
    type:'#{action.actionType}',
    creator: #{action.actionCreatorName},
    action: #{action.actionName},
    button: #{action.fullName}Button,
  },
<#})#>
}

<# end #>

<# block 'add-buttons' : #>
<#@ context 'entity'#>
const Add#{entity.name} = ({ record, location, target, label, children }, {uix}) => {
  const to = {
    pathname: `/#{entity.name}/create`,
  };

  to.state = { pathname: location.pathname };
  const newRecord = target && record && record.id ? { [target]: record.id } : undefined;
  if (newRecord) {
    to.state.record = newRecord;
  }
<#- //slot('import-from-react-admin-fragments', 'Button')#>
  return (
    <uix.Button 
      component={Link}
      to={to} 
      label={label}>
      {children || <AddIcon/>}
    </uix.Button>
  );
};

Add#{entity.name}.propTypes = {
  record: PropTypes.object,
  location: PropTypes.object.isRequired,
  target: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

Add#{entity.name}.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export const buttons = {
  Add: withRouter(Add#{entity.name}),
  <# entity.actions.forEach(action=>{#>
  #{action.fullName}: #{action.fullName}Button,
  <#-})#>
}
<# end #>


<# block 'field-filter' : #>
<#@ context 'ctx'#>
<# const {entity, f} = ctx;#>
<#if(!f.derived && f.name !== 'id' && !entity.dictionary) {#>
filter: ({ source, uix, label }) => {
  source = source ? `${source}.` : '';
  return (classes, translate, uix) => [
<#
    switch(f.filterType) {
      case "Number":
#>
    <uix.NumberInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.eq", { name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-eq`}
      allowEmpty 
    />,
    <uix.NumberInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.lte",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-lte`}
      allowEmpty 
    />,
    <uix.NumberInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.gte",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-gte`}
      allowEmpty 
    />,
    <uix.NumberInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.lt",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-lt`}
      allowEmpty 
    />,
    <uix.NumberInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.gt",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-gt`}
      allowEmpty 
    />,
<#
      break;
      case "Text":
#>
    <uix.#{f.filterType}Input 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.imatch",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-imatch`}
      allowEmpty 
    />,
    <uix.SelectArrayInput
      className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.in",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
       source={`${source}#{f.name}-in`}
      allowEmpty 
    />,
    <uix.SelectArrayInput
      className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.nin",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
       source={`${source}#{f.name}-nin`}
      allowEmpty 
    />,
<#
      break;
      case "ID":
#>
    <uix.TextInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.eq",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-eq`}
      allowEmpty 
    />,
    <uix.SelectArrayInput 
      className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.in",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-in`}
      allowEmpty 
    />,
    <uix.SelectArrayInput 
      className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.nin",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-nin`}
      allowEmpty 
    />,
<#
      break;
      case "Date":
#>
    <uix.DateInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.lte",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-lte`}
      allowEmpty 
    />,
    <uix.DateInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.gte",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-gte`}
      allowEmpty 
    />,
<#
      break;
      case "Boolean":
#>
    <uix.BooleanInput 
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.eq",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
      source={`${source}#{f.name}-eq`}
      allowEmpty 
    />,
<#
      break;
      case "Enum":
#>
      <uix.SelectInput
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.eq', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      choices={uix.primitive.#{f.type}.choices}
      source={`${source}#{f.name}-eq`}
      allowEmpty
    />,
    <uix.SelectInput
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.ne', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      choices={uix.primitive.#{f.type}.choices}
      source={`${source}#{f.name}-ne`}
      allowEmpty
    />,
    <uix.SelectArrayInput
    className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.in', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      options={{ fullWidth: true }}
      choices={uix.primitive.#{f.type}.choices}
      source={`${source}#{f.name}-in`}
      allowEmpty
    />,
    <uix.SelectArrayInput
    className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.nin', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      options={{ fullWidth: true }}
      choices={uix.primitive.#{f.type}.choices}
      source={`${source}#{f.name}-nin`}
      allowEmpty
    />,
<#    }#>
  ];
}
<#}#>

<# end #>

<# block 'bt-filter' : #>
<#@ context 'ctx'#>
<# const {entity, f} = ctx;#>
filter: ({ source, uix, label  }) => {
  source = source ? `${source}.` : '';
  return (classes, translate, uix) => [
    <uix.NullableBooleanInput 
    label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate("uix.filter.exists",{ name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}')})}`} 
    source="#{f.source}-exists" />,

    <uix.ReferenceInput
      className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.eq', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      source="#{f.source}-eq"
      reference="#{f.ref.entity}"
      perPage={10000}
      allowEmpty
    >
      <uix.SelectInput optionText={<uix.#{f.ref.entity}.SelectTitle />} />
    </uix.ReferenceInput>,

    <uix.ReferenceInput
    className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.ne', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      source="#{f.source}-ne"
      reference="#{f.ref.entity}"
      perPage={10000}
      allowEmpty
    >
      <uix.SelectInput optionText={<uix.#{f.ref.entity}.SelectTitle />} />
    </uix.ReferenceInput>,
    
    <uix.ReferenceInput
      className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.in', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      source="#{f.source}-in"
      reference="#{f.ref.entity}"
      perPage={10000}
      allowEmpty
    >
      <uix.SelectArrayInput
        optionText={<uix.#{f.ref.entity}.SelectTitle />}
      />
    </uix.ReferenceInput>,
    <uix.ReferenceInput
    className={classes.formControl}
      label={`${label ? label.split(' ').map(translate).join(' '):''} ${translate('uix.filter.nin', {
        name: translate('resources.#{f.inheritedFrom || entity.name}.fields.#{f.name}'),
      })}`}
      source="#{f.source}-nin"
      reference="#{f.ref.entity}"
      perPage={10000}
      allowEmpty
    >
      <uix.SelectArrayInput
        optionText={<uix.#{f.ref.entity}.SelectTitle />}
      />
    </uix.ReferenceInput>,
  ];
}
<# end #>