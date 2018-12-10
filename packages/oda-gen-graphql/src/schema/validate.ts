import {
  IValidationResult,
  ValidationResultType,
  Validator,
  ModelPackage,
} from 'oda-model';

import AclDefault from '../acl';
import initModel from './initModel';
import { MetaModel } from 'oda-model';
import { GeneratorInit } from './init';

export function hasResult(
  log: IValidationResult[],
  type: ValidationResultType,
) {
  return log.some(item => item.result === type);
}

export function showLog(
  log,
  visibility: ValidationResultType | ValidationResultType[] = [
    'error',
    // 'warning',
    // 'critics',
    // 'fixable',
  ],
) {
  if (!Array.isArray(visibility)) {
    visibility = [visibility];
  }

  visibility.forEach(visibilityItem => {
    const current = log.filter(item => item.result === visibilityItem);

    const errorLog = current.reduce((status, item) => {
      if (!status[item.package]) {
        status[item.package] = {};
      }
      if (!status[item.package][item.entity]) {
        status[item.package][item.entity] = {};
      }
      if (!status[item.package][item.entity][item.field]) {
        status[item.package][item.entity][item.field] = {};
      }
      if (!status[item.package][item.entity][item.field][item.result]) {
        status[item.package][item.entity][item.field][item.result] = [];
      }
      status[item.package][item.entity][item.field][item.result].push(
        item.message,
      );
      return status;
    }, {});

    if (current.length > 0) {
      console.log(visibilityItem);
      Object.keys(errorLog).forEach(pkg => {
        console.log(`package: ${pkg}`);
        Object.keys(errorLog[pkg]).forEach(entity => {
          console.log(`  ${entity}`);
          Object.keys(errorLog[pkg][entity]).forEach(field => {
            const errList = Object.keys(errorLog[pkg][entity][field]).filter(
              c => c === visibilityItem,
            );
            if (errList.length > 0) {
              console.log(`    ${field}`);
              errorLog[pkg][entity][field][errList[0]].forEach(m => {
                console.log(`      ${m}`);
              });
            }
          });
        });
      });
    }
  });
}

export function collectErrors(model: MetaModel) {
  const validator = Validator();
  const errors: IValidationResult[] = model.validate(validator);
  //custom validator
  return errors;
}

export default function validate(args: GeneratorInit) {
  let {
    hooks,
    schema,
    acl,
    context = {} as {
      typeMapper: any;
      defaultAdapter: string;
    },
    logs,
  } = args;

  // передавать в методы кодогенерации.
  let secureAcl = new AclDefault(acl);

  //mutating config...
  const { modelStore } = initModel({
    schema,
    hooks,
    secureAcl,
  });

  // generate per package
  const errors: IValidationResult[] = collectErrors(modelStore);

  showLog(errors, logs);
}
