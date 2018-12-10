import { lib } from 'oda-gen-common';
import { Factory } from 'fte.js';
import * as template from '../../graphql-backend-template';
import * as path from 'path';
import { writeFile } from './writeFile';

const { get, deepMerge } = lib;

export default function $generateData(
  pkg,
  raw: Factory,
  rootDir: string,
  typeMapper: { [key: string]: (string) => string },
  defaultAdapter: string,
  collection,
  cfg,
  type,
  route: string,
  ext: string,
  fileName?: string,
) {
  let runConfig = get(cfg[type], route) as boolean | string[];
  if (runConfig) {
    let list;
    if (Array.isArray(runConfig)) {
      collection.filter(e => (runConfig as string[]).includes(e.name));
    } else {
      list = collection;
    }

    for (let entity of list) {
      let source = get(template, `${type}.${route}`).generate(
        raw,
        entity,
        pkg,
        'system',
        undefined,
        typeMapper,
        defaultAdapter,
      );
      if (typeof source === 'string') {
        let parts = route.split('.').slice(1); // it is always `data`, at least here
        if (!fileName) {
          parts[parts.length - 1] = `${parts[parts.length - 1]}.${ext}`;
        } else {
          parts[parts.length - 1] = fileName;
        }
        let fn = path.join(rootDir, 'data', `${entity.name}`, ...parts);
        writeFile(fn, source);
      } else if (Array.isArray(source)) {
        let parts = route.split('.').slice(1); // it is always `data`, at least here
        source.forEach(f => {
          parts[parts.length - 1] = `${f.name}.${ext}`;
          let fn = path.join(rootDir, 'data', `${entity.name}`, ...parts);
          writeFile(fn, f.content);
        });
      }
    }
  }
}
