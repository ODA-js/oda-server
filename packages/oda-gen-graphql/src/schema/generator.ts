import { Factory } from 'fte.js';
import {
  common as entities,
  pkg as templatePkg,
} from '../graphql-backend-template/schema';
import * as path from 'path';
import { writeFile } from './writeFile';
import { ModelPackage } from 'oda-model';

export default function generator(
  pkg: ModelPackage,
  raw: Factory,
  rootDir: string,
  role: string,
  allow,
  typeMapper: { [key: string]: (s: string) => string },
  adapter: string,
) {
  const sources = [];
  const prepared = [];
  // tslint:disable-next-line:no-console
  console.time('prepare');
  prepared.push(templatePkg.prepare(pkg, role, allow, typeMapper, adapter));
  prepared.push(
    ...Array.from(pkg.entities.values())
      .filter(f => !f.abstract)
      .map(entity => {
        return {
          entity: entity.name,
          ...entities.prepare(entity, pkg, role, allow, typeMapper, adapter),
        };
      }),
  );
  // tslint:disable-next-line:no-console
  console.timeEnd('prepare');
  // tslint:disable-next-line:no-console
  console.time('generate');
  prepared
    .map(item => {
      return (raw.run(item.ctx, item.template) as {
        name: string;
        content: string;
      }[]).map(r => ({
        entity: item.entity,
        ...r,
      }));
    })
    .reduce((result, curr) => {
      result.push(...curr);
      return result;
    }, sources);
  // tslint:disable-next-line:no-console
  console.timeEnd('generate');
  sources.forEach(f => {
    let fn = path.join(
      ...[
        rootDir,
        pkg.name,
        ...(f.entity ? ['entities', f.entity] : [false]),
        f.name,
      ].filter(i => i),
    );
    writeFile(fn, f.content);
  });
}
