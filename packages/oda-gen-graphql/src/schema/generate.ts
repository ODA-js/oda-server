import * as fs from 'fs-extra';
import * as path from 'path';
import * as template from '../graphql-backend-template';
import { merge } from 'lodash';
const { defaultTypeMapper, prepareMapper } = template.utils;

import templateEngine from './templateEngine';
import initModel from './initModel';
import generator from './generator';

import { commit } from './writeFile';
import { GeneratorInit } from './init';

export default function generate({
  hooks,
  schema,
  rootDir,
  templateRoot = path.resolve(__dirname, '../../js-templates'),
  context,
}: GeneratorInit) {
  const actualTypeMapper = merge(defaultTypeMapper, context.typeMapper || {});

  const defaultAdapter = context.defaultAdapter;

  // передавать в методы кодогенерации.

  let raw = templateEngine({
    root: templateRoot,
  });
  //mutating config...
  const { modelStore, packages } = initModel({
    schema,
    hooks,
  });

  const systemPackage = packages.get('system');
  const typeMapper: { [key: string]: (inp: string) => string } = Object.keys(
    actualTypeMapper,
  ).reduce((hash, type) => {
    hash[type] = prepareMapper(actualTypeMapper[type], systemPackage);
    return hash;
  }, {});

  fs.ensureDirSync(rootDir);
  // generate per package
  [...packages.values()]
    .filter(p => !p.abstract)
    .forEach(pkg => {
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
  commit().then(() => console.log('finish'));
}
