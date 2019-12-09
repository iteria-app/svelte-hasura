import {fkConfigurationRefSrc, fkConfigurationSrcRef} from './hasura_foreign_keys'

export class HasuraRelations {
    constructor(tablesWithRelations) {
        this.schemaTables = {}
        
        for (var i = 0; i < (tablesWithRelations || []).length; i++) {
            const table = tablesWithRelations[i]
            const schemaTable = this.schemaTable(table.table_name)
            
            for (var j = 0; j < (table.relationship || []).length; j++) {
                const rel = table.relationship[j]
                const ref = relationRemoteTableMapping(rel, table)
                if (schemaTable && ref && ref.remote_table) {
                    schemaTable.relations[rel.rel_name] = {
                        rel_type: rel.rel_type,
                        remote_table: ref.remote_table,
                        column_mapping: ref.column_mapping,
                    }
                }
            }
        }
        if (typeof windows == 'undefined') {
            window.aaaa = this.schemaTables 
        }
    }
    
    initSchemaTable(tableName) {
        return this.schemaTables[tableName] = {key: tableName, relations: {}, column_mapping: {}}//schema.Entity(tableName)
    }

    schemaTable(tableName) {
        const schema = this.schemaTables[tableName]
        if (schema) {
            return schema
        } else {
            return this.initSchemaTable(tableName)
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
