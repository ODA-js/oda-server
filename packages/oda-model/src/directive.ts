import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
} from './modelbase';
import {
  DirectiveLocation,
  FieldArgs,
  AsHash,
  MetaModelType,
  HashToMap,
  MapToHash,
  Nullable,
  assignValue,
} from './model';
import { ElementMetaInfo } from './element';
import { merge } from 'lodash';

export interface IDirective
  extends IModelBase<DirectiveMetaInfo, DirectiveInput> {
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
  args?: Map<string, FieldArgs>;
  on?: string[];
}

export interface DirectiveInput extends ModelBaseInput<DirectiveMetaInfo> {
  args?: AsHash<FieldArgs>;
  on?: string[];
}

const defaultMetaInfo = {};
const defaultInternal = {};
const defaultInput = {};

export class Directive extends ModelBase<
  DirectiveMetaInfo,
  DirectiveInput,
  DirectiveInternal
> {
  public modelType: MetaModelType = 'field';
  protected $obj!: DirectiveInternal;

  get args(): Map<string, FieldArgs> | undefined {
    return this.$obj.args;
  }

  get on(): string[] | undefined {
    return this.$obj.on;
  }

  constructor(init: DirectiveInput) {
    super(merge({}, defaultInput, init));
    this.metadata_ = merge({}, defaultMetaInfo, this.metadata_);
    this.$obj = merge({}, defaultInternal, this.$obj);
  }

  public updateWith(input: Nullable<DirectiveInput>) {
    super.updateWith(input);

    assignValue<DirectiveInternal, DirectiveInput, AsHash<FieldArgs>>({
      src: this.$obj,
      input,
      field: 'args',
      effect: (src, value) => (src.args = HashToMap(value)),
    });

    assignValue<DirectiveInternal, DirectiveInput, DirectiveInput['on']>({
      src: this.$obj,
      input,
      field: 'args',
    });
  }

  // it get fixed object
  public toObject() {
    return merge({}, super.toObject(), {
      args: this.$obj.args ? MapToHash(this.$obj.args) : undefined,
      on: this.$obj.on,
    });
  }
}
