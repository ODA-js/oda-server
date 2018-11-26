const get = (data: any, path: string): any => {
  if (Array.isArray(data)) {
    const result = [];
    for (let i = 0, len = data.length; i < len; i++) {
      result.push(get(data[i], path));
    }
    return result;
  } else if (data instanceof Object) {
    if (data[path] === undefined) {
      const parts = path.split('.');
      if (Array.isArray(parts)) {
        const curr = parts.shift();
        if (curr) {
          if (parts.length > 0) {
            return get(data[curr], parts.join('.'));
          }
          return data[curr];
        }
      }
    }
    return data[path];
  }
  return data;
};

export default get;
