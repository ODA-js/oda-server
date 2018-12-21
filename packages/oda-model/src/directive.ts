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
  IFieldArgs,
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
  readonly args: Map<string, IFieldArgs>;
  /**
   * where it can met
   */
  readonly on: DirectiveLocation[];
}

export interface DirectiveMetaInfo extends ModelMetaInfo {}

export interface DirectiveInternal extends ModelBaseInternal {
  args: Map<string, IFieldArgs>;
  on: DirectiveLocation[];
}

export interface DirectiveInput extends ModelBaseInput<DirectiveMetaInfo> {
  args?: AsHash<IFieldArgs> | NamedArray<IFieldArgs>;
  on: DirectiveLocation[];
}

export interface DirectiveOutput extends ModelBaseOutput<DirectiveMetaInfo> {
  args: NamedArray<IFieldArgs>;
  on: DirectiveLocation[];
}

export const directiveDefaultMetaInfo = {};
export const directiveDefaultInput = { metadata: directiveDefaultMetaInfo };

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
  get args(): Map<string, IFieldArgs> {
    return this[Internal].args;
  }

  get on(): DirectiveLocation[] {
    return this[Internal].on;
  }

  constructor(init: DirectiveInput) {
    super(merge({}, directiveDefaultInput, init));
  }

  public updateWith(input: Nullable<DirectiveInput>) {
    super.updateWith(input);

    assignValue<
      DirectiveInternal,
      DirectiveInput,
      AsHash<IFieldArgs> | NamedArray<IFieldArgs>
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
