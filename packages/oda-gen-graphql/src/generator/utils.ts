import { GeneratorConfig } from './interfaces';
import defaultConfig from './defaultConfig';
import AclDefault from '../acl';

export function ensureConfigValues(cp, pname) {
  if (
    !(
      cp.hasOwnProperty(pname) ||
      typeof cp[pname] === 'boolean' ||
      Array.isArray(cp[pname])
    )
  ) {
    return false;
  } else {
    return cp[pname];
  }
}

export function fill(src: Object, value: any) {
  const result = {};
  let keys = Object.keys(src);
  for (let i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];
    if (typeof src[key] === 'object') {
      result[key] = fill(src[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function traversePackage(src: any, origin: any): any {
  let result;
  if (src === undefined || src === null || src === '') {
    result = fill(origin, false);
  } else if (Array.isArray(src)) {
    for (let i = 0, len = src.length; i < len; i++) {
      result = fill(origin, src);
    }
  } else if (typeof src === 'boolean') {
    result = fill(origin, src);
  } else {
    result = {};
    let keys = Object.keys(origin);
    for (let i = 0, len = keys.length; i < len; i++) {
      let key = keys[i];
      if (origin.hasOwnProperty(key)) {
        let origType = typeof origin[key];

        if (origType === 'boolean') {
          result[key] = ensureConfigValues(src, key);
        } else if (origType === 'object') {
          result[key] = traversePackage(src[key], origin[key]);
        }
      }
    }
  }
  return result;
}

export const expandConfig = (config: any, packages: string[]) => {
  let packConfig: GeneratorConfig = {} as GeneratorConfig;

  if (!config.hasOwnProperty('graphql')) {
    packConfig.graphql = defaultConfig.graphql;
  } else {
    packConfig.graphql = config.graphql;
  }

  if (!config.hasOwnProperty('ts')) {
    packConfig.ts = defaultConfig.ts;
  } else {
    packConfig.ts = config.ts;
  }

  if (!config.hasOwnProperty('ui')) {
    packConfig.ui = defaultConfig.ui;
  } else {
    packConfig.ui = config.ui;
  }

  if (!config.hasOwnProperty('schema')) {
    packConfig.schema = defaultConfig.schema;
  } else {
    packConfig.schema = config.schema;
  }

  if (config.packages === undefined) {
    config.packages = defaultConfig.package;
  }
  if (!Array.isArray(packages)) {
    packages = ['system'];
  } else if (packages.length === 0) {
    packages.push('system');
  }
  packConfig.packages = {};
  if (typeof config.packages === 'boolean') {
    if (config.packages) {
      config.packages = {};
      for (let i = 0, len = packages.length; i < len; i++) {
        packConfig.packages[packages[i]] = defaultConfig.package;
      }
    }
  } else if (Array.isArray(config.packages)) {
    for (let i = 0, len = config.packages.length; i < len; i++) {
      packConfig.packages[config.packages[i]] = defaultConfig.package;
    }
  } else if (typeof config.packages === 'object') {
    if (
      config.packages.hasOwnProperty('mutation') ||
      config.packages.hasOwnProperty('entity') ||
      config.packages.hasOwnProperty('package')
    ) {
      for (let i = 0, len = packages.length; i < len; i++) {
        packConfig.packages[packages[i]] = config.packages;
      }
    } else {
      // we guess that it contains package names with config;
      let packagesNames = Object.keys(config.packages);
      for (let i = 0, len = packagesNames.length; i < len; i++) {
        let currPack = config.packages[packagesNames[i]];
        // expand it
        packConfig.packages[packagesNames[i]] = traversePackage(
          currPack,
          defaultConfig.package,
        );
      }
    }
  }
  return packConfig;
};

export interface IPackageDef {
  [security: string]: {
    acl: number;
    entities: { [name: string]: boolean };
    mutations: { [name: string]: boolean };
  };
}

export function initPackages(secureAcl: AclDefault): IPackageDef {
  return secureAcl.roles.reduce((store, cur) => {
    // only create if not exists!
    if (!store[cur]) {
      store[cur] = {
        entities: {},
        mutations: {},
      };
    }
    return store;
  }, {});
}

export function pushToAppropriate({
  item,
  acl,
  path,
  packages,
}: {
  item: { name: string };
  acl: string | string[];
  path: string;
  packages: IPackageDef;
}) {
  if (acl) {
    if (!Array.isArray(acl)) {
      acl = [acl];
    }
    for (let i = 0, len = acl.length; i < len; i++) {
      packages[acl[i]][path][item.name] = true;
    }
  }
}
