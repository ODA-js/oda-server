import 'jest';
// import { Entity } from '..';
// import { AsHash } from '../types';
// import { FieldInput } from '../field';
// import { SimpleFieldInput } from '../simplefield';

describe('entity', () => {
  it('loads', () => {
    // const res = new Entity({
    //   name: 'A',
    //   fields: {
    //     name: {
    //       type: 'Number',
    //     } as Partial<SimpleFieldInput>,
    //   } as AsHash<FieldInput>,
    // });
    // expect(res).toMatchSnapshot('raw');
    // expect(res.toObject()).toMatchSnapshot('toObject');
  });
  it('id', () => {
    // const res = new Entity({
    //   name: 'A',
    //   fields: {
    //     id: {} as Partial<SimpleFieldInput>,
    //     name: {
    //       type: 'Number',
    //     } as Partial<SimpleFieldInput>,
    //   } as AsHash<FieldInput>,
    // });
    // expect(res).toMatchSnapshot('id-raw');
    // expect(res.toObject()).toMatchSnapshot('id-toObject');
  });
  it('_id', () => {
    // const res = new Entity({
    //   name: 'A',
    //   fields: {
    //     _id: {} as Partial<SimpleFieldInput>,
    //     name: {
    //       type: 'Number',
    //     } as Partial<SimpleFieldInput>,
    //   } as AsHash<FieldInput>,
    // });
    // expect(res).toMatchSnapshot('_id=raw');
    // expect(res.toObject()).toMatchSnapshot('_id-toObject');
  });
});
