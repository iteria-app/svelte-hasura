//import gql from 'graphql-tag';

export function generateQueryUsingVariables(input) {
  var varDeclarations = []
  var body = ''
  var variables = []
  for (var mutationName in input) {
    const objs = input[mutationName]
    const mut = mutateObject(mutationName, objs)
    body += mut.body
    varDeclarations = [ ...varDeclarations, ...mut.varDeclarations ]
    variables = [ ...variables, ...mut.variables ]
  }
  const varDeclaration = varDeclarations.join(', ')

  return { query: `mutation (${varDeclaration}) {
    ${body}}`, variables }
}

export function tableNameFromMutation(k) {
  var table_name = k
  if (k.startsWith('insert_')) {
      table_name = k.substring('insert_'.length)
  } else if (k.startsWith('update_')) {
      table_name = k.substring('update_'.length)
  } else if (k.startsWith('delete_')) {
      table_name = k.substring('delete_'.length)
  }
  return table_name
}

function inspectFields(fields, setFields) {
  var fieldStr = ''
  
  if (fields && typeof fields === 'object') {
    for (var k in fields) {
      fieldStr += k + '\n'
      const v = fields[k]
      if (v && typeof v == 'object' && typeof v.length == 'undefined' && v.name == 'DB') {//TODO FUJ!!! vyriesit na vyssej vrstve (JSON vs hierarchia tabuliek)
        fieldStr += '{\n'
        if (typeof v.id == 'undefined') {
          fieldStr += 'id\n'
          fieldStr += inspectFields(v)
        } else {//TODO handle insert graph (faktura + polozka)
          fieldStr += inspectFields(v)
        }
        fieldStr += '}\n'
      } else if (setFields && typeof setFields == 'object') {
        setFields[k] = v
      }
    }
  }

  return fieldStr
}

function whereIdStr(id) {
  if (typeof id === 'string') {
    return {type: 'uuid' /* TODO regexp */, whereStr: `{id: {_eq:'${id}'}}`}
  }
  return {type: 'Int', whereStr: `{id: {_eq:${id}}}`}
}

export function mutateObject(mutationName, objs) {
  const table_name = tableNameFromMutation(mutationName)
  
  if (!(typeof objs == 'object' && typeof objs.length != 'undefined')) {
    objs = [objs]
  }

  if (mutationName.startsWith('insert_')) {
    var paramStr = `objects: $${mutationName}`    
    const returning = ''/*inspectFields(obj)*/
    //const on_conflictStr = on_conflict ? ', on_conflict: ' + JSON.stringify(on_conflict) : ''

    const body = `${mutationName}(${paramStr}) {
      affected_rows
      returning {
        id ${returning}
      }
    }`
    
    const variables = {}
    variables[mutationName] = objs
    return {body, variables, varDeclarations: [`$${mutationName} : [${table_name}_insert_input]`]}
  } else {
    var body = ''
    var varDeclarations = []
    const variables = {}
    for (var i = 0; i < objs.length; i++) {
      const obj = objs[i]

      if (mutationName.startsWith('update_')) {
        const varName = `${mutationName}${i}`
        variables[varName] = obj

        const returning = ''/*inspectFields(obj)*/
        var paramStr = `_set: $${varName}, where:` + whereIdStr(obj.id)
        body += `${mutationName}(${paramStr}) {
          affected_rows
          returning {
            id ${returning}
          }
        }`
        
        varDeclarations.push(`$${varName} : ${table_name}_set_input`)
      } else if (mutationName.startsWith('delete_')) {
        const returning = ''/*inspectFields(obj)*/
        var paramStr = 'where:' + whereIdStr(obj.id)
        body += `${mutationName}(${paramStr}) {
          affected_rows
          returning {
            id ${returning}
          }
        }`
      }
    }
    return {body, variables: variables, varDeclarations}
  }

  //return `delete_${table_name}(where: {id: {_eq: $id}}) {
  //return `update_${table_name}(_set: $set, where: {id: {_eq: $id}}) {
}
