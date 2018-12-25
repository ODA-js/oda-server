import 'jest';
import { RelationField } from '../relationfield';

describe('RelationField', () => {
  it('derived & persistent & required & indexed & identity', () => {
    const notRelated = new RelationField({
      name: 'PD',
      derived: true,
      persistent: true,
      identity: true,
      indexed: true,
      required: true,
      relation: {
        hasOne: 'D#',
      },
    });
    expect(notRelated.persistent).toBeFalsy();
    expect(notRelated.derived).toBeTruthy();
    expect(notRelated.identity).toBeFalsy();
    expect(notRelated.indexed).toBeFalsy();
    expect(notRelated.required).toBeFalsy();

    const related = new RelationField({
      name: 'PD',
      derived: true,
      persistent: true,
      identity: true,
      indexed: true,
      required: true,
      relation: {
        belongsTo: 'D#',
      },
    });
    expect(related.persistent).toBeTruthy();
    expect(related.derived).toBeFalsy();
    expect(related.identity).toBeTruthy();
    expect(related.indexed).toBeTruthy();
    expect(related.required).toBeTruthy();
  });
  it('hasMany', () => {
    const res = new RelationField({
      name: 'ref',
      relation: {
        hasMany: 'A#',
      },
    });
    expect(res).toMatchSnapshot('hasMany');
    expect(res.toObject()).toMatchSnapshot('hasMany to Object');
  });
  it('hasOne', () => {
    const res = new RelationField({
      name: 'ref',
      relation: {
        hasOne: 'A#',
      },
    });
    expect(res).toMatchSnapshot('hasOne');
    expect(res.toObject()).toMatchSnapshot('hasOne to Object');
  });
  it('belongsTo', () => {
    const res = new RelationField({
      name: 'ref',
      relation: {
        belongsTo: 'A#',
      },
    });
    expect(res).toMatchSnapshot('belongsTo');
    expect(res.toObject()).toMatchSnapshot('belongsTo to Object');
  });
  it('belongsToMany', () => {
    const res = new RelationField({
      name: 'ref',
      relation: {
        belongsToMany: 'A#',
        using: '_B#',
      },
    });
    expect(res).toMatchSnapshot('belongsToMany');
    expect(res.toObject()).toMatchSnapshot('belongsToMany to Object');
  });
});
