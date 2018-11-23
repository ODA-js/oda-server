import { IResolvers } from 'graphql-tools';
import deepMerge from '../lib/deepMerge';
import override from '../lib/fillDefaults';
import * as jsonUtils from '../lib';
import invariant = require('invariant');
import warning = require('warning');
import { OrderedMap } from 'immutable';
// let padding = 0;

type Hash = { [key: string]: Hash | any };

const hashToString = (entry: Hash) =>
  entry
    ? Object.keys(entry).reduce((result: any[], curr) => {
        if (curr) {
          if (Array.isArray(entry[curr])) {
            result.push(...entry[curr]);
          } else if (typeof entry[curr] == 'string') {
            result.push(entry[curr]);
          } else {
            result.push(...hashToString(entry[curr]));
          }
        }
        return result;
      }, [])
    : [];

export class GQLModule {
  public get name(): string {
    if (!this._name && !(this.constructor && this.constructor.name)) {
      invariant(
        this._name,
        'module has no name neither _name nor constructor.name to be initialized',
      );
      //TODO: remove asap
      console.trace();
    }
    if (!this._name && this.constructor && this.constructor.name) {
      warning(
        this._name,
        `module ${
          this.constructor.name
        } has no name to be initialized, only constructor.name, it may drive to schema build fail in minified code`,
      );
      //TODO: remove asap
      console.trace();
    }
    return this._name || this.constructor.name;
  }
  public get resolver(): { [key: string]: any } {
    return this._resolver || {};
  }
  public get query(): { [key: string]: any } {
    return this._query || {};
  }
  public get viewer(): { [key: string]: any } {
    return this._viewer || {};
  }
  public get mutation(): { [key: string]: any } {
    return this._mutation || {};
  }
  public get subscription(): { [key: string]: any } {
    return this._subscription || {};
  }
  public get typeDef(): string[] {
    return hashToString(this._typeDef);
  }
  public get mutationEntry(): string[] {
    return hashToString(this._mutationEntry);
  }
  public get subscriptionEntry(): string[] {
    return hashToString(this._subscriptionEntry);
  }
  public get queryEntry(): string[] {
    return hashToString(this._queryEntry);
  }
  public get viewerEntry(): string[] {
    return hashToString(this._viewerEntry);
  }
  public get hooks(): { [key: string]: any }[] {
    return this._hooks || [];
  }

  protected _name!: string;
  protected _resolver!: {
    [key: string]: any;
  };
  protected _query!: {
    [key: string]: any;
  };
  protected _viewer!: {
    [key: string]: any;
  };
  protected _mutation!: {
    [key: string]: any;
  };
  protected _subscription!: {
    [key: string]: any;
  };
  protected _typeDef!: {
    [key: string]: string[];
  };
  protected _mutationEntry!: {
    [key: string]: string[];
  };
  protected _subscriptionEntry!: {
    [key: string]: string[];
  };
  protected _queryEntry!: {
    [key: string]: string[];
  };
  protected _viewerEntry!: {
    [key: string]: string[];
  };
  protected _hooks!: {
    [key: string]: any;
  }[];

  protected _extend!: GQLModule[];
  protected _composite!: GQLModule[];
  protected _extendsOf!: OrderedMap<string, GQLModule>;
  protected _compositeOf!: OrderedMap<string, GQLModule>;

  // собирать объекты по порядку, а затем
  // билдить.... их...

  public applyHooks(obj: IResolvers): IResolvers {
    let modelHooks = this.hooks;
    for (let i = 0, len = modelHooks.length; i < len; i++) {
      let hookList = Object.keys(modelHooks[i]);
      for (let j = 0, jLen = hookList.length; j < jLen; j++) {
        let key = hookList[j];
        jsonUtils.set(obj, key, modelHooks[i][key](jsonUtils.get(obj, key)));
      }
    }
    return obj;
  }

