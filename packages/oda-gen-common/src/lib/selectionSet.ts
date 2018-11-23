import { get } from 'lodash';

export default function getSelection(info) {
  if (!info) {
    throw new Error('must provide not null graphql info');
  }
  const selectionSet = traverse(info.operation.selectionSet, info.fragments);
  const path = getPath(info.path);
  const result = get(selectionSet, path);
  return normalize(result);
}

function normalize(tree) {
  if (tree) {
    return Object.keys(tree)
      .filter(f => f !== '___$$$___node')
      .reduce((obj, curr) => {
        const name = tree[curr].___$$$___node.name.value;
        obj[name] = normalize(tree[curr]);
        return obj;
      }, {});
  } else {
    return true;
  }
}

function traverse(operation, fragmentsMap, obj = {}) {
  if (operation) {
    if (Array.isArray(operation)) {
      operation.forEach(item => traverse(item, fragmentsMap, obj));
      return obj;
    } else {
      let field =
        (operation.alias ? operation.alias.value : '') ||
        (operation.name ? operation.name.value : '');
      switch (operation.kind) {
        case 'SelectionSet':
          return traverse(operation.selections, fragmentsMap, obj) || {};
        case 'OperationDefinition':
          obj[field] = traverse(operation.selectionSet, fragmentsMap) || {};
          obj[field].___$$$___node = operation;
          return obj;
        case 'Field':
          obj[field] = traverse(operation.selectionSet, fragmentsMap) || {};
          obj[field].___$$$___node = operation;
          return obj;
        case 'FragmentSpread':
          return traverse(fragmentsMap[field], fragmentsMap, obj) || {};
        case 'FragmentDefinition':
          return traverse(operation.selectionSet, fragmentsMap, obj) || {};
        default:
          return;
      }
    }
  }
}

function getPath(path) {
  if (!path) {
    return '';
  } else {
    const prev = getPath(path.prev);
    if (typeof path.key === 'string') {
      return `${prev}${prev ? '.' : ''}${path.key}`;
    } else {
      return prev;
    }
  }
}
