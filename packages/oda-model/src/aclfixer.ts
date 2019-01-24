import { HashToArray } from './types';
import { MutationInput } from './mutation';
import { OperationInput } from './operation';
import { QueryInput } from './query';
import { EntityInput } from './entity';
import { EntityBaseMetaInfoACL } from './entitybase';
import { FieldInput, isSimpleInput } from './field';
import { RelationFieldBaseMetaInfoACL } from './relationfieldbase';
import { FieldBaseMetaInfoACL } from './fieldbase';

export class ACLFixer {
  public role: string;
  constructor(role: string) {
    this.role = role;
  }
  /**
   * fix acl for mutation
   * @param input Mutation
   */
  fixOperations(input: MutationInput | OperationInput | QueryInput) {
    if (!input.metadata) {
      input.metadata = {};
    }
    if (!input.metadata.acl) {
      input.metadata.acl = { execute: [] };
    }
    if (input.metadata.acl.execute.indexOf(this.role) < 0) {
      input.metadata.acl.execute.push(this.role);
    }
  }
  /**
   * fix acl for entity
   * @param input Entity
   */
  fixEntity(input: EntityInput) {
    if (input.metadata) {
      input.metadata = input.metadata;
    } else {
      input.metadata = {} as any;
    }
    const aclKeys: (keyof EntityBaseMetaInfoACL)[] = [
      'create',
      'delete',
      'update',
      'readOne',
      'readMany',
    ];
    if (input.metadata && !input.metadata.acl) {
      input.metadata.acl = {} as any;
    }
    aclKeys.forEach((i: keyof EntityBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (!input.metadata.acl[i]) {
          input.metadata.acl[i] = [];
        }
      }
    });
    aclKeys.forEach((i: keyof EntityBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (
          input.metadata.acl[i] &&
          input.metadata.acl[i].indexOf(this.role) < 0
        ) {
          input.metadata.acl[i].push(this.role);
        }
      }
    });
    if (input.fields) {
      if (!Array.isArray(input.fields)) {
        input.fields = HashToArray(input.fields);
      }
      input.fields.forEach(f => this.fixACLField(f));
    }
    if (input.operations) {
      if (!Array.isArray(input.operations)) {
        input.operations = HashToArray(input.operations);
      }
      input.operations.forEach(o => this.fixOperations(o));
    }
  }
  /**
   * fix acl for Fields
   * @param input FieldInput
   */
  fixACLField(input: FieldInput) {
    if (!input.metadata) {
      input.metadata = {};
    }
    if (!input.metadata.acl) {
      input.metadata.acl = {} as any;
    }
    const aclFieldKeys: (keyof FieldBaseMetaInfoACL)[] = ['read', 'update'];
    aclFieldKeys.forEach((i: keyof FieldBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (!input.metadata.acl[i]) {
          input.metadata.acl[i] = [];
        }
      }
    });
    aclFieldKeys.forEach((i: keyof FieldBaseMetaInfoACL) => {
      if (input.metadata && input.metadata.acl) {
        if (
          input.metadata.acl[i] &&
          input.metadata.acl[i].indexOf(this.role) < 0
        ) {
          input.metadata.acl[i].push(this.role);
        }
      }
    });
    if (!isSimpleInput(input)) {
      const aclRelKeys: (keyof RelationFieldBaseMetaInfoACL)[] = [
        'addTo',
        'removeFrom',
      ];
      aclRelKeys.forEach((i: keyof RelationFieldBaseMetaInfoACL) => {
        if (input.metadata && input.metadata.acl) {
          if (!input.metadata.acl[i]) {
            input.metadata.acl[i] = [];
          }
        }
      });
      aclRelKeys.forEach((i: keyof RelationFieldBaseMetaInfoACL) => {
        if (input.metadata && input.metadata.acl) {
          if (
            input.metadata.acl[i] &&
            input.metadata.acl[i].indexOf(this.role) < 0
          ) {
            input.metadata.acl[i].push(this.role);
          }
        }
      });
    }
  }
}
