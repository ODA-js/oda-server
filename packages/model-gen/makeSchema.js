var fs = require('fs');
var stringify = require('json-stringify-pretty-compact');

function decapitalize(name) {
  return name.slice(0, 1).toLowerCase() + name.slice(1);
}

const _ = require('lodash');

const Factory = require('fte.js').Factory;
const raw = new Factory({
  root: 'templates',
  debug: true,
});

var mdjson = require('metadata-json-oda');

const { Validator, Repository } = mdjson;

mdjson.loadFromFile('./sbsh-courses.mdj');

function extractTypeName(type) {
  return typeof type === 'string'
    ? type.toLowerCase() === 'string'
      ? undefined
      : type
    : typeof type.name === 'string'
      ? type.name
      : undefined;
}

function returnType(op) {
  var item = (op.parameters || []).find(p => p.direction === 'return');
  if (item) {
    return extractTypeName(item.type);
  }
}

function OperationField(attr) {
  return {
    ...Field(attr),
    type: returnType(attr),
    args: attr.parameters.filter(p => p.direction === 'in').map(p => ({
      name: p.name,
      type: extractTypeName(p.type),
      required: (p.stereotype && p.stereotype.name == 'required') || undefined,
      defaultValue: p.defaultValue || undefined,
    })),
  };
}

// для полей с несколькими параметрами...
// для удобства представления здесь используем как раз операции
function OperationFields(elem) {
  return [...(elem.operations || []), ...elem.getInheritedOperations()]
    .filter(
      p =>
        p.stereotype &&
        (p.stereotype.name === 'query' || p.stereotype.name === 'required'),
    )
    .map(OperationField);
}

function ActionField(attr) {
  return {
    ...Field(attr),
    type: returnType(attr),
    actionType: attr.stereotype.name,
    args: attr.parameters.filter(p => p.direction === 'in').map(p => ({
      name: p.name,
      required: (p.stereotype && p.stereotype.name == 'required') || undefined,
      defaultValue: p.defaultValue || undefined,
    })),
  };
}

// для полей с несколькими параметрами...

function ActionFields(elem) {
  const result = [...(elem.operations || []), ...elem.getInheritedOperations()]
    .filter(
      p =>
        p.stereotype &&
        ['listAction', 'itemAction'].indexOf(p.stereotype.name) > -1,
    )
    .map(ActionField);
  if (result.length > 0) {
    return result;
  }
}

function multiplicity(attr) {
  return attr.multiplicity === '0..1' ||
    attr.multiplicity === '1' ||
    attr.aggregation === 'composite' // always embedded to one entity
    ? 'one'
    : 'many';
}

function Relation(opposite) {
  var attr =
    opposite._parent.end1 === opposite
      ? opposite._parent.end2
      : opposite._parent.end1;
  // if (attr.name && attr.navigable) {
  var own = multiplicity(attr);
  var opp = multiplicity(opposite);
  var embedded =
    opposite.aggregation === 'composite' ? attr.reference.name : undefined;
  var verb;
  var refkey = '';
  var using;
  if (opp == own && own == 'one') {
    if (attr.aggregation === 'shared') {
      verb = 'belongsTo';
    } else {
      verb = 'hasOne';
      refkey = opposite.name;
    }
  } else if (opp == own && own == 'many') {
    verb = 'belongsToMany';
    var assoc = links.find(l => {
      return l.associationSide === attr._parent;
    });
    using = assoc ? `${assoc.classSide.name}#${opposite.name}` : undefined;
    //verb = using ? 'belongsToMany' : 'hasMany';
  } else {
    verb = own === 'one' ? (embedded ? 'hasOne' : 'belongsTo') : 'hasMany';
    refkey = own === 'one' ? '' : opposite.name;
  }

  return {
    ...Field(attr),
    inheritedFrom: opposite.reference.name,
    relation: {
      navigable: attr.navigable,
      entity: attr.reference.name,
      field: decapitalize(opposite.name) || undefined,
      embedded,
      [verb]: `${attr.reference.name}#${decapitalize(refkey)}`,
      using,
    },
  };
  // }
}

