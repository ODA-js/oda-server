<#@ context "entity" -#>
<#@ alias 'forms-index' -#>

import React from 'react';
import PropTypes from 'prop-types';
import Title  from './title';
import SelectTitle  from './selectTitle';
import Filter  from './filter';
import { Fragments, FieldSets, getFields, buttons, actions }  from './fragments';
import { 
  CreateFormSimple,
  EditFormSimple, 
  CreateFormTabbed,
  EditFormTabbed,
  ShowSimpleView,
  ShowTabbedView,
}  from './form';
import List  from './list';
import Grid  from './grid';
import CardView  from './cardView';
import GridView  from './gridView';
import ListView  from './listView';
import Preview  from './preview';

const Show = (props,{uix}) => (
  <uix.Responsive
    small={<uix.#{entity.name}.ShowSimpleView {...props} />}
    medium={<uix.#{entity.name}.ShowTabbedView {...props} />}
  />
);

Show.contextTypes = {
  uix: PropTypes.object.isRequired,
}

const Edit = (props,{uix}) => (
  <uix.Responsive
    small={<uix.#{entity.name}.EditFormSimple {...props} />}
    medium={<uix.#{entity.name}.EditFormTabbed {...props} />}
  />
);

Edit.contextTypes = {
  uix: PropTypes.object.isRequired,
}

const Create = (props,{uix}) => (
  <uix.Responsive
    small={<uix.#{entity.name}.CreateFormSimple {...props} />}
    medium={<uix.#{entity.name}.CreateFormTabbed {...props} />}
  />
);

Create.contextTypes = {
  uix: PropTypes.object.isRequired,
}

export default {
  name: '#{entity.name}',
  role: '#{entity.role}',
  Title,
  SelectTitle,
  Filter,
  List,
  Create,
  Edit,
  Show,
  CreateFormSimple, 
  CreateFormTabbed,
  EditFormSimple,
  EditFormTabbed,
  ShowSimpleView,
  ShowTabbedView,
  Preview,
  Grid,
  CardView,
  GridView,
  ListView,
  Fragments,
  FieldSets, 
  getFields,
  ...buttons,
  ...actions,
};