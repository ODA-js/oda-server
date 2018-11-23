const set = (data, path, value) => {
  if (data !== null && 'object' === typeof data) {
    const parts = path.split('.');
    const curr = parts.shift();
    if (parts.length > 0) {
      if (!data[curr]) {
        if (isNaN(parts[0])) {
          data[curr] = {};
        } else {
          data[curr] = [];
        }
      }
      set(data[curr], parts.join('.'), value);
    } else {
      data[path] = value;
    }
  }
};

export default set;