function Relations(elem) {
  var activeClass = [...elem.getAncestors(), elem];
  const ends = activeClass.reduce((res, cur) => {
    res = [
      ...res,
      ...[...cur.getAssociationEnds(), ...cur.getAssociationEnds(true)].filter(
        e => cur === e.reference,
      ),
    ];
    return res;
  }, []);
  // const ends = [
  //   ...elem.getAssociationEnds(),
  //   ...elem.getAssociationEnds(true),
  // ].filter(e => activeClass.indexOf(e.reference) != -1);
  return [...ends.map(Relation)].filter(r => r);
}

function typeMultiplicity(attr) {
  return !attr.multiplicity ||
    attr.multiplicity === '0..1' ||
    attr.multiplicity === '1' ||
    attr.aggregation === 'composite' // always embedded to one entity
    ? 'one'
    : 'many';
}

function Field(attr) {
  let complexType;
  if (
    attr.type &&
    attr.type.constructor &&
    attr.type.constructor.name !== 'UMLPrimitiveType' &&
    // attr.type.name !== 'File' &&
    // attr.type.name !== 'Image' &&
    attr.type.constructor.name.match(/^UML/)
  ) {
    switch (attr.type.constructor.name) {
      case 'UMLEnumeration': {
        complexType = {
          type: 'enum',
          name: attr.type.name,
          multiplicity: typeMultiplicity(attr),
        };
        break;
      }
      case 'UMLClass': {
        complexType = {
          type: 'entity',
          name: attr.type.name,
          multiplicity: typeMultiplicity(attr),
        };
        break;
      }
    }
  }
  let result = {
    name: decapitalize(attr.name),
    inheritedFrom: attr._parent.name,
    description: attr.documentation || undefined,
    required:
      (attr.stereotype && attr.stereotype.name == 'required') || undefined,
    type:
      complexType ||
      (attr.type && attr.type.name === 'String'
        ? undefined
        : (attr.type && attr.type.name) || undefined),
    derived: attr.isDerived || undefined,
    defaultValue: attr.defaultValue || undefined,
    identity:
      attr.isID ||
      (attr.stereotype && attr.stereotype.name == 'identity') ||
      undefined,
    indexed:
      attr.isID ||
      (attr.stereotype && attr.stereotype.name == 'indexed') ||
      undefined, // придумать
  };
  if (attr.stereotype && attr.stereotype.name === 'listName') {
    result.listName = true;
  }
  return result;
}

function Fields(elem) {
  return [
    ...(elem.attributes || []),
    ...((elem.getInheritedAttributes && elem.getInheritedAttributes()) || []),
  ].map(Field);
}

function Entity(elem) {
  const implements = elem.getAncestors().map(p => p.name);
  const result = {
    implements: implements.length > 0 ? implements : undefined,
    abstract: elem.isAbstract || elem.stereotype.name == 'mixin' || undefined,
    name: elem.name,
    embedded: elem.stereotype.name == 'embedded' || undefined,
    description: elem.documentation || undefined,
    fields: [...Fields(elem), ...OperationFields(elem), ...Relations(elem)],
    operations: ActionFields(elem),
  };
  let identity = result.fields.filter(f => f.identity).map(p => p.name);
  if (identity.length > 0) {
    if (!result.metadata) {
      result.metadata = {};
    }
    if (!result.metadata.UI) {
      result.metadata.UI = {};
    }
    if (!result.metadata.UI.listName) {
      result.metadata.UI.listName = [];
    }
    result.metadata.UI.listName.push(...identity);
  }

  let listNameFields = result.fields.filter(p => p.listName);
  if (listNameFields.length > 0) {
    if (!result.metadata) {
      result.metadata = {};
    }
    if (!result.metadata.UI) {
      result.metadata.UI = {};
    }
    if (!result.metadata.UI.listName) {
      result.metadata.UI.listName = [];
    }
    result.metadata.UI.listName.push(...listNameFields.map(l => l.name));
    listNameFields.forEach(f => {
      delete f.listName;
    });
  }

  if (elem.stereotype && elem.stereotype.name === 'dictionary') {
    if (!result.metadata) {
      result.metadata = {};
    }
    result.metadata.dictionary = true;
  }
  return result;
}

