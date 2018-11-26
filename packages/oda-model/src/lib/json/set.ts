const set = (data: any, path: string, value: any) => {
  if (data !== null && 'object' === typeof data) {
    const parts = path.split('.');
    const curr = parts.shift();
    if (curr) {
      if (parts.length > 0) {
        if (!data[curr]) {
          if (isNaN(parseInt(parts[0]))) {
            data[curr] = {};
          } else {
            data[curr] = [];
          }
        }
        set(data[curr], parts.join('.'), value);
      }
    } else {
      data[path] = value;
    }
  }
};

export default set;
