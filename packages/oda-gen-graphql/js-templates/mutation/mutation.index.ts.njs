<#@ context 'entity' -#>
<#@ requireAs ('mutation/entry.graphql.njs', 'entry') #>
<#@ requireAs ('mutation/types.graphql.njs', 'types') #>
import { common } from 'oda-gen-graphql';
import { resolver } from './resolver';
let { fillDefaults } = common.lib;

export class #{entity.name}Mutation extends common.types.GQLModule {
  constructor(_args) {
    super(_args);
    this._name = '#{entity.name}Mutation';
    this._typeDef = fillDefaults(this._typeDef, {
      types: [
        `#{partial(entity.partials['types'], 'types')}`,
      ],
    });

    this._mutationEntry = fillDefaults(this._mutationEntry, {
      entry: [
        `#{partial(entity.partials['entry'], 'entry')}`,
      ],
    });

    this._mutation = fillDefaults(this._mutation, resolver);
  }
}