function InputType(elem) {
  return {
    name: elem.name,
    description: elem.documentation || undefined,
    fields: [...Fields(elem)],
  };
}

function InputType(elem) {
  return {
    name: elem.name,
    description: elem.documentation || undefined,
    fields: [...Fields(elem)],
  };
}

/// добавить по типам ассоциаций подсказки
const rules = [
  {
    id: 'ODA00100',
    message: 'Name of query must be unique',
    appliesTo: ['UMLOperation'],
    exceptions: [],
    constraint: function(elem) {
      if (elem.stereotype && elem.stereotype.name == 'query') {
        const found = Repository.findAll(
          i =>
            elem !== i &&
            elem.name === i.name &&
            i.stereotype &&
            i.stereotype.name == 'query',
        );
        return found.length === 0;
      }
      return true;
    },
  },
  {
    id: 'ODA00101',
    message: 'query not applicable to this type',
    appliesTo: ['UMLModelElement'],
    exceptions: ['UMLOperation'],
    constraint: function(elem) {
      if (elem.stereotype && elem.stereotype.name == 'query') {
        return false;
      } else {
        return true;
      }
    },
  },
  {
    id: 'ODA00200',
    message: 'Name of mutation must be unique',
    appliesTo: ['UMLModelElement'],
    exceptions: [],
    constraint: function(elem) {
      if (elem.stereotype && elem.stereotype.name == 'mutation') {
        const found = Repository.findAll(
          i =>
            elem !== i &&
            elem.name === i.name &&
            i.stereotype &&
            i.stereotype.name == 'mutation',
        );
        return found.length === 0;
      }
      return true;
    },
  },
  {
    id: 'ODA00201',
    message: 'mutation not applicable to this type',
    appliesTo: ['UMLModelElement'],
    exceptions: ['UMLOperation'],
    constraint: function(elem) {
      if (elem.stereotype && elem.stereotype.name == 'mutation') {
        return false;
      } else {
        return true;
      }
    },
  },
  {
    id: 'ODA003',
    message: 'mixin must have attributes',
    appliesTo: ['UMLModelElement'],
    exceptions: [],
    constraint: function(elem) {
      if (elem.stereotype && elem.stereotype.name == 'mixin') {
        return elem.attributes.length > 0;
      }
      return true;
    },
  },
  {
    id: 'ODA004',
    message: 'union must have no attributes',
    appliesTo: ['UMLModelElement'],
    exceptions: [],
    constraint: function(elem) {
      if (elem.stereotype && elem.stereotype.name == 'union') {
        return elem.attributes.length === 0;
      }
      return true;
    },
  },
  {
    id: 'ODA005',
    message: 'input is only for UMLClass',
    appliesTo: ['UMLModelElement'],
    exceptions: ['UMLClass'],
    constraint: function(elem) {
      return (
        !elem.stereotype ||
        (elem.stereotype && elem.stereotype.name !== 'input')
      );
    },
  },
  {
    id: 'ODA006',
    message: 'type for attribute must exists in model',
    appliesTo: ['UMLAttribute'],
    exceptions: [],
    constraint: function(elem) {
      return (
        !elem.type ||
        typeof elem.type !== 'string' ||
        (typeof elem.type === 'string' &&
          Repository.select(elem.type).length > 0)
      );
    },
  },

  // return value for mutations must be entity/node/payload
  // associationEnds must have multiplicity
  // navigable not persistend end must be derived in code
  // схема должна содержать хотя бы одну ссылку на сущность
];

