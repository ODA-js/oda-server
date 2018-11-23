import ownerFieldIsIdentity from './belongsTo/ownerFieldIsIdentity';
import ownerFieldNotIndexed from './belongsTo/ownerFieldNotIndexed';
import refBackFieldIsIdentity from './belongsTo/refBackFieldIsIdentity';
import BTRefBackFieldNotExists from './belongsTo/refBackFieldNotExists';
import refBackFieldNotIndexed from './belongsTo/refBackFieldNotIndexed';
import refFieldNotIdentity from './belongsTo/refFieldNotIdentity';
import BTMRefEntityNotFound from './belongsToMany/refEntityNotFound';
import usingBackFieldNotExists from './belongsToMany/usingBackFieldNotExists';
import usingBackFieldNotIdentity from './belongsToMany/usingBackFieldNotIdentity';
import usingEntityNotFound from './belongsToMany/usingEntityNotFound';
import usingFieldNotExists from './belongsToMany/usingFieldNotExists';
import usingFieldsCheck from './belongsToMany/usingFieldsCheck';
import usingNotExists from './belongsToMany/usingNotExists';
import notCompatibleRelationEnds from './common/notCompatibleRelationEnds';
import oppositeNotFound from './common/oppositeNotFound';
import ownerFieldUnnecesseryIndexed from './common/ownerFieldUnnecesseryIndexed';
import possibleOppositeNotFound from './common/possibleOppositeNotFound';
import refBackFieldNotExists from './common/refBackFieldNotExists';
import refBackFieldNotIdentity from './common/refBackFieldNotIdentity';
import refEntityNotFound from './common/refEntityNotFound';
import refFieldNotFound from './common/refFieldNotFound';
import refFieldNotIndexed from './common/refFieldNotIndexed';

export const common = [
  new refFieldNotFound(),
  new notCompatibleRelationEnds(),
  new oppositeNotFound(),
  new possibleOppositeNotFound(),
];

export const belongsTo = [
  new refBackFieldNotIndexed(),
  new ownerFieldIsIdentity(),
  new ownerFieldNotIndexed(),
  new BTRefBackFieldNotExists(),
  new refBackFieldIsIdentity(),
  new refEntityNotFound(),
  new refFieldNotIdentity(),
];

export const belongsToMany = [
  new BTMRefEntityNotFound(),
  new ownerFieldUnnecesseryIndexed(),
  new refFieldNotIdentity(),
  new refBackFieldNotIdentity(),
  new refBackFieldNotExists(),
  new usingBackFieldNotExists(),
  new usingBackFieldNotIdentity(),
  new usingEntityNotFound(),
  new usingFieldNotExists(),

  new usingFieldsCheck(),
  new usingNotExists(),
];

export const hasOne = [
  new refEntityNotFound(),
  new ownerFieldUnnecesseryIndexed(),
  new refBackFieldNotIdentity(),
  new refBackFieldNotExists(),
  new refFieldNotIndexed(),
];

export const hasMany = [
  new refEntityNotFound(),
  new ownerFieldUnnecesseryIndexed(),
  new refBackFieldNotIdentity(),
  new refBackFieldNotExists(),
  new refFieldNotIndexed(),
];
