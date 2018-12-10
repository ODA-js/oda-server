import { ModelHook, ValidationResultType } from 'oda-model';

export type GeneratorConfigPackage = {
  mutation?:
    | boolean
    | string[]
    | {
        entry?: boolean | string[];
        types?: boolean | string[];
        resolver?: boolean | string[];
        index?: boolean | string[];
      };
  entity?:
    | boolean
    | string[]
    | {
        index?: boolean | string[];
        type?: {
          entry?: boolean | string[];
          enums?: boolean | string[];
          resolver?: boolean | string[];
        };
        query?:
          | boolean
          | string[]
          | {
              entry?: boolean | string[];
              resolver?: boolean | string[];
            };
        viewer?:
          | boolean
          | string[]
          | {
              entry?: boolean | string[];
              resolver?: boolean | string[];
            };
        dataPump?:
          | boolean
          | string[]
          | {
              queries?: boolean | string[];
              config?: boolean | string[];
            };
        UI?:
          | boolean
          | string[]
          | {
              queries?: boolean | string[];
              forms?: boolean | string[];
              index?: boolean | string[];
            };
        mutations?:
          | boolean
          | string[]
          | {
              entry?: boolean | string[];
              types?: boolean | string[];
              resolver?: boolean | string[];
            };
        subscriptions?:
          | boolean
          | string[]
          | {
              entry?: boolean | string[];
              types?: boolean | string[];
              resolver?: boolean | string[];
            };
        data?:
          | boolean
          | string[]
          | {
              adapter?: {
                connector?: boolean | string[];
                schema?: boolean | string[];
              };
              types?: {
                model?: boolean | string[];
              };
            };
        connections?:
          | boolean
          | string[]
          | {
              mutations?:
                | boolean
                | string[]
                | {
                    entry?: boolean | string[];
                    types?: boolean | string[];
                    resolver?: boolean | string[];
                  };
              types?: boolean | string[];
            };
      };
  packages?:
    | boolean
    | string[]
    | {
        typeIndex?: boolean | string[];
        mutationIndex?: boolean | string[];
      };
};

export type GeneratorConfig = {
  graphql?: boolean;
  ts?: boolean;
  schema?: boolean;
  ui?: boolean;
  packages?: boolean | string[] | { [key: string]: GeneratorConfigPackage };
};

export type Generator = {
  hooks?: ModelHook[];
  // role: string,
  pack:
    | string
    | {
        name: string;
        mutations?: any[];
        queries?: any[];
        entities?: any[];
        packages?: any[];
        enums?: any[];
        unions?: any[];
        mixins?: any[];
        directives?: any[];
        scalars?: any[];
        objects?: any[];
      };
  rootDir?: string;
  templateRoot?: string;
  config: GeneratorConfig;
  acl?: string[];
  context?: {
    typeMapper?: {
      [key: string]: {
        [key: string]: string[];
      };
    };
    defaultAdapter?: string;
  };
  logs?: ValidationResultType | ValidationResultType[];
};
