import entity from './rules/entity';
import field from './rules/field';
import model from './rules/model';
import packages from './rules/package';
import {
  belongsTo,
  belongsToMany,
  common,
  hasMany,
  hasOne,
} from './rules/relation';
import { Validator } from './validator';

const validator = new Validator();
validator.registerRule('model', [...model]);

validator.registerRule('package', [...packages]);

validator.registerRule('entity', [...entity]);

validator.registerRule('field', [...field]);

validator.registerRule('relation', [...common]);

validator.registerRule('BelongsTo', [...belongsTo]);

validator.registerRule('BelongsToMany', [...belongsToMany]);

validator.registerRule('HasOne', [...hasOne]);

validator.registerRule('HasMany', [...hasMany]);

export default () => {
  return validator;
};
