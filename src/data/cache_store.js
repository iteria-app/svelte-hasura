import { get, writable } from 'svelte/store'

import { HasuraRelations } from './hasura_relations'
import { normalizrSchemaTables } from './hasura_normalizr'
import { normalize } from 'normalizr';

export const normalizedStore = {}

function getter(cache, newObj, fkProperty, relation) {
    if (relation.rel_type == 'array') {
        return function() {
            const data = get(cache)
            const objs = data[relation.remote_table]
            if ('getter', 'enum_material2stroj_platny_fk' == fkProperty) {
                console.log('enum_material2stroj_platny', fkProperty, data)
            }
            if (!objs) {
                console.warn('getter', 'data does not contain table ', relation.remote_table)
                return []
            }
            const fks = newObj[fkProperty] || []//TODO fk_property from relation!!!
            return fks.map((fk) => objs[fk])
        }
    }
    
    return function() {
        const data = get(cache)
        const objs = data[relation.remote_table]
        if (!objs) {
            console.warn('getter', 'data does not contain table ', relation.remote_table)
            return []
        }
        const fk = newObj[fkProperty]
        return fk ? objs[fk] : null
    }
}

function fkPropertyName(relationName, relation) {
    if (relation.rel_type == 'object') {
        for (var fkName in relation.column_mapping) {
            return fkName//relation.column_mapping[fkName]//TODO componsite foreign key
        }
    }
    return relationName + '_fk'
}

function withGetters(cache, typename, obj, oldObj) {
    const newObj = {...oldObj, ...obj}

    const table = cache.schema.schemaTable(typename)
    for (const [relationName, relation] of Object.entries((table || {}).relations || {})) {
        if ("produkt_task" == typename) {
            console.log('withGetters', 'dbg', relationName, newObj[relationName])
        }

        const fkProperty = fkPropertyName(relationName, relation)
        if (typeof newObj[fkProperty] == 'undefined') {
            newObj[fkProperty] = newObj[relationName]//assumption contains ID/IDs after normalization
        }
        
        const newObjRelType = typeof newObj[relationName]
        if (newObjRelType == 'function') {
            console.trace('withGetters', 'getter allready defined', relationName, newObj)
        } else {
            if (newObjRelType != 'undefined') {
                delete newObj[relationName]
            }
            Object.defineProperty(newObj, relationName, {
                get: getter(cache, newObj, fkProperty, relation)
            })
        }
    }
    Object.defineProperty(newObj, 'schema', {
        get: () => table
    })
    
    return newObj
}

function objectPatch(cache, entities, typename, obj) {
    var objs = entities[typename]
    if (!objs) {
        entities[typename] = objs = {}
    }
    const oldObj = objs[obj.id]
    if (!oldObj) {
        return objs[obj.id] = withGetters(cache, typename, obj)
    } else {
        const newObj = withGetters(cache, typename, obj, oldObj)
        return objs[obj.id] = newObj
    }
}

function fkAppendArrayRelation(cache, entities, typename, obj) {
    var objs = entities[typename]
    if (!objs) {
        return
    }

    //najdi druhu stranu relacie
    for (var table_name in cache.schema.schemaTables) {
        var schemaTable = cache.schema.schemaTables[table_name]
        for (var relationName in schemaTable.relations) {
            var relation = schemaTable.relations[relationName]//
            if (relation.rel_type == 'array' && relation.remote_table == typename) {
                //relation.column_mapping
                
                for (var srcField in relation.column_mapping) {
                    const dstField = relation.column_mapping[srcField]
                    if (srcField == 'id' && dstField != 'id') {//TODO skip PK (using schema - not only convention)
                        const fk = obj[dstField]
                        var remotes = entities[table_name]
                        if (typeof fk != 'undefined' && objs) {
                            const remote = remotes[fk] || {}
                            console.log("fk rels", obj[relationName + '_fk'], obj, relationName, table_name, '->', relation.remote_table, relation.column_mapping)

                            const fks = remote[relationName + '_fk']
                            remote[relationName + '_fk'] = [...fks || [], obj.id]
                        }
                    }
                }
            }
        }
    }
    //const table = cache.schema.schemaTable(typename)
    //for (const [relationName, relation] of Object.entries((table || {}).relations || {})) {
        //obj[relationName]
        //
        //relation.remote_table
        //relation.column_mapping {colSrc:colDst}
    //}        
}

