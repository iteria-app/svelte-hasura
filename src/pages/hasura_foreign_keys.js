import { xlink_attr } from "svelte/internal"

export function fkConfigurationSrcRef(fks, columnName) {
    for (var i = 0; i < (fks || []).length; i++) {
        const fk = fks[i]
        if (fk.column_mapping) {
            const column_mapping = {}
            const columnNameRef = fk.column_mapping[columnName]
            if (columnNameRef) {
                column_mapping[columnName] = columnNameRef//TODO we dont support composed keys yet
                const remote_table = fk.ref_table
                return {remote_table, column_mapping}
            }
        }
    }
}
export function fkConfigurationRefSrc(fks, columnName) {
    for (var i = 0; i < (fks || []).length; i++) {
        const fk = fks[i]
        if (fk.column_mapping) {
            const column_mapping = {}
            const columnNameRef = fk.column_mapping[columnName]
            if (columnNameRef) {
                column_mapping[columnNameRef] = columnName//TODO we dont support composed keys yet
                const remote_table = fk.table_name
                return {remote_table, column_mapping}
            }
        }
    }
}
