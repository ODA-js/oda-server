import {
  Entity,
  ModelPackage,
  BelongsToMany,
  Field,
  FieldType,
} from 'oda-model';
import { capitalize, decapitalize } from '../../utils';
import * as humanize from 'string-humanize';
import { constantify, camelize } from 'inflected';

export interface UIView {
  listName: string[];
  quickSearch: string[];
  hidden?: { [key: string]: boolean };
  edit?: { [key: string]: boolean };
  show?: { [key: string]: boolean };
  list?: { [key: string]: boolean };
  embedded?: { [key: string]: string };
}

export interface MapperOutput {
  dictionary: boolean;
  packageName: string;
  role: string;
  name: string;
  implements: string[];
  embedded: boolean | string[];
  abstract: boolean;
  title: string;
  titlePlural: string;
  UI: UIView;
  plural: string;
  listLabel: string[];
  listName: string;
  ownerFieldName: string;
  relations: {
    inheritedFrom?: string;
    required: boolean;
    derived: boolean;
    persistent: boolean;
    field: string;
    single: boolean;
    name: string;
    ref: {
      entity: string;
      fieldName: string;
      listLabel: {
        type: string;
        source: any;
      };
    };
  }[];
  fields: {
    inheritedFrom?: string;
    name: string;
    required: boolean;
  }[];
  props: {
    inheritedFrom?: string;
    order: string;
    required: boolean;
  }[];
  actions?: {
    name: string;
    title: string;
    actionType: string;
  }[];
  enum?: any;
}

// для каждой операции свои параметры с типами должны быть.
// специальный маппер типов для ts где ID === string

import {
  getFieldsForAcl,
  fields,
  identityFields,
  getRelationNames,
  relationFieldsExistsIn,
  oneUniqueInIndex,
  complexUniqueFields,
  getFields,
  idField,
  memoizeEntityMapper,
  oneFieldIndex,
} from '../../queries';

function visibility(
  pack: ModelPackage,
  entity: Entity,
  aclAllow,
  role,
  aor,
): UIView {
  const result: {
    listName: string[];
    quickSearch: string[];
    hidden?: string[];
    edit?: string[];
    show?: string[];
    list?: string[];
    embedded?: string[];
  } = {
    listName: guessListLabel(entity.name, aclAllow, role, pack),
    quickSearch: guessQuickSearch(entity, aclAllow, role, pack, aor),
    hidden: [],
    edit: [],
    show: [],
    list: [],
    embedded: [],
  };
  let allFields = getFieldsForAcl(role, pack)(aclAllow, entity);
  result.edit.push(...allFields.map(f => f.name));
  result.show.push(...result.edit);

  result.list = [...result.quickSearch];

  // result.list.push(
  //   ...allFields.filter(oneUniqueInIndex(entity)).map(f => f.name),
  //   ...allFields.filter(oneFieldIndex(entity)).map(f => f.name),
  // );
  // result.list.push(
  //   ...complexUniqueFields(entity)
  //     .map(f => entity.fields.get(f))
  //     .filter(f => aclAllow(role, f.getMetadata('acl.read', role)))
  //     .map(f => f.name),
  // );

  // придумать как вытаскивать реляции из модели...
  //

  const UI = entity.getMetadata('UI');
  if (UI) {
    if (UI.hidden && Array.isArray(UI.hidden)) {
      result.hidden.push(...UI.hidden);
    }

    if (UI.edit && Array.isArray(UI.edit)) {
      result.edit.push(...UI.edit);
    }

    if (UI.show && Array.isArray(UI.show)) {
      result.show.push(...UI.show);
    }

    if (UI.list && Array.isArray(UI.list)) {
      result.list.push(...UI.list);
    }
    if (UI.embedded && Array.isArray(UI.embedded)) {
      result.embedded.push(...UI.embedded);
    }
    if (UI.quickSearch && Array.isArray(UI.quickSearch)) {
      result.quickSearch.push(...UI.quickSearch);
    }
  }

  const res: UIView = {
    listName: result.listName,
    quickSearch: result.quickSearch.reduce((r, c) => {
      if (r.indexOf(c) === -1) {
        r.push(c);
      }
      return r;
    }, []),
    hidden: result.hidden.reduce((r, c) => {
      if (r[c] !== false) {
        if (!/\^/.test(c)) {
          r[c] = true;
        } else {
          r[c.slice(1)] = false;
        }
      }
      return r;
    }, {}),
  };

  res.list = result.list
    .filter(f => !res.hidden[f])
    .reduce((r, c) => {
      if (r[c] !== false) {
        if (!/\^/.test(c)) {
          r[c] = true;
        } else {
          r[c.slice(1)] = false;
        }
      }
      return r;
    }, {});

  res.edit = result.edit
    .filter(f => !res.hidden[f] && !res.list[f])
    .reduce((r, c) => {
      if (r[c] !== false) {
        if (!/\^/.test(c)) {
          r[c] = true;
        } else {
          r[c.slice(1)] = false;
        }
      }
      return r;
    }, {});

  res.show = result.show
    .filter(f => !res.hidden[f] && !res.edit[f] && !res.list[f])
    .reduce((r, c) => {
      if (r[c] !== false) {
        if (!/\^/.test(c)) {
          r[c] = true;
        } else {
          r[c.slice(1)] = false;
        }
      }
      return r;
    }, {});

  const embedItems = allFields
    .filter(
      f =>
        f.relation &&
        (f.relation.embedded || result.embedded.indexOf(f.name) > -1),
    )
    .map((f: Field) => {
      const lRes = {
        name: f.name,
        entity: f.relation.ref.entity,
      };
      return lRes;
    });

  res.embedded = embedItems.reduce((r, f) => {
    r[f.name] = f.entity;
    return r;
  }, {});

  return res;
}

