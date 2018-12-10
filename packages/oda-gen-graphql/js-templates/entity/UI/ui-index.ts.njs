<#@ context 'pack' -#>
<#@ chunks '$$$main$$$' -#>

<#- chunkStart(`./resources.js`); -#>
<# for(let entity of pack.entities){-#>
import #{entity.name}Resource from './#{entity.name}/queries';
<#}-#>

import { data } from 'oda-ra-data-provider';

export class Resources extends data.resource.ResourceContainer {
  constructor(...args){
    super(...args);
    this.override([
<# for(let entity of pack.entities){-#>
      #{entity.name}Resource,
<#}-#>
    ]);
  }
}

<#- chunkStart(`./index.js`); -#>
import {Fragment} from 'react';
<# for(let entity of pack.entities){-#>
import #{entity.name}UIX from './#{entity.name}';
<#}-#>
<# for(let en_ of pack.enums){-#>
import #{en_.name} from './#{en_.name}';
<#}#>

import Admin from './admin';
import InputWithPreview from './InputWithPreview';
import QuickCreateButton from './quickCreate';
import TimeInput from '../../modules/TimeInput';
import TimeField from '../../modules/TimeField';
import FixedTimeInput from '../../modules/FixedTimeInput';
import FixedTimeField from '../../modules/FixedTimeField';

