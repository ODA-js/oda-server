import { lib } from 'oda-gen-common';
import { Factory } from 'fte.js';
import * as template from '../../graphql-backend-template';
import * as path from 'path';
import { writeFile } from './writeFile';

const { get, deepMerge } = lib;

export default function $generatePkg(
  raw: Factory,
  rootDir: string,
  typeMapper: { [key: string]: (s: string) => string },
  pkg: { name: string },
  type: string,
  route: string,
  fileName?: string,
) {
  let source = get(template, `packages.${route}`).generate(
    raw,
    pkg,
    typeMapper,
  );
  if (typeof source === 'string') {
    let fn = type
      ? path.join(rootDir, pkg.name, type, fileName)
      : path.join(rootDir, pkg.name, fileName);
    writeFile(fn, source);
  } else if (Array.isArray(source)) {
    let parts = route.split('.').slice(1); // it is always `data`, at least here
    source.forEach(f => {
      let fn = type
        ? path.join(rootDir, pkg.name, type, f.name)
        : path.join(rootDir, pkg.name, f.name);
      writeFile(fn, f.content);
    });
  }
}
