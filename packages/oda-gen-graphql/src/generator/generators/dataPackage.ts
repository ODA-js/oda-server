import { lib } from 'oda-gen-common';
import { Factory } from 'fte.js';
import * as template from '../../graphql-backend-template';
import * as path from 'path';
import { writeFile } from './writeFile';

const { get, deepMerge } = lib;

export default function $generateDataPkg(
  raw: Factory,
  rootDir: string,
  pkg: { name: string },
  typeMapper: { [key: string]: (q: string) => string },
  route: string,
  fileName?: string,
) {
  let source = get(template, `packages.${route}`).generate(
    raw,
    pkg,
    typeMapper,
  );
  if (typeof source === 'string') {
    let fn = path.join(rootDir, 'data', fileName);
    writeFile(fn, source);
  } else if (Array.isArray(source)) {
    let parts = route.split('.').slice(1); // it is always `data`, at least here
    source.forEach(f => {
      let fn = path.join(rootDir, 'data', f.name);
      writeFile(fn, f.content);
    });
  }
}