Validator.addRules(rules);

var failed = Validator.validate();
console.log(failed);
//links
var links = Repository.select('@UMLAssociationClassLink');
const associationClassesProps = links
  .map(v => ({
    name: v.classSide.name,
    fields: {
      [v.associationSide.end1.name]: {
        relation: {
          belongsTo: `${v.associationSide.end1.reference.name}#`,
        },
      },
      [v.associationSide.end2.name]: {
        relation: {
          belongsTo: `${v.associationSide.end2.reference.name}#`,
        },
      },
    },
  }))
  .reduce((res, ent) => {
    res[ent.name] = ent.fields;
    return res;
  }, {});
//

var entities = Repository.findAll(
  i =>
    i.stereotype &&
    (i.stereotype.name == 'node' ||
      i.stereotype.name == 'entity' ||
      i.stereotype.name == 'dictionary' ||
      i.stereotype.name == 'mixin' ||
      i.stereotype.name == 'embedded'),
).map(Entity);

// Discover embedded

entities.filter(f => f.fields).forEach(e => {
  e.fieldsHash = e.fields.reduce((res, f) => {
    res[f.name] = f;
    return res;
  }, {});
});

const allEntitiesHash = entities.reduce((res, cur) => {
  res[cur.name] = cur;
  return res;
}, {});

const embeddedEntities = entities
  .filter(e => e.embedded)
  // .map((e, index) => ({ name: e.name, index }))
  .reduce((res, cur) => {
    res[cur.name] = cur;
    return res;
  }, {});

const notEmbeddedEntities = entities
  .filter(e => !e.embedded)
  // .map((e, index) => ({ name: e.name, index }))
  .reduce((res, cur) => {
    res[cur.name] = cur;
    return res;
  }, {});

entities
  // .filter(e => !e.embedded)
  .filter(
    e => e.fields.filter(f => f.relation && f.relation.embedded).length > 0,
  )
  .map(e => ({
    name: e.name,
    fields: e.fields.filter(f => f.relation && f.relation.embedded),
  }))
  .forEach(e => {
    e.fields.forEach(f => {
      let found = embeddedEntities[f.relation.embedded];
      if (!found) {
        found = notEmbeddedEntities[f.relation.embedded];
        delete notEmbeddedEntities[f.relation.embedded];
        embeddedEntities[f.relation.embedded] = found;
        found.embedded = [e.name];
        console.log(f.relation.embedded, 'is referenced as embedded');
      } else if (typeof found.embedded !== 'boolean') {
        if (Array.isArray(found.embedded)) {
          found.embedded = [...found.embedded, e.name];
        }
      } else if (typeof found.embedded === 'boolean') {
        found.embedded = [e.name];
      }
    });
  });

// удалить ссылки обратные на сущности со ссылками на embedded;
// и обратные ссылки тоже чистим

// удаляем ссылки из non navigable  на их контейнеры
entities
  .filter(
    e =>
      e.fields.filter(f => f.relation && (!f.relation.navigable || !f.name))
        .length > 0,
  )
  .map(e => ({
    name: e.name,
    fields: e.fields.filter(
      f => f.relation && (!f.relation.navigable || !f.name),
    ),
  }))
  .forEach(e => {
    e.fields.forEach(f => {
      delete allEntitiesHash[e.name].fieldsHash[f.name];
    });
  });

// удаляем ссылки из embedded на их контейнеры
entities
  .filter(
    e => e.fields.filter(f => f.relation && f.relation.embedded).length > 0,
  )
  .map(e => ({
    name: e.name,
    fields: e.fields.filter(f => f.relation && f.relation.embedded),
  }))
  .forEach(e => {
    e.fields.forEach(f => {
      delete allEntitiesHash[f.relation.embedded].fieldsHash[f.relation.field];
    });
  });

