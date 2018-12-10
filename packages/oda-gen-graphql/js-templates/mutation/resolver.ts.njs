<#@ context 'mutation' -#>
import * as log4js from 'log4js';
let logger = log4js.getLogger('graphql:mutation:#{mutation.name}:');

import { mutateAndGetPayload } from 'oda-api-graphql';
export const resolver = {
  #{mutation.name}: mutateAndGetPayload(
    async (
      args: {
    <#- for (let f of mutation.args) {#>
        #{f.name}?: #{f.type},
    <#-}#>
      },
      context,
      info
    ) => {
      logger.trace('#{mutation.name}');
      let result: {
        // what must be in output
    <#- for (let f of mutation.payload) {#>
        #{f.name}?: any; // #{f.type},
    <#-}#>
      };
      result = {};
      // put your code here
      return result;
    }
  ),
};