  constructor({
    name,
    resolver,
    query,
    viewer,
    typeDef,
    mutationEntry,
    subscriptionEntry,
    queryEntry,
    viewerEntry,
    mutation,
    subscription,
    hooks,
    extend,
    composite,
  }: {
    name?: string;
    resolver?: { [key: string]: any };
    query?: { [key: string]: any };
    viewer?: { [key: string]: any };
    mutation?: { [key: string]: any };
    subscription?: { [key: string]: any };
    typeDef?: { [key: string]: string[] };
    mutationEntry?: { [key: string]: string[] };
    subscriptionEntry?: { [key: string]: string[] };
    queryEntry?: { [key: string]: string[] };
    viewerEntry?: { [key: string]: string[] };
    hooks?: { [key: string]: any }[];
    extend?: GQLModule[];
    composite?: GQLModule[];
  }) {
    if (name !== undefined) {
      this._name = name;
    }
    if (resolver !== undefined) {
      this._resolver = resolver;
    }
    if (query !== undefined) {
      this._query = query;
    }
    if (viewer !== undefined) {
      this._viewer = viewer;
    }
    if (mutation !== undefined) {
      this._mutation = mutation;
    }
    if (subscription !== undefined) {
      this._subscription = subscription;
    }
    if (typeDef !== undefined) {
      this._typeDef = typeDef;
    }
    if (mutationEntry !== undefined) {
      this._mutationEntry = mutationEntry;
    }
    if (subscriptionEntry !== undefined) {
      this._subscriptionEntry = subscriptionEntry;
    }
    if (queryEntry !== undefined) {
      this._queryEntry = queryEntry;
    }
    if (viewerEntry !== undefined) {
      this._viewerEntry = viewerEntry;
    }
    if (hooks !== undefined) {
      this._hooks = hooks;
    }
    if (extend !== undefined) {
      this._extend = extend;
    }
    if (composite !== undefined) {
      this._composite = composite;
    }
  }

  public discoverExtendsOf(extendees: OrderedMap<string, GQLModule>) {
    if (this._extend && this._extend.length > 0) {
      this._extend.forEach(e => {
        extendees = e.discoverExtendsOf(extendees);
        if (!extendees.has(e.name)) {
          extendees = extendees.set(e.name, e);
        } else {
          // первый вариант мержится здесь!!!
          let original = extendees.get(e.name);
          if (original && original !== e) {
            original.override(e);
          }
        }
      });
    }
    return extendees;
  }

  public discoverCompositeOf(composees: OrderedMap<string, GQLModule>) {
    if (this._composite && this._composite.length > 0) {
      this._composite.forEach(e => {
        composees = e.discoverCompositeOf(composees);
        if (!composees.has(e.name)) {
          composees = composees.set(e.name, e);
        } else {
          let original = composees.get(e.name);
          if (original && original !== e) {
            original.override(e);
          }
        }
      });
    }
    return composees;
  }

  public build() {
    if (!this._extendsOf) {
      this._extendsOf = OrderedMap();
    } else {
      this._extendsOf = this._extendsOf.clear();
    }
    if (!this._compositeOf) {
      this._compositeOf = OrderedMap();
    } else {
      this._compositeOf = this._compositeOf.clear();
    }

    this._extendsOf = this.discoverExtendsOf(this._extendsOf);
    this.extend(Array.from(this._extendsOf.values()));

    this._compositeOf = this.discoverCompositeOf(this._compositeOf);
    this.compose(Array.from(this._compositeOf.values()));
  }

