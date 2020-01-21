//const endpoint = 'https://dev-svelte-hasura.herokuapp.com/v1/graphql'
//const endpoint = 'http://localhost:8080/v1/graphql'
const endpoint = 'https://test-polepime.herokuapp.com/v1/graphql'

import { newCacheStore } from './cache_store'

import {JSONPath} from 'jsonpath-plus';
import newXlsFormula from './excelFormulas'

export const HDB_RELATIONS = `
hdb_table {
    table_name
    foreign_key {
        ref_table
        column_mapping
    }
    foreign_key_ref {
        table_name
        column_mapping
    }
    relationship {
        rel_def
        rel_name
        rel_type
    }
}
`

export const cache = newCacheStore()

export function model(node, json) {
    //console.log('use:model', node, json)
    
    /*if (typeof node.items != 'undefined') {
        const path = node.items || (node.attributes.model || {}).value
        if (typeof json == 'object' && path && path.length > 0 && path[0] == '$') {
            const v = JSONPath({flatten: true, path, json}) || []
            node.items = v
        }
    }
    
    if (typeof node.value != 'undefined' && typeof node.attributes.model != 'undefined' ) {
        const path = node.attributes.model.value
        if (typeof json == 'object' && path && path.length > 0 && path[0] == '$') {
            const v = JSONPath({flatten: true, path, json}) || ''
            if (typeof v == 'object' && v.length > 0) {
                node.value = node.value = v[0]
            }
        }
    }*/

    return {
        destroy() {
            // the node has been removed from the DOM
        }
    };
}

function handler(data, row) {
    return (event) => {
        const node = event.target || {}
        var functions = (node.attributes.functions || {}).value
        const model = (node.attributes.model || {}).value
        console.log('formulas.handler', event.type, functions, model, row, data)
        
        if ((functions || model) && 
            (event.type == 'click' || event.type == 'change')) {

            const newData = {}
            if (model && event.type == 'change' && event.target && event.target.value) {
                //TODO checkbox
                const dotIndex = model.lastIndexOf('.')
                if (dotIndex > 0 && dotIndex < model.length - 1) {
                    const propertyName = model.substring(dotIndex + 1)
                    newData[propertyName] = event.target.value
                }

                const sch = row.schema
                if (!functions && sch && sch.key) {
                    functions = 'update_' + sch.key//TODO move logic to the generator
                }
            }

            if (functions && (
                event.type == 'click' && event.target.tagName.indexOf('BUTTON') >= 0 || 
                event.type == 'change'
            )) {//TODO move logic to the generator
                import('./' + functions + '.js').then(async function(fnc) {
                    return await fnc.default({...data, ...row}, newData, event)
                }).catch(err => {
                    console.log('DB error', err)
                    alert('DB error')
                })
            }
        }
    }
}

function value(expression, data, row) {
    //console.trace('formulas.value', expression, row, data)
    if ('$.enum_material2stroj_platny' == expression) {
        console.log(expression, row)
    }
    var ret = formula(expression, data, row)
    if (typeof(ret) == 'object' && ret !== null && typeof ret.length != 'undefined') {
        if (ret.length > 0) {
            return ret[0]
        }
        return null
    }
    return ret
}
function text(expression, data, row) {
    //console.trace('formulas.text', expression, row, data)
    var ret = value(expression, data, row)
    if (ret === null || typeof ret === 'undefined') {
        return ''
    }
    return ret
}
function number(expression, data, row) {
    //console.trace('formulas.number', expression, row, data)
    var ret = value(expression, data, row)
    //TODO format number
    if (ret === null || typeof ret === 'undefined') {
        return ''
    }
    return ret
}

function scope(expression, data, row) {
    //console.log('formulas.number', expression, row, data)
    var ret = formula(expression, data, row, false)
    //TODO format number
    if (ret === null || typeof ret === 'undefined') {
        return []
    }
    return ret
}

function items(expression, data, row) {
    //console.log('formulas.number', expression, row, data)
    var ret = formula(expression, data, row, true)
    //TODO format number
    if (ret === null || typeof ret === 'undefined') {
        return []
    }
    return ret
}

function formula(expression, data, row, flatten) {
    if ('$.enum_material2stroj_platny' == expression) {
        console.log('enum_material2stroj_platny', row)
    }
    //console.log('formulas.formula', expression, row, data)
    if (typeof expression == 'string' && expression.length > 0) {
        if (expression[0] == '$') {
            var json = {...data, ...row}
            var ret = JSONPath({flatten, path: expression, json})
            return ret
        } else if (expression[0] == '=') {
            const xlsFormula = newXlsFormula()
            const formulaRet = xlsFormula.parse(expression.substring(1));
            if (formulaRet.error) {
                console.error('formula error ', formulaRet.error, ' ', expression);
                return ''
            }
            return formulaRet.result
        }
    }
    if (expression === '') {
        return row
    }
    return expression
}

export function mutate(params) {
    return query(params)
}
export function query({query, variables}) {
    return fetch(endpoint /*+ '#' + + Date.now()*/, {
        method: 'POST',
		headers: { 
            'Content-Type': 'application/json',
            cache: 'no-store'
        },
        body: JSON.stringify({ query, variables})
    })
    .then(res => res.json())
    .then(res => {
        if (res.errors) {
            throw res.errors // .catch()
        }
        return res
    })
}

export const formulas = {
    handler,
    value,
    text,
    number,
    scope,
    items
}

if (typeof window != 'undefined' && !window.formulas) {
    window.formulas = formulas
}
if (typeof window != 'undefined' && !window.graphql) {
    window.graphql = {query, mutate, cache, HDB_RELATIONS}
}
