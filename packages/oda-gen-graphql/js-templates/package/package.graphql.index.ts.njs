<#@ context 'pack' -#>
import { common } from 'oda-gen-graphql';
import { #{pack.name}Entities } from './entity';
import { #{pack.name}Mutations } from './mutation';

export class #{pack.name}Package extends common.types.GQLModule {
  protected _name = '#{pack.name}Package';
  protected _composite: common.types.GQLModule[] = [
    new #{pack.name}Entities({}),
    new #{pack.name}Mutations({}),
    new common.types.DefaultTypes({}),
  ];
}
