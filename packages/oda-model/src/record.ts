import { ElementMetaInfo, Internal, MetaData } from './element';
import {
  IModelBase,
  ModelBaseInput,
  ModelBaseInternal,
  ModelBase,
  ModelBaseOutput,
} from './modelbase';
import {
  AsHash,
  MetaModelType,
  Nullable,
  assignValue,
  HashToArray,
  NamedArray,
  MapToArray,
  ArrayToMap,
  ArgumentKind,
} from './types';

import { merge } from 'lodash';
import * as inflected from 'inflected';
import { RecordFieldInput, RecordField, IRecordField } from './recordfield';
import { UIView } from './entitybase';

export interface IRecord
  extends IModelBase<RecordMetaInfo, RecordInput, RecordOutput> {
  readonly kind: ArgumentKind;
  readonly plural: string;
  readonly global: boolean;
  readonly titlePlural: string;
  readonly fields: Map<string, IRecordField>;
}

export interface RecordMetaInfo extends ElementMetaInfo {
  titlePlural: string;
  global: boolean;
  name: {
    plural: string;
    singular: string;
  };
  UI: UIView;
}

export interface RecordInternal extends ModelBaseInternal {
  fields: Map<string, IRecordField>;
  kind: ArgumentKind;
}

export interface RecordInput extends ModelBaseInput<RecordMetaInfo> {
  plural?: string;
  global?: boolean;
  kind?: ArgumentKind;
  titlePlural?: string;
  fields: AsHash<RecordFieldInput> | NamedArray<RecordFieldInput>;
}

export function isRecordInput(inp: any): inp is RecordInput {
  return typeof inp === 'object' && inp.hasOwnProperty('fields');
}

export function isRecord(inp: any): inp is IRecord | Record {
  return (
    typeof inp === 'object' &&
    (inp.modelType as MetaModelType) === 'record-type'
  );
}

export interface RecordOutput extends ModelBaseOutput<RecordMetaInfo> {
  fields: NamedArray<RecordFieldInput>;
  kind: ArgumentKind;
}

export const recordDefaultMetaInfo = {
  name: {},
  UI: {
    listName: [],
    quickSearch: [],
    hidden: [],
    edit: [],
    show: [],
    list: [],
    embedded: [],
  },
};
export const recordDefaultInput = {
  metadata: recordDefaultMetaInfo,
  exact: false,
};

export class Record
  extends ModelBase<RecordMetaInfo, RecordInput, RecordInternal, RecordOutput>
  implements IRecord {
  public get modelType(): MetaModelType {
    return 'record-type';
  }

  constructor(init: RecordInput) {
    super(merge({}, recordDefaultInput, init));
  }

  get kind(): ArgumentKind {
    return this[Internal].kind;
  }

  get plural(): string {
    return this.metadata.name.plural;
  }

  get titlePlural(): string {
    return this.metadata.titlePlural;
  }

  get global(): boolean {
    return this.metadata.global;
  }

  get fields(): Map<string, IRecordField> {
    return this[Internal].fields;
  }

  public updateWith(input: Nullable<RecordInput>) {
    super.updateWith(input);

    assignValue<RecordInternal, RecordInput, RecordInput['name']>({
      src: this[Internal],
      input,
      field: 'name',
      effect: (src, value) => {
        src.name = value.trim();
        this.metadata.name.singular = src.name;
      },
      required: true,
    });

    assignValue<
      RecordMetaInfo,
      RecordInput,
      NonNullable<RecordInput['global']>
    >({
      src: this[MetaData],
      input,
      field: 'global',
      effect: (src, value) => (src.global = value),
      setDefault: src => (src.global = false),
    });

    assignValue<
      RecordMetaInfo,
      RecordInput,
      NonNullable<RecordInput['plural']>
    >({
      src: this.metadata,
      input,
      field: 'name.plural',
      inputField: 'plural',
      effect: (src, value) => {
        src.name.plural = value.trim();
        if (src.name.plural === this.name) {
          src.name.plural = `All${this.name}`;
        }
      },
      setDefault: src => {
        src.name.plural = inflected.pluralize(this.name);
        if (src.name.plural === this.name) {
          src.name.plural = `All${this.name}`;
        }
      },
    });

    assignValue<
      RecordMetaInfo,
      RecordInput,
      NonNullable<RecordInput['titlePlural']>
    >({
      src: this.metadata,
      input,
      field: 'titlePlural',
      effect: (src, value) => (src.titlePlural = value.trim()),
      setDefault: src => (src.titlePlural = this.plural),
    });

    assignValue<RecordInternal, RecordInput, NonNullable<RecordInput['kind']>>({
      src: this[Internal],
      input,
      field: 'kind',
      effect: (src, value) => (src.kind = value),
      setDefault: src => (src.kind = 'input'),
    });

    assignValue<
      RecordInternal,
      RecordInput,
      NonNullable<RecordInput['fields']>
    >({
      src: this[Internal],
      input,
      field: 'fields',
      effect: (src, value) => {
        const fields = ArrayToMap(
          Array.isArray(value) ? value : HashToArray(value),
          (fld, order) => {
            let field = new RecordField(
              merge({}, fld, {
                order,
                entity: this.name,
                kind: this.kind,
              }),
            );
            return field;
          },
          (obj: any, src: any) => obj.mergeWith(src.toObject()),
        );

        src.fields = fields;
      },
      setDefault: src => (src.fields = new Map()),
    });
  }

  public toObject(): RecordOutput {
    return merge({}, super.toObject(), {
      fields: MapToArray(this.fields, (name, value) => ({
        ...value.toObject(),
        name,
      })),
      kind: this[Internal].kind,
    } as Partial<RecordOutput>);
  }

  public mergeWith(payload: Nullable<RecordInput>) {
    super.mergeWith(payload);
  }
}
