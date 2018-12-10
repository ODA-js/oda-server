<#@ context 'pack' -#>
<#@ alias 'registerConnectors' #>
<#- for(let entity of pack.entities){#>
import #{entity.name} from './#{entity.name}/adapter/connector';
import { #{entity.name}Connector } from './#{entity.name}/adapter/interface';

<#- }#>

import { acl, ACLCheck, SecurityContext } from 'oda-api-graphql';

export default class RegisterConnectors {
<#- for(let entity of pack.entities){#>
  public get #{entity.name}(): #{entity.name}Connector {
    return this.Init#{entity.name}();
  }

  public Init#{entity.name}(): #{entity.name}Connector {
    if (!this._#{entity.name}) {
      this._#{entity.name} = new #{entity.name}({ #{entity.adapter}: this.#{entity.adapter}, connectors: this, securityContext: this.securityContext });
    }
    return this._#{entity.name};
  }

<#- }#>

<#- for(let entity of pack.entities){#>
  protected _#{entity.name}: #{entity.name}Connector;
<#- }#>

  public mongoose;
  public sequelize;
  public userGQL;
  public systemGQL;

  public securityContext: SecurityContext<RegisterConnectors>

  public initGQL({
    userGQL,
    systemGQL
  }: {
      userGQL?,
      systemGQL?,
    }) {
    this.userGQL = userGQL ? userGQL : this.userGQL;
    this.systemGQL = systemGQL ? systemGQL : this.systemGQL;
  }

  protected _defaultAccess(context, obj: {
    source?: any,
    payload?: any;
  }): object {
    let result = obj.source;
    return result;
  };

  protected _defaultCreate(context, obj: {
    source?: any,
    payload?: any;
  }): object {
    let result = obj.payload;
    return result;
  };

  constructor({
    user,
    owner,
    mongoose,
    sequelize,
    acls,
    userGroup,
    userGQL,
    systemGQL,
  }:
    {
      user?: any,
      owner?: any,
      mongoose?: any,
      sequelize?: any,
      acls?: {
        read?: acl.secureAny.Acls<ACLCheck>;
        update?: acl.secureAny.Acls<ACLCheck>;
        create?: acl.secureAny.Acls<ACLCheck>;
        remove?: acl.secureAny.Acls<ACLCheck>;
      }
      userGroup?: string;
      userGQL?,
      systemGQL?,
    }) {
    this.securityContext = acls && {
      user,
      group: userGroup,
      acls: {
        read: new acl.secureAny.Secure<ACLCheck>({
          acls: acls ? {
            "*": this._defaultAccess,
            ...acls.read
          } : undefined
        }),
        update: new acl.secureAny.Secure<ACLCheck>({
          acls: acls ? {
            "*": this._defaultAccess,
            ...acls.update
          } : undefined
        }),
        create: new acl.secureAny.Secure<ACLCheck>({
          acls: acls ? {
            "*": this._defaultCreate,
            ...acls.create
          } : undefined
        }),
        remove: new acl.secureAny.Secure<ACLCheck>({
          acls: acls ? {
            "*": this._defaultAccess,
            ...acls.remove
          } : undefined
        }),
      }
    }
    this.mongoose = mongoose;
    this.sequelize = sequelize;
    this.initGQL({ userGQL, systemGQL });
  }

  async syncDb(force: boolean = false) {
<#- let list = pack.entities.filter(e=>e.adapter === 'sequelize') #>
<#- if(list.length > 0){ #>
<#-   for(let entity of list){#>
    this.Init#{entity.name}();
<#-   }#>
    await this.sequelize.sync({force});
<#-}#>
  }

  async close() {
    if (this.sequelize && typeof this.sequelize.close === 'function') {
      await this.sequelize.close();
    }
    if (this.mongoose && typeof this.mongoose.close === 'function') {
      await this.mongoose.close();
    }
  }
};
