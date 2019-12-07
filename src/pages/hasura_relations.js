import { normalize, schema } from 'normalizr'

import {fkConfigurationRefSrc, fkConfigurationSrcRef} from './hasura_foreign_keys'

export class HasuraRelations {
    constructor(tablesWithRelations) {
        this.normalizrTables = {}

        for (var i = 0; i < (tablesWithRelations || []).length; i++) {
            const table = tablesWithRelations[i]
            this.initTableSchema(table.table_name)
        }

        for (var i = 0; i < (tablesWithRelations || []).length; i++) {
            const table = tablesWithRelations[i]
            const schema = this.existingTableSchema(table.table_name)
                    
            for (var j = 0; j < (table.relationship || []).length; j++) {
                const rel = table.relationship[j]
                const ref = relationRemoteTableMapping(rel, table)
                if (schema && ref && ref.remote_table) {
                    const refSchema = this.existingTableSchema(ref.remote_table)
                    //normalizr expects key & definition
                    schema.definition[rel.rel_name] = rel.rel_type == 'array' ? [refSchema] : refSchema
                    //purpose: automatic cache update (column mapping for insert/update/delete)
                    schema.column_mapping[rel.rel_name] = ref.column_mapping
                }
            }
        }
        if (typeof windows == 'undefined') {
            window.aaaa = this.normalizrTables 
        }
    }
    
    initTableSchema(tableName) {
        return this.normalizrTables[tableName] = {key: tableName, definition: {}, column_mapping: {}}//schema.Entity(tableName)
    }

    existingTableSchema(tableName) {
        const schema = this.normalizrTables[tableName]
        if (schema) {
            return schema
        } else {
            return this.initTableSchema(tableName)
        }
    }
}

export function relationRemoteTableMapping(rel, table) {
    if (rel && rel.rel_def) {
        if (rel.rel_def.foreign_key_constraint_on) {
            if (typeof rel.rel_def.foreign_key_constraint_on == 'string') {
                const columnName = rel.rel_def.foreign_key_constraint_on
                return fkConfigurationSrcRef(table.foreign_key, columnName)
                //return findRefTableFK(table, columnName)
            } else if (rel.rel_def.foreign_key_constraint_on.column) {
                const columnName = rel.rel_def.foreign_key_constraint_on.column
                return fkConfigurationRefSrc(table.foreign_key_ref, columnName)
                //return findRefTableFK(table, columnName)
            } else {
                const remote_table = rel.rel_def.foreign_key_constraint_on.remote_table
                const column_mapping = rel.rel_def.foreign_key_constraint_on.column_mapping//TODO !!!
                return {remote_table, column_mapping}
            }
        } else if (rel.rel_def.manual_configuration && rel.rel_def.manual_configuration.remote_table) {
            const remote_table = rel.rel_def.manual_configuration.remote_table
            const column_mapping = rel.rel_def.manual_configuration.column_mapping
            return {remote_table, column_mapping}
        }
    }
}
