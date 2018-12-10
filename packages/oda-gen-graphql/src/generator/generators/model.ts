import { lib } from 'oda-gen-common';
import { Factory } from 'fte.js';
import * as template from '../../graphql-backend-template';
import * as path from 'path';
import { writeFile } from './writeFile';

const { get, deepMerge } = lib;

export default function $generateModel(
  raw,
  rootDir,
  model,
  typeMapper: { [key: string]: (q: string) => string },
  route: string,
  fileName: string,
) {
  let source = get(template, `model.${route}`).generate(raw, model, typeMapper);
  let fn = path.join(rootDir, fileName);

  if (typeof source === 'string') {
    fn = path.join(rootDir, fileName);
    writeFile(fn, source);
  } else if (Array.isArray(source)) {
    let parts = route.split('.').slice(1); // it is always `data`, at least here
    source.forEach(f => {
      fn = path.join(rootDir, f.name);
      writeFile(fn, f.content);
    });
  }
}