export function newCacheStore() {
    const cache = writable({})

    cache.getSchema = function() {
        return cache.schema
    }

    cache.mergeSchema = function(schema) {
        cache.schema = schema//TODO merge
    }

    // for example append fk into a array
    cache.objectCallback = function(typename, id, callback) {
        cache.update((entities) => {
            var objs = entities[typename]
            if (!objs) {
                entities[typename] = objs = {}
            }
            const oldObj = objs[id]
            var newObj = withGetters(cache, typename, oldObj || {})
            callback(newObj)
            objs[id] = newObj
            return entities
        })
    }

    function queryResultSchema(relations, resData, queryName) {
        const queryResultRelations = relations.schemaTable(queryName)
        for (var remote_table in resData) {
            //TODO aliases used in graphql query
            const v = resData[remote_table]
            if (v !== null) {
                if (typeof v == 'object' && typeof v.length != 'undefined') {
                    queryResultRelations.relations[remote_table] = {
                        rel_type: 'array',
                        remote_table: remote_table,
                        column_mapping: {id: queryName},
                    }
                } else if (typeof v == 'object') {
                    queryResultRelations.relations[remote_table] = {
                        rel_type: 'object',
                        remote_table: remote_table,
                        column_mapping: {id: queryName},
                    }
                }        
            }
        }
        return queryResultRelations
    }

    cache.queryResult = function(query, variables, queryName) {
        return function(res) {
            try {
                queryName = queryName || res.__typename || QUERY_RESULT
                console.trace('queryResult', queryName, res.data)

                if (res && res.data && res.data.hdb_table) {
                    cache.mergeSchema(new HasuraRelations(res.data.hdb_table))
                }
                const relations = cache.getSchema()
                queryResultSchema(relations, res.data, queryName)
                const normalizrEntities = normalizrSchemaTables(relations)
                const normalizedData = normalize(res.data, normalizrEntities[queryName])
                console.trace('queryResult', 'normalizedData', normalizedData)
                
                var ret = {}
                cache.update((entities) => {
                    // cache entities
                    for (const [table_name, objs] of Object.entries(normalizedData.entities || {})) {
                        //if (typeof objs == 'object' && typeof objs.length != 'undefined') {
                            for (const [id, obj] of Object.entries(objs || {})) {
                                var o = objectPatch(cache, entities, table_name, obj)
                                if (table_name == queryName) {
                                    ret = o
                                }
                            }
                        //} else {
                        //    objectPatch(cache, entities, table_name, objs)
                        //}
                    }
                    
                    // cache query result => getters targetting entities
                    // ret = objectPatch(cache, entities, queryName, normalizedData.result)
        
                    return entities
                })
                return {data: ret}
            } catch(e) {
                console.error('queryResult', 'cache result bug', e)
                throw e
            }
        }
    }

    const QUERY_RESULT = 'query_result'

    //cache.objectPatch('order_items', {...item, ...ret/* TODO normalize */})
    cache.mutationResult = function(query, variables) {
        return function(res) {
            try {
                const queryName = res.__typename || QUERY_RESULT
                console.trace('mutationResult', queryName, res.data)

                const relations = cache.getSchema()
                const normalizrEntities = normalizrSchemaTables(relations)

                const patchEntityObjs = {}
                for (var mutationOperation in res.data || {}) {
                    if ('__typename' == mutationOperation) {
                        continue//skip __typename
                    }
                    var mutationRes = res.data[mutationOperation]

                    var inpt = variables[mutationOperation]
                    if (typeof inpt == 'undefined') {
                        console.warn('mutation CACHE UPDATE unknown query variable', mutationOperation, variables)
                    }
                    var returning = (mutationRes || {}).returning || []
                    for (var i=0; i < 1 && i < returning.length; i++) {
                        var r = returning[i]
                        var patch = {...inpt, ...r}
                        
                        if (patch.id && r.__typename) {
                            queryResultSchema(relations, patch, mutationOperation)
                            const normalizedData = normalize(patch, normalizrEntities)
                            console.trace('mutationResult', 'normalizedData', normalizedData)

                            var objs = patchEntityObjs[r.__typename]
                            if (!objs) {
                                objs = patchEntityObjs[r.__typename] = {}
                            }
                            objs[patch.id] = patch
                        }
                    }
                }

                cache.update((entities) => {
                    // cache entities
                    for (const [table_name, objs] of Object.entries(patchEntityObjs || {})) {
                        //if (typeof objs == 'object' && typeof objs.length != 'undefined') {
                            for (const [id, obj] of Object.entries(objs || {})) {
                                objectPatch(cache, entities, table_name, obj)
                                fkAppendArrayRelation(cache, entities, obj.__typename, obj)
                            }
                        //} else {
                        //    objectPatch(cache, entities, table_name, objs)
                        //}
                    }
                    
                    return entities
                })
                // return entities
            } catch(e) {
                console.error('mutationResult', 'cache result bug', e)
                throw e
            }
        }
    }

    return cache
}

export class CacheStore {
    constructor() {
        this.typeNames = {}

        this.storeEntities = writable({})
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
