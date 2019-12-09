import { writable } from 'svelte/store'

export const normalizedStore = {}

export class CacheStore {
    constructor() {
        this.typeNames = {}
    }
    
    // get all objects of the same type
    objectsOfType(typename, obj) {
        if (!typename && obj && obj.__typename) {
            typename = obj.__typename
        }
        if (typename) {
            var objs = this.typeNames[typename]
            if (!objs) {
                this.typeNames[typename] = objs = {}
            }
            return objs
        }
    }

    // merges key value pairs
    patch(obj, typename) {
        const objs = this.objectsOfType(typename, obj)
        if (!objs) {
            return//missing typename
        }
        const store = objs[obj.id]
        if (!store) {
            objs[obj.id] = writable(obj)
        } else {
            store.update(partialUpdate(obj))
        }
    }

    // for example append fk into a array
    callback(id, typename, callback) {
        const objs = this.objectsOfType(typename)
        if (!objs) {
            return//missing typename
        }
        const store = objs[id]
        if (!store) {
            objs[id] = store = writable({})
        }
        store.update(callback)
    }
}

function partialUpdate(obj) {
    return function(current) {
        return {...current, ...obj}
    }
}

export function patchNormalizedObjectsOfType(cacheStore, objs, typename) {
    for (const [id, obj] of Object.entries(objs || [])) {
        cacheStore.patch(obj, typename)
    }
}

export function patchNormalizedEntities(cacheStore, entities) {
    for (const [table_name, objs] of Object.entries(entities || [])) {
        patchNormalizedObjectsOfType(cacheStore, objs, table_name)
    }
}