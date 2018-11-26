export default function clean(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(clean);
  } else if (typeof obj === 'object') {
    return Object.keys(obj).reduce((res, cur) => {
      if (obj[cur] !== undefined) {
        res[cur] = clean(obj[cur]);
      }
      return res;
    }, obj);
  } else {
    return obj;
  }
}
