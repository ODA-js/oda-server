import { ModelPackage, BelongsToMany, FieldType } from 'oda-model';
import { Factory } from 'fte.js';

export const template = 'package/schema.puml.njs';

export function generate(
  te: Factory,
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
) {
  return te.run(mapper(pack, typeMapper), template);
}

export interface RelationsList {
  src: string;
  field: string;
  dest: string;
  single: boolean;
  verb: string;
  opposite: string;
  using?: string;
}

export interface MapperOutput {
  name: string;
  relations: RelationsList[];
  entities: {
    name: string;
    queries: {
      name: string;
      type: string;
      args: string;
      single: boolean;
    }[];
    fields: {
      name: string;
      type: string;
    }[];
  }[];
}

import {
  getFields,
  getRealEntities,
  storedRelationsExistingIn,
  derivedFieldsAndRelations,
  persistentFields,
} from '../queries';

export function mapper(
  pack: ModelPackage,
  typeMapper: { [key: string]: (i: FieldType) => string },
): MapperOutput {
  const mapToGQLTypes = typeMapper.graphql;
  let relList = new Map(pack.relations.entries());
  relList.forEach((rels, entity) => {
    rels.forEach((rel, fields) => {
      if (rel.relation.opposite) {
        relList.get(rel.relation.ref.entity).delete(rel.relation.opposite);
      } else {
        let ent = pack.entities.get(rel.relation.ref.entity);
        let opposites = Array.from(ent.fields.values()).filter(
          f =>
            (f.relation &&
              f.relation.ref.entity === entity &&
              f.relation.ref.field === rel.name) ||
            (f.relation &&
              f.relation.verb === 'BelongsToMany' &&
              rel.relation.verb === 'BelongsToMany' &&
              (f.relation as BelongsToMany).using &&
              (f.relation as BelongsToMany).using.entity ===
                (rel.relation as BelongsToMany).using.entity),
        );
        if (opposites[0]) {
          relList.get(rel.relation.ref.entity).delete(opposites[0].name);
          rel.relation.opposite = opposites[0].name;
        }
      }
    });
  });

  let relations: RelationsList[] = Array.from(relList).reduce(
    (result: RelationsList[], curEntity) => {
      let src = curEntity[0];
      Array.from(curEntity[1].entries()).reduce((res, cur) => {
        res.push({
          src,
          field: cur[0],
          dest: cur[1].relation.ref.entity,
          single: cur[1].relation.single,
          verb: cur[1].relation.verb,
          opposite: cur[1].relation.opposite,
          using:
            cur[1].relation.verb === 'BelongsToMany'
              ? (cur[1].relation as BelongsToMany).using.entity
              : '',
        });
        return res;
      }, result);
      return result;
    },
    [],
  );
  return {
    name: pack.name,
    relations,
    entities: getRealEntities(pack).map(e => ({
      name: e.name,
      fields: getFields(e)
        .filter(f => persistentFields(f) || storedRelationsExistingIn(pack)(f))
        .map(f => ({
          name: f.name,
          type:
            (f.relation && f.relation.ref.toString()) || mapToGQLTypes(f.type),
        })),
      queries: getFields(e)
        .filter(derivedFieldsAndRelations)
        .map(f => ({
          name: f.name,
          type: (f.relation && f.relation.ref.entity) || mapToGQLTypes(f.type),
          args: (
            (f.args && f.args.map(a => `${a.name}: ${a.type}`)) ||
            []
          ).join(','),
          single: (f.relation && f.relation.single) || true,
        })),
    })),
  };
}
