import { ModelHook, ValidationResultType } from 'oda-model';
export type GeneratorInit = {
  hooks?: ModelHook[];
  schema: any;
  rootDir?: string;
  templateRoot?: string;
  acl?: string[];
  context?: {
    typeMapper?: any;
    defaultAdapter?: 'mongoose' | 'sequelize';
  };
  logs?: ValidationResultType;
};