  // compose all thing together
  private compose(obj: GQLModule | GQLModule[]) {
    if (Array.isArray(obj)) {
      for (let i = 0, len = obj.length; i < len; i++) {
        this.compose(obj[i]);
      }
    } else {
      if (obj._resolver !== undefined) {
        this._resolver = deepMerge(this._resolver, obj._resolver);
      }
      if (obj._query !== undefined) {
        this._query = deepMerge(this._query, obj._query);
      }
      if (obj._viewer !== undefined) {
        this._viewer = deepMerge(this._viewer, obj._viewer);
      }
      if (obj._mutation !== undefined) {
        this._mutation = deepMerge(this._mutation, obj._mutation);
      }
      if (obj._subscription !== undefined) {
        this._subscription = deepMerge(this._subscription, obj._subscription);
      }
      if (obj._typeDef !== undefined) {
        this._typeDef = deepMerge(this._typeDef, obj._typeDef);
      }
      if (obj._mutationEntry !== undefined) {
        this._mutationEntry = deepMerge(
          this._mutationEntry,
          obj._mutationEntry,
        );
      }
      if (obj._subscriptionEntry !== undefined) {
        this._subscriptionEntry = deepMerge(
          this._subscriptionEntry,
          obj._subscriptionEntry,
        );
      }
      if (obj._queryEntry !== undefined) {
        this._queryEntry = deepMerge(this._queryEntry, obj._queryEntry);
      }
      if (obj._viewerEntry !== undefined) {
        this._viewerEntry = deepMerge(this._viewerEntry, obj._viewerEntry);
      }
      if (obj._hooks !== undefined) {
        this._hooks = [...(this._hooks || []), ...(obj._hooks || [])];
      }
    }
  }

  // extend current object
  private extend(obj: GQLModule | GQLModule[]) {
    if (Array.isArray(obj)) {
      for (let i = 0, len = obj.length; i < len; i++) {
        this.extend(obj[i]);
      }
    } else {
      if (obj._resolver !== undefined) {
        this._resolver = override(obj._resolver, this._resolver);
      }
      if (obj._query !== undefined) {
        this._query = override(obj._query, this._query);
      }
      if (obj._viewer !== undefined) {
        this._viewer = override(obj._viewer, this._viewer);
      }
      if (obj._mutation !== undefined) {
        this._mutation = override(obj._mutation, this._mutation);
      }
      if (obj._subscription !== undefined) {
        this._subscription = override(obj._subscription, this._subscription);
      }
      if (obj._typeDef !== undefined) {
        this._typeDef = override(obj._typeDef, this._typeDef);
      }
      if (obj._mutationEntry !== undefined) {
        this._mutationEntry = override(obj._mutationEntry, this._mutationEntry);
      }
      if (obj._subscriptionEntry !== undefined) {
        this._subscriptionEntry = override(
          obj._subscriptionEntry,
          this._subscriptionEntry,
        );
      }
      if (obj._queryEntry !== undefined) {
        this._queryEntry = override(obj._queryEntry, this._queryEntry);
      }
      if (obj._viewerEntry !== undefined) {
        this._viewerEntry = override(obj._viewerEntry, this._viewerEntry);
      }
      if (obj._hooks !== undefined) {
        this._hooks = override(obj._hooks, this._hooks);
      }
    }
  }

  private override(obj: GQLModule | GQLModule[]) {
    if (Array.isArray(obj)) {
      for (let i = 0, len = obj.length; i < len; i++) {
        this.override(obj[i]);
      }
    } else {
      if (obj._resolver !== undefined) {
        this._resolver = override(this._resolver, obj._resolver);
      }
      if (obj._query !== undefined) {
        this._query = override(this._query, obj._query);
      }
      if (obj._viewer !== undefined) {
        this._viewer = override(this._viewer, obj._viewer);
      }
      if (obj._mutation !== undefined) {
        this._mutation = override(this._mutation, obj._mutation);
      }
      if (obj._subscription !== undefined) {
        this._subscription = override(this._subscription, obj._subscription);
      }
      if (obj._typeDef !== undefined) {
        this._typeDef = override(this._typeDef, obj._typeDef);
      }
      if (obj._mutationEntry !== undefined) {
        this._mutationEntry = override(this._mutationEntry, obj._mutationEntry);
      }
      if (obj._subscriptionEntry !== undefined) {
        this._subscriptionEntry = override(
          this._subscriptionEntry,
          obj._subscriptionEntry,
        );
      }
      if (obj._queryEntry !== undefined) {
        this._queryEntry = override(this._queryEntry, obj._queryEntry);
      }
      if (obj._viewerEntry !== undefined) {
        this._viewerEntry = override(this._viewerEntry, obj._viewerEntry);
      }
      if (obj._hooks !== undefined) {
        this._hooks = override(this._hooks, obj._hooks);
      }
    }
  }
}
