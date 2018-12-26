import 'jest';
import { ModelHook } from '../modelhooks';

describe('ModeHook', () => {
  it('default setup exact feature for every item of entity and mixin', () => {
    const res = new ModelHook({
      name: 'Coolest Hook ever',
      entities: [{ name: 'user', fields: [{ name: 'updatedBy' }] }],
      mixins: [{ name: 'IUserMix', fields: [{ name: 'updatedBy' }] }],
    });
    const user = res.entities.get('User');
    expect(user).not.toBeUndefined();
    if (user) {
      expect(user.exact).toBeTruthy();
      expect(user.fields.has('id')).toBeFalsy();
    }
    const mixin = res.mixins.get('IUserMix');
    expect(mixin).not.toBeUndefined();
    if (mixin) {
      expect(mixin.exact).toBeTruthy();
      expect(mixin.fields.has('id')).toBeFalsy();
    }
  });
});
