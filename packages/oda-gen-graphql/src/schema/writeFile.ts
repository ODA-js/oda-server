// import * as fs from 'fs-extra';
const prettier = require('prettier');
const memFs = require('mem-fs');
const editor = require('mem-fs-editor');

const store = memFs.create();
const fs = editor.create(store);

export function writeFile(fn, data, format: boolean = true) {
  if (format) {
    let fType = fn.match(/ts?$|js?$|graphql$|gql$/);
    try {
      const result = fType
        ? prettier.format(data, {
            singleQuote: true,
            trailingComma: 'all',
            bracketSpacing: true,
            jsxBracketSameLine: true,
            parser: fType[0].match(/js?$/)
              ? 'babylon'
              : fType[0].match(/ts?$/)
              ? 'typescript'
              : 'graphql',
          })
        : data;

      fs.write(fn, result);
    } catch {
      fs.write(fn, data);
    }
  } else {
    fs.write(fn, data);
  }
}

export async function commit() {
  return new Promise((res, rej) => {
    fs.commit(res);
  });
}
