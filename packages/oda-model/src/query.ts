import { merge } from 'lodash';
import { Internal } from './element';
import {
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  NamedArray,
  MapToArray,
  EntityType,
  ScalarTypeNames,
  SimpleModelTypes,
} from './types';
import { outputPayload } from './utils/converters';
import { inputArgs, inputPayload } from './utils/converters';
import {
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBase,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import decapitalize from './lib/decapitalize';
import { IObjectTypeField, ObjectTypeFieldInput } from './objecttypefield';
import { IObjectType, ObjectTypeInput } from './objecttype';

export interface IQuery
  extends IModelBase<QueryMetaInfo, QueryInput, QueryOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IObjectType | IObjectTypeField>;
  /**
   * set of output fields
   */
  readonly payload:
    | SimpleModelTypes
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
}

export interface QueryMetaInfo extends ModelBaseMetaInfo {
  acl: {
    execute: string[];
  };
}

export interface QueryInternal extends ModelBaseInternal {
  args: Map<string, IObjectType | IObjectTypeField>;
  payload:
    | SimpleModelTypes
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField>;
}

export interface QueryInput extends ModelBaseInput<QueryMetaInfo> {
  args:
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
  payload:
    | ScalarTypeNames
    | SimpleModelTypes
    | EntityType
    | ObjectTypeInput
    | AsHash<ObjectTypeFieldInput | ObjectTypeInput>
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
}

export interface QueryOutput extends ModelBaseOutput<QueryMetaInfo> {
  args: NamedArray<ObjectTypeFieldInput>;
  payload:
    | SimpleModelTypes
    | EntityType
    | ObjectTypeInput
    | NamedArray<ObjectTypeFieldInput | ObjectTypeInput>;
}

export const queryDefaultMetaInfo = {
  acl: {
    execute: [],
  },
};
export const queryDefaultInput = { metadata: queryDefaultMetaInfo };

export class Query
  extends ModelBase<QueryMetaInfo, QueryInput, QueryInternal, QueryOutput>
  implements IQuery {
  public get modelType(): MetaModelType {
    return 'query';
  }

  constructor(init: QueryInput) {
    super(merge({}, queryDefaultInput, init));
  }

  public get args(): Map<string, IObjectType | IObjectTypeField> {
    return this[Internal].args;
  }

  public get payload():
    | SimpleModelTypes
    | EntityType
    | IObjectType
    | Map<string, IObjectType | IObjectTypeField> {
    return this[Internal].payload;
  }

  public updateWith(input: Nullable<QueryInput>) {
    super.updateWith(input);

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['name']>>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => (src.name = decapitalize(value)),
      required: true,
    });

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['args']>>({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) => (src.args = inputArgs(value)),
      required: true,
      setDefault: src => (src.args = new Map()),
    });

    assignValue<QueryInternal, QueryInput, NonNullable<QueryInput['payload']>>({
      src: this[Internal],
      input,
      field: 'payload',
      effect: (src, value) => (src.payload = inputPayload(value)),
      required: true,
      setDefault: src => (src.payload = new Map()),
    });
  }

  public toObject(): QueryOutput {
    const internal = this[Internal];
    const payload = outputPayload(internal.payload);
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      payload,
    } as Partial<QueryOutput>);
  }
  public mergeWith(payload: Nullable<QueryInput>) {
    super.mergeWith(payload);
  }
}
