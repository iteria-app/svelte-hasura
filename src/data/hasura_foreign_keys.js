export function fkConfigurationSrcRef(fks, column) {
    const columnName = typeof column == 'string' 
        ? column : column.column
    for (var i = 0; i < (fks || []).length; i++) {
        const fk = fks[i]
        //if (fk.column_mapping && fk.table_name == column.table) {
            const columnNameRef = fk.column_mapping[columnName]
            if (columnNameRef) {
                const column_mapping = {}
                column_mapping[columnName] = columnNameRef//TODO we dont support composed keys yet
                const remote_table = fk.ref_table
                return {remote_table, column_mapping}
            }
        //}
    }
}
export function fkConfigurationRefSrc(fks, column) {
    for (var i = 0; i < (fks || []).length; i++) {
        const fk = fks[i]
        if (fk.column_mapping && fk.table_name == column.table) {
            const column_mapping = {}
            const columnNameRef = fk.column_mapping[column.column]
            if (columnNameRef) {
                column_mapping[columnNameRef] = column.column//TODO we dont support composed keys yet
                const remote_table = fk.table_name
                return {remote_table, column_mapping}
            }
        }
    }
}
