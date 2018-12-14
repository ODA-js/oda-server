import { IModelHook } from 'oda-model';

export type GeneratorInit = {
  hooks?: IModelHook[];
  schema: any;
  rootDir?: string;
  templateRoot?: string;
  acl?: string[];
  context?: {
    typeMapper?: any;
    defaultAdapter?: 'mongoose' | 'sequelize';
  };
};
