function get(data, path) {
  let result = data;
  if (Array.isArray(data)) {
    result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      result.push(get(data[i], path));
    }
  } else if (data instanceof Object) {
    if (data[path] === undefined) {
      const parts = path.split('.');
      if (Array.isArray(parts)) {
        const curr = parts.shift();
        if (parts.length > 0) {
          result = get(data[curr], parts.join('.'));
        } else {
          result = data[curr];
        }
      } else {
        result = data[path];
      }
    } else {
      result = data[path];
    }
  }
  return result;
}

export default get;
