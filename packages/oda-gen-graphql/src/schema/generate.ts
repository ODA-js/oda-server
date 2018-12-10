import * as fs from 'fs-extra';
import * as path from 'path';
import * as template from '../graphql-backend-template';
import AclDefault from '../acl';

import { lib } from 'oda-gen-common';

const { deepMerge } = lib;
const { defaultTypeMapper, prepareMapper } = template.utils;

import templateEngine from './templateEngine';
import initModel from './initModel';
import generator from './generator';

import { collectErrors, showLog, hasResult } from './validate';
import { commit } from './writeFile';
import { IValidationResult } from 'oda-model';
import { GeneratorInit } from './init';

export default function generate({
  hooks,
  schema,
  rootDir,
  templateRoot = path.resolve(__dirname, '../../js-templates'),
  acl,
  context,
  logs,
}: GeneratorInit) {
  const actualTypeMapper = deepMerge(
    defaultTypeMapper,
    context.typeMapper || {},
  );

  const defaultAdapter = context.defaultAdapter;

  // передавать в методы кодогенерации.
  let secureAcl = new AclDefault(acl);
  const aclAllow = secureAcl.allow.bind(secureAcl);

  let raw = templateEngine({
    root: templateRoot,
  });
  //mutating config...
  const { modelStore, packages } = initModel({
    schema,
    hooks,
    secureAcl,
  });

  const systemPackage = packages.get('system');
  const typeMapper: { [key: string]: (inp: string) => string } = Object.keys(
    actualTypeMapper,
  ).reduce((hash, type) => {
    hash[type] = prepareMapper(actualTypeMapper[type], systemPackage);
    return hash;
  }, {});

  // generate per package
  const errors: IValidationResult[] = collectErrors(modelStore);
  if (hasResult(errors, 'error')) {
    console.error('please fix followings errors to proceed');
    showLog(errors, logs);
  } else {
    fs.ensureDirSync(rootDir);
    // generate per package
    [...packages.values()].filter(p => !p.abstract).forEach(pkg => {
      console.time('gql');
      generator(
        pkg,
        raw,
        rootDir,
        pkg.name,
        aclAllow,
        typeMapper,
        defaultAdapter,
      );
      console.timeEnd('gql');
    });
  }
  commit().then(() => console.log('finish'));
}
