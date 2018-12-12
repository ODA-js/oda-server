import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
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
import { ElementMetaInfo } from './element';
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

export interface DirectiveMetaInfo extends ElementMetaInfo {}

export interface DirectiveInternal
  extends ModelBaseInternal<DirectiveMetaInfo> {
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
  protected $obj!: DirectiveInternal;

  get args(): Map<string, FieldArgs> {
    return this.$obj.args;
  }

  get on(): DirectiveLocation[] {
    return this.$obj.on;
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
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) =>
        (src.args = Array.isArray(value)
          ? ArrayToMap(value)
          : HashToMap(value)),
      setDefault: src => (src.args = new Map()),
    });

    assignValue<DirectiveInternal, DirectiveInput, string[]>({
      src: this.$obj,
      input,
      field: 'on',
      setDefault: src => (src.on = []),
    });
  }

  // it get fixed object
  public toObject(): DirectiveOutput {
    return merge({}, super.toObject(), {
      args: MapToArray(this.$obj.args, (name, value) => ({
        ...value,
        name,
      })),
      on: this.$obj.on,
    } as Partial<DirectiveOutput>);
  }
}
