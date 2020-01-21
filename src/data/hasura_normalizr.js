import { schema } from 'normalizr'

export function normalizrSchemaTables(relations) {
    const entities = {}

    for (const [table_name, schemaTable] of Object.entries(relations.schemaTables || {})) {
        const srcEntity = getOrInitEntity(entities, table_name)

        for (const [rel_name, rel] of Object.entries(schemaTable.relations || {})) {
            //const refSchemaTable = relations.schemaTable(ref.remote_table)
            const refEntity = getOrInitEntity(entities, rel.remote_table)

            //TODO nicer srcEntity.define() insetead of direct access ".schema"
            srcEntity.schema[rel_name] =  rel.rel_type == 'array' ? 
                [refEntity] : refEntity
        }
    }

    return entities
}

function getOrInitEntity(entities, table_name) {
    const existing = entities[table_name]
    if (existing) {
        return existing
    }
    return entities[table_name] = new schema.Entity(table_name)
}