import clean from '../lib/json/clean';
import deepMerge from './../lib/json/deepMerge';
import get from './../lib/json/get';
import set from './../lib/json/set';
import {
  IValidate,
  IValidator,
  MetadataInput,
  MetaModelType,
  ValidationResultInput,
} from './interfaces';
import { BaseMeta } from './interfaces/metadata';

export class Metadata<T extends BaseMeta> implements IValidate {
  public modelType?: MetaModelType;
  public metadata!: T;

  public validate(validator: IValidator): ValidationResultInput[] {
    return validator.check(this);
  }

  constructor(inp?: { metadata?: { [key: string]: any } }) {
    if (inp && inp.metadata) {
      this.setMetadata('*', inp.metadata);
    }
  }

  public getMetadata(key?: string, def?: any): any {
    if (!key) {
      return this.metadata;
    } else {
      let result = get(this.metadata, key);
      if (result === undefined && def !== undefined) {
        this.setMetadata(key, def);
      }
      return result !== undefined ? result : def;
    }
  }

  public hasMetadata(key: string) {
    if (key) {
      return !!get(this.metadata, key);
    } else {
      return false;
    }
  }

  public setMetadata(
    key?: string | { [key: string]: any },
    data?: { [key: string]: any } | any,
  ): any {
    if (typeof key !== 'string' && !data) {
      data = key;
      key = '*';
    }
    if (data !== undefined) {
      if (key === '*') {
        this.metadata = data as any;
      } else {
        if (!this.metadata) {
          this.metadata = {};
        }
        set(this.metadata, key, data);
      }
    }
  }

  public updateWith(obj: MetadataInput) {
    if (obj && obj.metadata) {
      this.metadata = deepMerge(this.metadata || {}, obj.metadata);
    }
  }

  public toObject(): { [key: string]: any } {
    return clean({
      metadata: this.metadata,
    });
  }

  public toJSON(): { [key: string]: any } | undefined {
    return clean({
      metadata: this.metadata,
    });
  }
}
