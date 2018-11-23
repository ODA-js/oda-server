export default (i: string) => {
  return Buffer.from(i, 'ascii').toString('base64');
};
