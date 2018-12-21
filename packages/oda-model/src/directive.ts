import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelMetaInfo,
} from './modelbase';
import {
  DirectiveLocation,
  FieldArgs,
  AsHash,
  MetaModelType,
  HashToMap,
  Nullable,
  assignValue,
  NamedArray,
  ArrayToMap,
  MapToArray,
} from './types';
import { Internal } from './element';
import { merge } from 'lodash';

export interface IDirective
  extends IModelBase<DirectiveMetaInfo, DirectiveInput, DirectiveOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, FieldArgs>;
  /**
   * where it can met
   */
  readonly on: DirectiveLocation[];
}

export interface DirectiveMetaInfo extends ModelMetaInfo {}

export interface DirectiveInternal extends ModelBaseInternal {
  args: Map<string, FieldArgs>;
  on: DirectiveLocation[];
}

export interface DirectiveInput extends ModelBaseInput<DirectiveMetaInfo> {
  args?: AsHash<FieldArgs> | NamedArray<FieldArgs>;
  on?: DirectiveLocation[];
}

export interface DirectiveOutput extends ModelBaseOutput<DirectiveMetaInfo> {
  args: NamedArray<FieldArgs>;
  on: DirectiveLocation[];
}

const defaultMetaInfo = {};
const defaultInput = { metadata: defaultMetaInfo };

export class Directive
  extends ModelBase<
    DirectiveMetaInfo,
    DirectiveInput,
    DirectiveInternal,
    DirectiveOutput
  >
  implements IDirective {
  public get modelType(): MetaModelType {
    return 'directive';
  }
  get args(): Map<string, FieldArgs> {
    return this[Internal].args;
  }

  get on(): DirectiveLocation[] {
    return this[Internal].on;
  }

  constructor(init: DirectiveInput) {
    super(merge({}, defaultInput, init));
  }

  public updateWith(input: Nullable<DirectiveInput>) {
    super.updateWith(input);

    assignValue<
      DirectiveInternal,
      DirectiveInput,
      AsHash<FieldArgs> | NamedArray<FieldArgs>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      setDefault: src => (src.args = new Map()),
    });

    assignValue<DirectiveInternal, DirectiveInput, string[]>({
      src: this[Internal],
      input,
      field: 'on',
      setDefault: src => (src.on = []),
    });
  }

  // it get fixed object
  public toObject(): DirectiveOutput {
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (name, value) => ({
        ...value,
        name,
      })),
      on: this[Internal].on,
    } as Partial<DirectiveOutput>);
  }
}