function guessListLabel(
  entityName: string,
  aclAllow,
  role,
  pack: ModelPackage,
) {
  const entity = pack.entities.get(entityName);
  let UI = entity.getMetadata('UI');
  let result;
  if (UI && UI.listName) {
    result = UI.listName;
  } else {
    let res = getFieldsForAcl(role, pack)(aclAllow, entity)
      .filter(identityFields)
      .filter(oneUniqueInIndex(entity))[0];
    if (res) {
      result = res.name;
    }
  }
  return result ? (Array.isArray(result) ? result : [result]) : [];
}

function guessQuickSearch(entity: Entity, aclAllow, role, pack, aor) {
  let UI = entity.getMetadata('UI');
  let result = [];
  if (UI && UI.listName) {
    const lf = entity.fields.get(UI.listName);
    if (lf && lf.persistent) {
      result.push(UI.listName);
    }
  }
  result.push(
    ...getFieldsForAcl(role, pack)(aclAllow, entity)
      // TODO: to be defined more later!!!
      // .filter(identityFields)
      // .filter(oneUniqueInIndex(entity) || oneFieldIndex(entity))
      .map(i => i.name),
  );
  return result;
}

export const mapper = memoizeEntityMapper('ui/common', _mapper);

export function _mapper(
  entity: Entity,
  pack: ModelPackage,
  role: string,
  aclAllow,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  let fieldsAcl = getFieldsForAcl(role, pack)(aclAllow, entity);
  let ids = getFields(entity).filter(idField);
  const mapAORTypes = typeMapper.aor;
  const mapResourceTypes = typeMapper.resource;
  const mapAORFilterTypes = typeMapper.aorFilter;
  const UI = visibility(pack, entity, aclAllow, role, mapAORTypes);
  const mapFields = f => ({
    order: f.order,
    name: f.name,
    inheritedFrom: f.inheritedFrom,
    source: f.name,
    persistent: f.persistent,
    derived: f.derived,
    cName: capitalize(f.name),
    label: humanize(f.title || f.name),
    required: f.required,
    defaultValue: f.defaultValue,
    list: f.list,
    type: mapAORTypes(f.type),
    resourceType: mapResourceTypes(f.type),
    filterType: mapAORFilterTypes(f.type),
  });

  const relations = fieldsAcl
    .filter(relationFieldsExistsIn(pack))
    .sort((a, b) => (a.order > b.order ? 1 : -1))
    .map(f => {
      let refe = pack.entities.get(f.relation.ref.entity);
      let verb = f.relation.verb;
      let ref: any = {
        embedded: f.relation.embedded,
        //для разных ассоциаций... точнее их окончаний
        opposite: f.relation.opposite || f.relation.ref.field,
        usingField: '',
        backField: f.relation.ref.backField,
        entity: f.relation.ref.entity,
        queryName: decapitalize(f.relation.ref.entity),
        field: f.relation.ref.field,
        type: refe.fields.has(f.relation.ref.field)
          ? refe.fields.get(f.relation.ref.field).type
          : 'string',
        cField: capitalize(f.relation.ref.field),
        label: humanize(
          refe.fields.has(f.relation.ref.field)
            ? refe.fields.get(f.relation.ref.field).title
            : f.relation.ref.field,
        ),
        fields: [],
        listName: '',
      };
      if (verb === 'BelongsToMany' && (f.relation as BelongsToMany).using) {
        ref.using = {
          UI: undefined,
          backField: '',
          entity: '',
          field: '',
        };
        let current = f.relation as BelongsToMany;
        ref.using.entity = current.using.entity;
        ref.using.field = current.using.field;
        ref.backField = current.using.backField;
        //from oda-model/model/belongstomany.ts ensure relation class

        let opposite = getRelationNames(refe)
          // по одноименному классу ассоциации
          .filter(
            r =>
              (current.opposite && current.opposite === r) ||
              (refe.fields.get(r).relation instanceof BelongsToMany &&
                (refe.fields.get(r).relation as BelongsToMany).using &&
                (refe.fields.get(r).relation as BelongsToMany).using.entity ===
                  (f.relation as BelongsToMany).using.entity),
          )
          .map(r => refe.fields.get(r).relation)
          .filter(
            r => r instanceof BelongsToMany && current !== r,
          )[0] as BelongsToMany;
        /// тут нужно получить поле по которому opposite выставляет свое значение,
        // и значение
        if (opposite) {
          ref.opposite = opposite.field;
          ref.usingField = opposite.using.field;
          ref.backField = opposite.ref.field;
        } else {
          ref.usingField = decapitalize(ref.entity);
        }
        if (f.relation.fields && f.relation.fields.size > 0) {
          const using = pack.entities.get(ref.using.entity);
          f.relation.fields.forEach(field => {
            ref.fields.push(mapFields(using.fields.get(field.name)));
          });
        }
      }
      let sameEntity = entity.name === f.relation.ref.entity;
      let refFieldName = `${f.relation.ref.entity}${
        sameEntity ? capitalize(f.name) : ''
      }`;
      return {
        inheritedFrom: f.inheritedFrom,
        order: f.order,
        required: f.required,
        derived: f.derived,
        persistent: f.persistent,
        field: f.name,
        source: f.name,
        name: f.name,
        shortName: f.relation.shortName,
        cField: capitalize(f.name),
        label: humanize(f.title || f.name),
        verb,
        embedded: f.relation.embedded,
        single: verb === 'BelongsTo' || verb === 'HasOne',
        ref: {
          ...ref,
          fieldName: decapitalize(refFieldName),
          cFieldName: refFieldName,
          // listLabel: guessListLabel(
          //   f.relation.ref.entity,
          //   aclAllow,
          //   role,
          //   pack,
          //   mapAORTypes,
          // ),
        },
      };
    })
    .sort((a, b) => (a.order || -1) - (b.order || -1));

  const fieldsList = [
    ...ids,
    ...fieldsAcl.filter(f => fields(f) && !idField(f)),
  ]
    .map(mapFields)
    .sort((a, b) => (a.order || -1) - (b.order || -1));
  const props = [...relations, ...fieldsList].sort(
    (a, b) => (a.order || -1) - (b.order || -1),
  );

  const actions = Array.from(entity.operations.values()).map(a => ({
    name: a.name,
    actionType: a.actionType,
    title: a.title,
    actionName:
      a.actionType === 'itemAction'
        ? constantify(`${entity.name}_${a.title}`)
        : constantify(`${entity.plural}_${a.title}`),
    actionCreatorName:
      a.actionType === 'itemAction'
        ? camelize(`${entity.name}_${a.title}`, false)
        : camelize(`${entity.plural}_${a.title}`, false),
    fullName:
      a.actionType === 'itemAction'
        ? camelize(`${entity.name}_${a.title}`)
        : camelize(`${entity.plural}_${a.title}`),
  }));
  let result: MapperOutput = {
    dictionary: entity.getMetadata('dictionary'),
    packageName: capitalize(pack.name),
    role: pack.name,
    name: entity.name,
    abstract: entity.abstract,
    embedded: entity.embedded,
    implements: Array.from(entity.implements),
    title: entity.title,
    titlePlural: entity.titlePlural,
    UI,
    plural: entity.plural,
    listLabel: guessListLabel(entity.name, aclAllow, role, pack),
    listName: decapitalize(entity.plural),
    ownerFieldName: decapitalize(entity.name),
    relations,
    fields: fieldsList,
    props,
    actions,
  };
  if (entity.hasMetadata('enum')) {
    result.enum = entity.getMetadata('enum');
  }
  return result;
}
