export default (i: string) => {
  return Buffer.from(i, 'base64').toString('ascii');
};
