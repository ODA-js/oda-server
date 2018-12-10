<#@ context "entity" -#>
<#@ alias 'actions' -#>
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-admin';


<# entity.actions.forEach(action=>{#>
// #{action.name}
// #{action.actionType}
// #{action.actionName}

export const #{action.actionName} = '#{action.actionName}';
export const #{action.actionCreatorName} = (data) => ({
  type: #{action.actionName},
  payload: { data, resource: '#{entity.name}' },
  // dataProvider hack
  meta: { fetch: 'EXECUTE', resource: '#{action.actionCreatorName}' },
});

/**
*  // define this method in dataProvider to use this
*  async function #{action.actionCreatorName}(data, resource){
*    
*  }
*/

class #{action.fullName}Action  extends Component {
  handleClick = () => {
    const { #{action.actionCreatorName}, record } = this.props;
    #{action.actionCreatorName}(record);
  }
  render(){
    return(<Button onClick={this.handleClick} label="resources.#{entity.name}.actions.#{action.name}"/>);
  }
}

#{action.fullName}Action.propTypes = {
  #{action.actionCreatorName}: PropTypes.func.isRequired,
  record: PropTypes.object,
};

export const #{action.fullName}Button = connect(null, {
  #{action.actionCreatorName},
})(#{action.fullName}Action);

<#})#>