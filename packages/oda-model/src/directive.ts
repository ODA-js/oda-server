import {
  ModelBase,
  IModelBase,
  ModelBaseInternal,
  ModelBaseInput,
  ModelBaseOutput,
  ModelBaseMetaInfo,
} from './modelbase';
import {
  DirectiveLocation,
  MetaModelType,
  Nullable,
  assignValue,
  MapToArray,
  CommonArgs,
  CommonArgsOutput,
  CommonArgsInput,
} from './types';
import { inputArgs } from './utils/converters';
import { Internal } from './element';
import { merge, mergeWith } from 'lodash';

export interface IDirective
  extends IModelBase<DirectiveMetaInfo, DirectiveInput, DirectiveOutput> {
  /**
   * set of arguments
   */
  readonly args: CommonArgs;
  /**
   * where it can met
   */
  readonly on: Set<DirectiveLocation>;
}

export interface DirectiveMetaInfo extends ModelBaseMetaInfo {}

export interface DirectiveInternal extends ModelBaseInternal {
  args: CommonArgs;
  on: Set<DirectiveLocation>;
}

export interface DirectiveInput extends ModelBaseInput<DirectiveMetaInfo> {
  args?: CommonArgsInput;
  on: DirectiveLocation[];
}

export interface DirectiveOutput extends ModelBaseOutput<DirectiveMetaInfo> {
  args: CommonArgsOutput;
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
  get args(): CommonArgs {
    return this[Internal].args;
  }

  get on(): Set<DirectiveLocation> {
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
      NonNullable<DirectiveInput['args']>
    >({
      src: this[Internal],
      input,
      field: 'args',
      effect: (src, value) => (src.args = inputArgs(value)),
      setDefault: src => (src.args = new Map()),
    });

    assignValue<DirectiveInternal, DirectiveInput, DirectiveInput['on']>({
      src: this[Internal],
      input,
      field: 'on',
      effect: (src, value) => {
        src.on = new Set<DirectiveLocation>(value);
      },
      setDefault: src => (src.on = new Set<DirectiveLocation>()),
    });
  }

  // it get fixed object
  public toObject(): DirectiveOutput {
    return merge({}, super.toObject(), {
      args: MapToArray(this[Internal].args, (_name, value) => value.toObject()),
      on: [...this[Internal].on],
    } as Partial<DirectiveOutput>);
  }

  public mergeWith(payload: Nullable<DirectiveInput>) {
    const update = mergeWith(
      this.toObject(),
      payload,
      (
        o: any,
        s: any,
        key: string,
        _obj: any,
        _source: any,
        _stack: string[],
      ) => {
        if (key === 'on') {
          return [...o, ...s];
        }
        if (key == 'name') {
          return o;
        }
        return;
      },
    );
    this.updateWith(update);
  }
}
