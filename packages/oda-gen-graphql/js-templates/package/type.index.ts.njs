<#@ context 'pack' -#>
<#@ chunks '$$$main$$$' -#>

<# chunkStart(`index.ts`); #>
import { common } from 'oda-gen-graphql';
import { NodeEntity } from './node';
import { ViewerEntity } from './viewer';

<# for(let entity of pack.entities){-#>
import { #{entity.name} } from './#{entity.name}';
<#}-#>

export class #{pack.name}Entities extends common.types.GQLModule {
  protected _name = '#{pack.name}Entities';
  protected _composite = [
    new NodeEntity({}),
    new ViewerEntity({}),
<# for(let entity of pack.entities){-#>
    new #{entity.name}({}),
<#}-#>
  ];
}

<# chunkStart(`../dataPump/index.ts`); -#>
import * as _ from 'lodash';
<# for(let entity of pack.entities){-#>
import #{entity.name} from './#{entity.name}';
<#}-#>

const result = _.merge (
<# for(let entity of pack.entities){-#>
    #{entity.name},
<#}-#>
)

export default {
  ...result
};
