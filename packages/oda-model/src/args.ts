import { merge } from 'lodash';

import {
  MetaModelType,
  Nullable,
  assignValue,
  Multiplicity,
  IFieldArgs,
  IFieldArgsForHash,
} from './types';
import {
  ElementMetaInfo,
  ElementInternal,
  Element,
  ElementInput,
  ElementOutput,
  IUpdatable,
  Internal,
} from './element';

export interface IArgs extends IUpdatable<ArgsMetaInfo, ArgsInput, ArgsOutput> {
  readonly name: string;
  readonly type: string;
  readonly required: boolean;
  readonly defaultValue?: string;
  readonly multiplicity: Multiplicity;
}

export interface ArgsMetaInfo extends ElementMetaInfo {}

export interface ArgsInternal extends ElementInternal {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  multiplicity: Multiplicity;
}

export interface ArgsInput extends ElementInput<ArgsMetaInfo> {
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  multiplicity?: Multiplicity;
}

export interface ArgsOutput extends ElementOutput<ArgsMetaInfo> {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  multiplicity: Multiplicity;
}

export const argsDefaultMetaInfo = {};
export const argsDefaultInput = {
  metadata: argsDefaultMetaInfo,
};

export class Args
  extends Element<ArgsMetaInfo, ArgsInput, ArgsInternal, ArgsOutput>
  implements IArgs, IFieldArgs, IFieldArgsForHash {
  public get modelType(): MetaModelType {
    return 'args';
  }
  public get name(): string {
    return this[Internal].name;
  }
  public get type(): string {
    return this[Internal].type;
  }

  public get required(): boolean {
    return this[Internal].required;
  }

  public get defaultValue(): string | undefined {
    return this[Internal].defaultValue;
  }

  public get multiplicity(): Multiplicity {
    return this[Internal].multiplicity;
  }

  constructor(init: ArgsInput) {
    super(merge({}, argsDefaultInput, init));
  }

  public updateWith(input: Nullable<ArgsInput>) {
    super.updateWith(input);

    assignValue<ArgsInternal, ArgsInput, ArgsInput['name']>({
      src: this[Internal],
      input,
      field: 'name',
      required: true,
    });

    assignValue<ArgsInternal, ArgsInput, ArgsInput['type']>({
      src: this[Internal],
      input,
      field: 'type',
      required: true,
      setDefault: src => (src.type = 'string'),
    });

    assignValue<ArgsInternal, ArgsInput, NonNullable<ArgsInput['required']>>({
      src: this[Internal],
      input,
      field: 'required',
      required: true,
      setDefault: src => (src.required = false),
    });

    assignValue<ArgsInternal, ArgsInput, ArgsInput['defaultValue']>({
      src: this[Internal],
      input,
      field: 'defaultValue',
      required: true,
    });

    assignValue<ArgsInternal, ArgsInput, ArgsInput['multiplicity']>({
      src: this[Internal],
      input,
      field: 'multiplicity',
      required: true,
      setDefault: src => (src.multiplicity = 'one'),
    });
  }

  public toObject(): ArgsOutput {
    return merge({}, super.toObject(), {
      name: this[Internal].name,
      type: this[Internal].type,
      required: this[Internal].required,
      defaultValue: this[Internal].defaultValue,
      multiplicity: this[Internal].multiplicity,
    } as Partial<ArgsOutput>) as ArgsOutput;
  }
}
