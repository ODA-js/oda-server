import { lib } from 'oda-gen-common';
import { MetaModel } from 'oda-model';
import * as pathLib from 'path';
import AclDefault from '../acl';

const { get } = lib;

export interface IPackageDef {
  [security: string]: {
    acl: number;
    entities: { [name: string]: boolean };
    mutations: { [name: string]: boolean };
    queries: { [name: string]: boolean };
    enums: { [name: string]: boolean };
    mixins: { [name: string]: boolean };
    unions: { [name: string]: boolean };
    scalars: { [name: string]: boolean };
    directives: { [name: string]: boolean };
  };
}

export function initPackages(secureAcl: AclDefault): IPackageDef {
  return secureAcl.roles.reduce((store, cur) => {
    // only create if not exists!
    if (!store[cur]) {
      store[cur] = {
        entities: {},
        mutations: {},
        enums: {},
        scalars: {},
        directives: {},
        unions: {},
        mixins: {},
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

export default function({
  schema,
  hooks,
  secureAcl,
  packageList,
}: {
  [keys: string]: any;
  secureAcl: AclDefault;
}) {
  let modelStore = new MetaModel('system');
  if (typeof schema === 'string') {
    modelStore.loadModel(pathLib.resolve(__dirname, '../test.json'));
  } else {
    modelStore.loadPackage(schema, hooks);
    modelStore.saveModel('compiledModel.json');
  }
  let pckgs = initPackages(secureAcl);

  modelStore.entities.forEach((entity, key) => {
    pushToAppropriate({
      item: entity,
      acl: get(entity, 'metadata.acl.create'),
      path: 'entities',
      packages: pckgs,
    });

    pushToAppropriate({
      item: entity,
      acl: get(entity, 'metadata.acl.read'),
      path: 'entities',
      packages: pckgs,
    });
    pushToAppropriate({
      item: entity,
      acl: get(entity, 'metadata.acl.update'),
      path: 'entities',
      packages: pckgs,
    });
    pushToAppropriate({
      item: entity,
      acl: get(entity, 'metadata.acl.delete'),
      path: 'entities',
      packages: pckgs,
    });
    // if we didn't setup hooks at all
    pushToAppropriate({
      item: entity,
      acl: 'system',
      path: 'entities',
      packages: pckgs,
    });
  });

  modelStore.mutations.forEach((mutation, key) => {
    pushToAppropriate({
      item: mutation,
      acl: get(mutation, 'metadata.acl.execute'),
      path: 'mutations',
      packages: pckgs,
    });
    // if we didn't setup hooks at all
    pushToAppropriate({
      item: mutation,
      acl: 'system',
      path: 'mutations',
      packages: pckgs,
    });
  });

  const allPackages = secureAcl.roles;

  modelStore.enums.forEach((en, key) => {
    pushToAppropriate({
      item: en,
      acl: allPackages,
      path: 'enums',
      packages: pckgs,
    });
  });

  modelStore.scalars.forEach((scal, key) => {
    pushToAppropriate({
      item: scal,
      acl: allPackages,
      path: 'scalars',
      packages: pckgs,
    });
  });

  modelStore.directives.forEach((entity, key) => {
    return;
  });

  modelStore.unions.forEach((entity, key) => {
    return;
  });

  modelStore.mixins.forEach((entity, key) => {
    return;
  });

  Object.keys(pckgs)
    .reduce((result, cur) => {
      result.push({
        name: cur,
        abstract: false,
        acl: pckgs[cur].acl,
        entities: Object.keys(pckgs[cur].entities),
        mutations: Object.keys(pckgs[cur].mutations),
        enums: Object.keys(pckgs[cur].enums),
        scalars: Object.keys(pckgs[cur].scalars),
        directives: Object.keys(pckgs[cur].directives),
        unions: Object.keys(pckgs[cur].unions),
        mixins: Object.keys(pckgs[cur].mixins),
      });
      return result;
    }, [])
    .forEach(p => {
      modelStore.addPackage(p);
    });

  if (!Array.isArray(packageList)) {
    packageList = Array.from(modelStore.packages.keys());
  } else {
    if (packageList.indexOf('system') === -1) {
      packageList.push('system');
    }
  }
  let packages = new Map(
    Array.from(modelStore.packages.entries()).filter(i => {
      return packageList.indexOf(i[0]) !== -1;
    }),
  );

  return {
    modelStore,
    packages,
  };
}
