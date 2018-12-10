import { IValidationResult } from 'oda-model';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as template from '../graphql-backend-template';
import AclDefault from '../acl';

import { lib } from 'oda-gen-common';

const { deepMerge } = lib;
const { defaultTypeMapper, prepareMapper } = template.utils;

import { Generator } from './interfaces';

import $generateGraphql from './generators/graphql';
import $generateData from './generators/data';
import $generateDataPkg from './generators/dataPackage';
import $generatePkg from './generators/package';
import $generateModel from './generators/model';
import templateEngine from './templateEngine';
import initModel from './initModel';
import { collectErrors, showLog, hasResult } from './validate';
import { commit } from './generators/writeFile';

export default (args: Generator) => {
  let {
    hooks,
    pack,
    rootDir,
    templateRoot = path.resolve(__dirname, '../../js-templates'),
    config = {
      graphql: false,
      ts: false,
      packages: false,
      ui: false,
    },
    acl,
    context = {} as {
      typeMapper: any;
      defaultAdapter: string;
    },
    logs,
  } = args;

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
  const { modelStore, packages, config: _config } = initModel({
    pack,
    hooks,
    secureAcl,
    config,
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
    showLog(errors, logs);
    config = _config;

    fs.ensureDirSync(rootDir);

    if (config.ts) {
      // FIXIT:
      // generate data layer api
      let dataPackage = modelStore.packages.get('system');
      let curConfig = config.packages['system'];
      let generateData = $generateData.bind(
        null,
        dataPackage,
        raw,
        rootDir,
        typeMapper,
        defaultAdapter,
        Array.from(dataPackage.entities.values()),
        curConfig,
        'entity',
      );

      let generatePkg = $generateDataPkg.bind(
        null,
        raw,
        rootDir,
        dataPackage,
        typeMapper,
      );

      generateData('data.adapter.connector', 'ts');
      generateData('data.adapter.schema', 'ts');
      generateData('data.types.model', 'ts');
      // data-awarness
      generatePkg('indexMongooseConnectors', 'connectorIndex.ts');
      generatePkg('registerMongooseConnectors', 'registerConnectors.ts');
    }

    if (config.ts) {
      $generateModel(
        raw,
        rootDir,
        { packages },
        typeMapper,
        'registerConnectors',
        'registerConnectors.ts',
      );
    }

    // generate per package
    packages.forEach(pkg => {
      let generate = $generateGraphql.bind(
        null,
        pkg,
        raw,
        rootDir,
        pkg.name /*role is package name*/,
        aclAllow,
        typeMapper,
        defaultAdapter,
      );
      let generatePkg = $generatePkg.bind(null, raw, rootDir, typeMapper);
      const curConfig = config.packages[pkg.name];
      const entities = Array.from(pkg.entities.values());
      const mutations = Array.from(pkg.mutations.values());
      const enums = Array.from(pkg.enums.values());

      // доделать фильтрацию по названиям сущностей, пакетов и т.п.
      // entity/connections

      if (!pkg.abstract) {
        if (config.graphql) {
          generate(
            entities,
            curConfig,
            'entity',
            'connections.mutations.entry',
            'graphql',
          );
          generate(
            entities,
            curConfig,
            'entity',
            'connections.mutations.types',
            'graphql',
          );
          generate(
            entities,
            curConfig,
            'entity',
            'connections.types',
            'graphql',
          );
          generate(entities, curConfig, 'entity', 'mutations.entry', 'graphql');
          generate(entities, curConfig, 'entity', 'mutations.types', 'graphql');
          generate(
            entities,
            curConfig,
            'entity',
            'dataPump.queries',
            'graphql',
          );
          generate(
            entities,
            curConfig,
            'entity',
            'subscriptions.entry',
            'graphql',
          );
          generate(
            entities,
            curConfig,
            'entity',
            'subscriptions.types',
            'graphql',
          );
          generate(entities, curConfig, 'entity', 'query.entry', 'graphql');
          generate(entities, curConfig, 'entity', 'viewer.entry', 'graphql');
          generate(entities, curConfig, 'entity', 'type.entry', 'graphql');
          generate(entities, curConfig, 'entity', 'type.enums', 'graphql');
          generate(mutations, curConfig, 'mutation', 'types', 'graphql');
          generate(mutations, curConfig, 'mutation', 'entry', 'graphql');
        }

        if (config.ts) {
          generate(
            entities,
            curConfig,
            'entity',
            'connections.mutations.resolver',
            'ts',
          );
          generate(entities, curConfig, 'entity', 'mutations.resolver', 'ts');
          generate(entities, curConfig, 'entity', 'dataPump.config', 'ts');
          generate(
            entities,
            curConfig,
            'entity',
            'subscriptions.resolver',
            'ts',
          );
          generate(entities, curConfig, 'entity', 'query.resolver', 'ts');
          generate(entities, curConfig, 'entity', 'viewer.resolver', 'ts');
          generate(entities, curConfig, 'entity', 'type.resolver', 'ts');
          generate(entities, curConfig, 'entity', 'index', 'ts');
          generate(mutations, curConfig, 'mutation', 'resolver', 'ts');
          generate(mutations, curConfig, 'mutation', 'index', 'ts');

          generatePkg(pkg, '', 'graphqlIndex', 'index.ts');
          generatePkg(pkg, '', 'graphqlSchema', 'schema.ts');

          generatePkg(pkg, 'entity', 'typeIndex', 'index.ts');
          generatePkg(pkg, 'entity', 'node', 'node.ts');
          generatePkg(pkg, 'entity', 'viewer', 'viewer.ts');
          generatePkg(pkg, 'mutation', 'mutationIndex', 'index.ts');
        }
        if (config.ui) {
          generatePkg(pkg, '', 'uiIndex', 'index.js');
          generate(entities, curConfig, 'entity', 'UI.queries', 'js');
          generate(entities, curConfig, 'entity', 'UI.forms', 'js');
          generate(enums, curConfig, 'enums', 'UI.components', 'js');
        }
      }

      if (config.schema) {
        generatePkg(pkg, 'schema', 'schemaPuml', 'schema.puml');
      }
    });
  }
  // tslint:disable-next-line:no-console
  commit().then(() => console.log('finish'));
};