import {
  //primitives
  //input
  DateInput,
  DateTimeInput,
  TextInput,
  BooleanInput,
  DisabledInput,
  ImageInput,
  FileInput,
  LongTextInput,
  NumberInput,
  //field
  TextField,
  DateField,
  BooleanField,
  NullableBooleanInput,
  ImageField,
  FileField,
  NumberField,
  RichTextField,
  UrlField,
  ChipField,
  EmailField,
  //complex
  //input
  // array
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  // select from list
  AutocompleteInput,
  AutocompleteArrayInput,
  CheckboxGroupInput,
  RadioButtonGroupInput,
  //
  //reference
  ReferenceArrayInput,
  SelectArrayInput,
  ReferenceInput,
  SelectInput,
  //field
  ArrayField,
  ReferenceManyField,
  FunctionField,
  SelectField,
  ReferenceField,
  ReferenceArrayField,
  SimpleList,
  // ref items
  SingleFieldList,
  Datagrid,
  //layout single item
  Show,
  SimpleShowLayout,
  TabbedShowLayout,
  Tab,
  Create,
  Edit,
  SimpleForm,
  TabbedForm,
  FormTab,
  // layout list items
  List,
  // universal
  Responsive,
  //layput controls
  Toolbar,
  Filter,
  Pagination,
  CardActions,
  // buttons
  Button,
  ShowButton,
  EditButton,
  DeleteButton,
  CloneButton,
  BulkDeleteButton,
  SaveButton,
  // functions
  required,
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';
import { Tree, NodeView, NodeActions } from 'ra-tree-ui-materialui';

export const components = {
  InputWithPreview,
  QuickCreateButton,
  primitive: {
    Text: { input: TextInput, field: TextField },
    LongText: { input: LongTextInput, field: TextField },
    Number: { input: NumberInput, field: NumberField },
    Date: { input: DateInput, field: DateField },
    DateTime: { input: DateTimeInput, field: DateField },
    Time: { input: TimeInput, field: TimeField },
    FixedTime: { input: FixedTimeInput, field: FixedTimeField },
    Boolean: { input: BooleanInput, field: BooleanField },
    ID: { input: DisabledInput, field: TextField },
    File: { input: FileInput, field: FileField },
    Image: { input: ImageInput, field: ImageField },
    RichText: { input: RichTextInput, field: RichTextField },
    URL: { input: TextInput, field: UrlField },
    Email: { input: TextInput, field: EmailField },
    NullableBoolean: { input: NullableBooleanInput, field: BooleanField },
    // сделать функцию для работы с типами...
    Derived: field => ({ input: DisabledInput, field }),
<# for(let en_ of pack.enums){-#>
    #{en_.name},
<#}#>
  },
  //primitives
  //input
  DateInput,
  TimeInput,
  FixedTimeInput,
  TextInput,
  BooleanInput,
  DisabledInput,
  ImageInput,
  FileInput,
  LongTextInput,
  NumberInput,
  RichTextInput,
  //field
  TextField,
  TimeField,
  FixedTimeField,
  DateField,
  BooleanField,
  NullableBooleanInput,
  ImageField,
  FileField,
  NumberField,
  RichTextField,
  UrlField,
  ChipField,
  EmailField,
  //complex
  //input
  // array
  ArrayInput,
  SimpleFormIterator,
  FormDataConsumer,
  // select from list
  AutocompleteInput,
  AutocompleteArrayInput,
  CheckboxGroupInput,
  RadioButtonGroupInput,
  //
  //reference
  ReferenceArrayInput,
  SelectArrayInput,
  ReferenceInput,
  SelectInput,
  //field
  ArrayField,
  ReferenceManyField,
  FunctionField,
  SelectField,
  ReferenceField,
  ReferenceArrayField,
  SimpleList,
  // ref items
  SingleFieldList,
  Datagrid,
  //layout single item
  Show,
  SimpleShowLayout,
  TabbedShowLayout,
  Tab,
  Create,
  Edit,
  SimpleForm,
  TabbedForm,
  FormTab,
  // layout list items
  List,
  // universal
  Responsive,
  //layput controls
  Toolbar,
  Filter,
  Pagination,
  CardActions,
  // buttons
  Button,
  ShowButton,
  EditButton,
  DeleteButton,
  CloneButton,
  BulkDeleteButton,
  SaveButton,
  //tree
  Tree,
  NodeView,
  NodeActions,
  // functions
  required,
};

export { Admin };

export const uix = {
  Fragment,
  ...components,
<#
 for(let entity of pack.entities){-#>
  "#{entity.name}": #{entity.name}UIX,
<#}-#>
};

<#- chunkStart(`./i18n/index.js`); -#>
import {merge} from 'lodash';

<# for(let entity of pack.entities){-#>
import #{entity.name}Translate from './#{entity.name}';
<#}-#>

<# for(let en_ of pack.enums){-#>
import { translation as #{en_.name} } from '../#{en_.name}';
<#}#>

const messages = {
  uix: {
    "filter": {
      "search": "Search",
      "exists": "%{name} exists",
      "eq": "%{name} =",
      "ne": "%{name} !=",
      "lte": "%{name} <=",
      "gte": "%{name} >=",
      "lt": "%{name} <",
      "gt": "%{name} >",
      "imatch": "%{name}",
      "in": "%{name} in",
      "nin": "%{name} not in",
    },
    actions:{
      "create_and_add": "Create more...",
      "preview": "Quick View",
    },
    "actionType": {
      "CREATE": "Create",
      "UPDATE": "Update Existing",
      "CLONE": "Copy Selected",
      "USE": "Use Existing",
      "UNLINK": "Unlink",
      "ExpectedTo": "Expected To"
    }
  }
}

export default
  merge(
    messages,
<# for(let entity of pack.entities){-#>
    #{entity.name}Translate,
<#}-#>
<# for(let en_ of pack.enums){-#>
    #{en_.name},
<#}#>
  )

<#- chunkStart(`./resource-menu-items.js`); -#>
import React from 'react';
import ListIcon from '@material-ui/icons/view-list';
import { translate } from 'react-admin';

export default {
<# for(let entity of pack.entities.filter(e=> !e.embedded && !e.abstract)){-#>
  "#{entity.name}": { icon: <ListIcon />, visible: true, name: translate('resources.#{entity.name}.name', { smart_count:2 }) },
<#}-#>
};

<#- chunkStart(`./admin.js`); -#>
import React from 'react';
import { Admin, Resource } from 'react-admin';
import englishMessages from 'ra-language-english';
import translation from './i18n';
import { merge } from 'lodash';
import { uix as getUIX } from './';
import UIXContextProvider from './UIXContextProvider';

const messages = {
  en: {
    ...merge({}, englishMessages, translation),
  },
};

const i18nProviderGenerated = locale => messages[locale];

export default ({ title, dataProvider, authProvider, customSagas, i18nProvider,
  locale, uix, history,}) => (
  <UIXContextProvider  uix={uix || getUIX}>
    <Admin
      history={history}
      i18nProvider={i18nProvider || i18nProviderGenerated}
      title={title}
      dataProvider={dataProvider}
      authProvider={authProvider}
      customSagas={customSagas}
      locale={locale || 'en'} >
    <# for(let entity of pack.entities.filter(e=> !(e.embedded || e.abstract))){-#>
        <Resource
          key={"#{entity.name}"}
          show={(uix || getUIX).#{entity.name}.Show}
          name={"#{entity.name}"}
          edit={(uix || getUIX).#{entity.name}.Edit}
          create={(uix || getUIX).#{entity.name}.Create}
          list={(uix || getUIX).#{entity.name}.List}
          options={{ label: `resources.${(uix || getUIX).#{entity.name}.name}.name` }}
        />
    <#}-#>
    </Admin>
  </UIXContextProvider>
);

<#- chunkStart(`./UIXContextProvider.js`); -#>

import { Component } from 'react';
import PropTypes from 'prop-types';
import * as invariant from 'invariant';

export default class UIXContextProvider extends Component {
  constructor(props, context) {
    super(props, context);
    invariant(props.uix, 'expected `uix` prop initilization');
  }
  getChildContext() {
    return {
      uix: this.props.uix,
    };
  }
  render() {
    return this.props.children;
  }
}

UIXContextProvider.childContextTypes = {
  uix: PropTypes.object.isRequired,
};

<#- chunkStart(`./InputWithPreview.js`); -#>
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';

import { Field } from 'redux-form';
import IconImageEye from '@material-ui/icons/RemoveRedEye';
import CloseIcon from '@material-ui/icons/Close';
import { Button } from 'react-admin';
import { ReferenceInput } from 'react-admin';
import QuickCreateButton from './quickCreate';

class PreviewButtonBase extends Component {
  state = { showPanel: false };

  handleClick = () => {
    this.setState({ showPanel: true });
  };

  handleCloseClick = () => {
    this.setState({ showPanel: false });
  };

  render() {
    const { showPanel } = this.state;
    const { id, resource, basePath, showForm: ShowForm } = this.props;
    return (
      <Fragment>
        <Button onClick={this.handleClick} label="ra.action.show">
          <IconImageEye />
        </Button>
        <Drawer anchor="right" open={showPanel} onClose={this.handleCloseClick}>
          <div>
            <Button label="ra.action.cancel" onClick={this.handleCloseClick}>
              <CloseIcon />
            </Button>
          </div>
          <ShowForm id={id} basePath={basePath} resource={resource} />
        </Drawer>
      </Fragment>
    );
  }
}

PreviewButtonBase.propTypes = {
  showForm: PropTypes.any.isRequired,
};

const PreviewButton = connect()(PreviewButtonBase);

const InputWithPreview = (
  { optionText, preview, from, Select, ...props },
  { uix },
) => (
  <Fragment>
    <ReferenceInput {...props}>
      <Select optionText={optionText} />
    </ReferenceInput>
    <QuickCreateButton
      resource={props.reference}
      source={props.source}
      from={from}
    />
    <Field
      name={props.source}
      component={({ input }) =>
        input.value && (
          <PreviewButton
            id={input.value}
            basePath={`/${props.reference}`}
            resource={props.reference}
            showForm={uix[props.reference].Preview}
          />
        )
      }
    />
    <Field
      name={props.source}
      component={({ input }) =>
        input.value && (
          <uix.EditButton
            record={{ id: props.record[props.source] }}
            basePath={`/${props.reference}`}
            resource={props.reference}
          />
        )
      }
    />
  </Fragment>
);

InputWithPreview.contextTypes = {
  uix: PropTypes.object.isRequired,
};

export default InputWithPreview;

<#- chunkStart(`./quickCreate.js`); -#>
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { change, submit, isSubmitting } from 'redux-form';
import {
  fetchEnd,
  fetchStart,
  showNotification,
  crudGetMatching,
  Button,
  SaveButton,
  SimpleForm,
  CREATE,
  REDUX_FORM_NAME,
} from 'react-admin';
import IconContentAdd from '@material-ui/icons/Add';
import IconCancel from '@material-ui/icons/Cancel';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import { dataProvider } from './../../configure';

class CreateButton extends Component {
  state = {
    error: false,
    showDialog: false,
  };

  handleClick = () => {
    this.setState({ showDialog: true });
  };

  handleCloseClick = () => {
    this.setState({ showDialog: false });
  };

  handleSaveClick = () => {
    const { submit } = this.props;

    // Trigger a submit of our custom quick create form
    // This is needed because our modal action buttons are oustide the form
    submit(`quick-create`);
  };

  handleSubmit = values => {
    const {
      change,
      crudGetMatching,
      fetchStart,
      fetchEnd,
      showNotification,
    } = this.props;
    // Dispatch an action letting react-admin know a API call is ongoing
    fetchStart();

    // As we want to know when the new post has been created in order to close the modal, we use the
    // dataProvider directly
    dataProvider(CREATE, this.props.resource, { data: values })
      .then(({ data }) => {
        // Refresh the choices of the ReferenceInput to ensure our newly created post
        // always appear, even after selecting another post
        crudGetMatching(
          this.props.resource,
          `${this.props.from}@${this.props.source}`,
          { page: 1, perPage: 25 },
          { field: 'id', order: 'DESC' },
          {},
        );

        // Update the main react-admin form (in this case, the comments creation form)
        change(REDUX_FORM_NAME, this.props.source, data.id);
        this.setState({ showDialog: false });
      })
      .catch(error => {
        showNotification(error.message, 'error');
      })
      .finally(() => {
        // Dispatch an action letting react-admin know a API call has ended
        fetchEnd();
      });
  };

  render() {
    const { showDialog } = this.state;
    const { isSubmitting } = this.props;
    const { uix, translate } = this.context;
    const formLabel = `${translate('ra.action.create')} ${translate(
      `resources.${this.props.resource}.name`,
      { smart_count: 1 },
    )}`;
    return (
      <Fragment>
        <Button onClick={this.handleClick} label="ra.action.create">
          <IconContentAdd />
        </Button>
        <Dialog
          fullWidth
          open={showDialog}
          onClose={this.handleCloseClick}
          aria-label={formLabel}
        >
          <DialogTitle>{formLabel}</DialogTitle>
          <DialogContent>
            <SimpleForm
              // We override the redux-form name to avoid collision with the react-admin main form
              form={`quick-create`}
              resource={this.props.resource}
              // We override the redux-form onSubmit prop to handle the submission ourselves
              onSubmit={this.handleSubmit}
              // We want no toolbar at all as we have our modal actions
              toolbar={null}
            >
              {uix[this.props.resource].getFields({
                name: 'quick-create',
                uix,
                type: 'edit',
              })}
            </SimpleForm>
          </DialogContent>
          <DialogActions>
            <SaveButton saving={isSubmitting} onClick={this.handleSaveClick} />
            <Button label="ra.action.cancel" onClick={this.handleCloseClick}>
              <IconCancel />
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

CreateButton.contextTypes = {
  uix: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isSubmitting: isSubmitting(`quick-create`)(state),
});

const mapDispatchToProps = {
  change,
  crudGetMatching,
  fetchEnd,
  fetchStart,
  showNotification,
  submit,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateButton);
