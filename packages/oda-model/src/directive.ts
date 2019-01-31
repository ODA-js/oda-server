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
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  NamedArray,
  ArrayToMap,
  MapToArray,
  HashToArray,
} from './types';
import { Internal } from './element';
import { merge, mergeWith } from 'lodash';
import {
  RecordField,
  IRecordField,
  RecordFieldInput,
  RecordFieldOutput,
} from './recordfield';
import {
  IRecord,
  RecordInput,
  isRecordInput,
  Record,
  RecordOutput,
  isRecord,
} from './record';

export interface IDirective
  extends IModelBase<DirectiveMetaInfo, DirectiveInput, DirectiveOutput> {
  /**
   * set of arguments
   */
  readonly args: Map<string, IRecordField | IRecord>;
  /**
   * where it can met
   */
  readonly on: Set<DirectiveLocation>;
}

export interface DirectiveMetaInfo extends ModelBaseMetaInfo {}

export interface DirectiveInternal extends ModelBaseInternal {
  args: Map<string, IRecordField | IRecord>;
  on: Set<DirectiveLocation>;
}

export interface DirectiveInput extends ModelBaseInput<DirectiveMetaInfo> {
  args?:
    | AsHash<RecordFieldInput | RecordInput>
    | NamedArray<RecordFieldInput | RecordInput>;
  on: DirectiveLocation[];
}

export interface DirectiveOutput extends ModelBaseOutput<DirectiveMetaInfo> {
  args: NamedArray<RecordOutput | RecordFieldOutput>;
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
  get args(): Map<string, IRecordField | IRecord> {
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
      effect: (src, value) =>
        (src.args = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          v =>
            isRecordInput(v)
              ? new Record({ ...v, kind: 'input' })
              : new RecordField({ ...v, kind: 'input' }),
          (obj, src) =>
            isRecord(obj) && isRecord(src)
              ? obj.mergeWith(src.toObject())
              : !isRecord(obj) && !isRecord(src)
              ? obj.mergeWith(src.toObject())
              : obj,
        )),
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