// удаляем все ссылки на embedded из сущностей на которые embedded ссылается
entities
  .filter(
    e =>
      e.embedded &&
      e.fields &&
      e.fields.filter(f => f.relation && !f.relation.embedded),
  )
  .map(e => ({
    name: e.name,
    fields: e.fields.filter(f => f.relation && !f.relation.embedded),
  }))
  .forEach(e => {
    e.fields.forEach(f => {
      const rel = allEntitiesHash[f.relation.entity];
      if (
        // rel &&
        rel.fieldsHash[f.relation.field] &&
        rel.fieldsHash[f.relation.field].embedded
      ) {
        delete rel.fieldsHash[f.relation.field];
      }
    });
  });

// чистим связи
// удаляем все не нужные поля
entities.forEach(e => {
  e.fields.filter(f => f.relation).forEach(f => {
    delete f.relation.entity;
    f.relation.opposite = f.relation.field;
    delete f.relation.field;
    delete f.relation.navigable;
  });
});
// заменяем список полей на хэш
entities.forEach(e => {
  e.fields.forEach(f => {
    if (e.name === f.inheritedFrom) {
      delete f.inheritedFrom;
    }
    delete f.name;
  });
  e.fields = e.fieldsHash;
  delete e.fieldsHash;
});

// добавляем свойства классов ассоциации
entities
  .filter(e => associationClassesProps.hasOwnProperty(e.name))
  .forEach(e => {
    debugger;
    _.merge(e.fields, associationClassesProps[e.name]);
  });

debugger;
// const mixins = entities.filter(e => e.mixin || e.abstract);
// mixins.forEach(m => delete m.abstract);
// entities = entities.filter(e => !(e.mixins || e.abstract));

var inputTypes = Repository.findAll(
  i =>
    i.constructor.name === 'UMLClass' &&
    i.stereotype &&
    i.stereotype.name == 'input',
).map(InputType);

//
var payload = Repository.findAll(
  i => i.stereotype && i.stereotype.name == 'payload',
);
// .map(InputType);

//
var schemas = Repository.findAll(
  i => i.stereotype && i.stereotype.name == 'schema',
);
//
var mutations = Repository.findAll(
  i =>
    i.constructor.name === 'UMLClass' &&
    i.stereotype &&
    i.stereotype.name == 'mutation',
);
//
var queries = Repository.findAll(
  i =>
    i.constructor.name === 'UMLClass' &&
    i.stereotype &&
    i.stereotype.name == 'query',
);
//
var enums = Repository.findAll(
  i =>
    (i.stereotype && i.stereotype.name == 'enum') ||
    i.constructor.name === 'UMLEnumeration',
).map(en => ({
  name: en.name,
  items:
    en.constructor.name === 'UMLEnumeration'
      ? en.literals.map(l => l.name)
      : en.attributes.map(attr => attr.name),
}));
// UMLOperation

//RULE: все операции и запросы должны быть уникальны по названию во всех моделе

//UMLStereotype

/*
"Tag": {
    "kind": "class",
    "super": "Model",
    "attributes": [
        { "name": "kind",      "kind": "enum", "type": "TagKind", "visible": true },
        { "name": "value",     "kind": "prim", "type": "String",  "visible": true, "multiline": true },
        { "name": "reference", "kind": "ref",  "type": "Model",   "visible": true },
        { "name": "checked",   "kind": "prim", "type": "Boolean", "visible": true },
        { "name": "number",    "kind": "prim", "type": "Integer", "visible": true }
    ]
},
*/

const model = {
  name: 'some',
  packages: [],
  entities,
  mutations,
  queries,
  enums,
  // mixins,
};

debugger;
// fs.writeFileSync('./src/consts.js', raw.run(entities, 'consts.njs'));

fs.writeFileSync(
  './generate/schema.js',
  raw.run(stringify(model, { margins: true, indent: 2 }), 'schema.njs'),
);
