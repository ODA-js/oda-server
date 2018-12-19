import { MetaModelInput } from '../metamodel';
import { EntityInput, EntityMetaInfo } from '../entity';
import { MutationInput } from '../mutation';
import { EnumInput } from '../enum';
import { QueryInput } from '../query';
import { ModelPackageInput } from '../modelpackage';

const MediaFile: EntityInput = {
  name: 'MediaFile',
  fields: [
    {
      name: 'title',
    },
    {
      name: 'description',
      type: 'RichText',
    },
    {
      name: 'reference',
      type: { type: 'entity', name: 'Image', multiplicity: 'one' },
    },
    {
      name: 'catalog',
      type: { type: 'entity', name: 'Image', multiplicity: 'many' },
    },
  ],
  metadata: { UI: { listName: ['title'] } } as Partial<EntityMetaInfo>,
};

const Image: EntityInput = {
  implements: ['IFile'],
  name: 'Image',
  embedded: true,
  fields: [
    {
      name: 'width',
      type: 'int',
    },
    {
      name: 'height',
      type: 'int',
    },
  ],
};

const IFile: EntityInput = {
  abstract: true,
  name: 'IFile',
  fields: [
    { name: 'src', identity: true },
    { name: 'type' },
    { name: 'path' },
    { name: 'name' },
  ],
  metadata: { UI: { listName: ['src'] } } as Partial<EntityMetaInfo>,
};

const User: EntityInput = {
  name: 'User',
  description: 'Person role to be user identified in the system',
  fields: [
    { name: 'userName', identity: true },
    { name: 'password' },
    { name: 'isAdmin', type: 'Boolean' },
    { name: 'isSystem', type: 'Boolean' },
    { name: 'enabled', type: 'Boolean' },
    {
      name: 'socialNetworks',
      type: {
        type: 'entity',
        name: 'SocialNetwork',
        multiplicity: 'many',
      },
    },
    {
      name: 'emails',
      relation: {
        hasMany: 'Email#',
      },
    },
    {
      name: 'files',
      relation: {
        hasMany: 'MediaFile#',
      },
    },
  ],
  metadata: { UI: { listName: ['userName'] } } as Partial<EntityMetaInfo>,
};

const Login: MutationInput = {
  name: 'loginUser',
  description: 'make user login',
  args: [
    {
      name: 'userName',
      required: true,
    },
    {
      name: 'password',
      required: true,
    },
  ],
  payload: [
    {
      name: 'token',
    },
    {
      name: 'role',
    },
  ],
};

const EMail: EntityInput = {
  name: 'Email',
  fields: [
    {
      name: 'email',
      identity: true,
    },
    {
      name: 'type',
      type: { type: 'enum', name: 'CommunicationType', multiplicity: 'one' },
    },
    {
      name: 'user',
      indexed: true,
      relation: {
        belongsTo: 'User#',
        opposite: 'emails',
      },
    },
  ],
};

const CommunicationType: EnumInput = {
  name: 'CommunicationType',
  items: ['home', 'office', 'other'],
};

const SocialNetwork: EntityInput = {
  embedded: true,
  name: 'SocialNetwork',
  fields: [
    { name: 'account', identity: true },
    { name: 'url', indexed: true },
    {
      name: 'type',
      type: {
        type: 'enum',
        multiplicity: 'one',
        name: 'SocialNetworkType',
      },
    },
  ],
};

const SocialNetworkType: EnumInput = {
  name: 'SocialNetworkType',
  items: ['skype', 'vk', 'tweeter', 'odn', 'whatsApp'],
};

const UserInfo: QueryInput = {
  name: 'UserInfo',
  args: [],
  payload: [{ name: 'id' }, { name: 'name' }, { name: 'email' }],
};

const AdminPackage: ModelPackageInput = {
  name: 'Admin',
  entities: ['User', 'Email', 'SocialNetwork'],
};

const PublicPackage: ModelPackageInput = {
  name: 'public',
  mutations: [Login],
};

const UserPackage_User: EntityInput = {
  name: 'User',
  description: 'Person role to be user identified in the system',
  fields: [
    { name: 'userName', identity: true },
    { name: 'password' },
    {
      name: 'socialNetworks',
      type: {
        type: 'entity',
        name: 'SocialNetwork',
        multiplicity: 'many',
      },
    },
    {
      name: 'emails',
      relation: {
        hasMany: 'Email#',
      },
    },
    {
      name: 'files',
      relation: {
        hasMany: 'MediaFile#',
      },
    },
  ],
  metadata: { UI: { listName: ['userName'] } } as Partial<EntityMetaInfo>,
};

const UserPackage: ModelPackageInput = {
  name: 'owner',
  entities: [UserPackage_User, 'MediaFile'],
};

const schema: MetaModelInput = {
  name: 'Education',
  packages: [AdminPackage, PublicPackage, UserPackage],
  entities: [MediaFile, Image, IFile, User, EMail, SocialNetwork],
  mutations: [Login],
  queries: [UserInfo],
  enums: [CommunicationType, SocialNetworkType],
};

export default schema;

it('schema', () => {
  expect(schema).toMatchSnapshot('schema');
});
