import {relationRemoteTableMapping} from './hasura_relations'


test('orders.manual_order_items -> order_items.order', () => {
    const relation = {
        "rel_def": {
          "manual_configuration": {
            "remote_table": "order_items",
            "column_mapping": {
              "id": "order"
            }
          }
        },
        "rel_name": "manual_order_items",
        "rel_type": "array",
        "table_name": "orders"
    }

    const configuration = relationRemoteTableMapping(relation)

    expect(configuration.remote_table).toBe("order_items")
    expect(configuration.column_mapping).toStrictEqual({
      "id": "order"
    })
})

test('order_items.order -> orders.manual_order_items', () => {
    const relation = {
        "rel_def": {
          "manual_configuration": {
            "remote_table": "orders",
            "column_mapping": {
              "order": "id"
            }
          }
        },
        "rel_name": "manual_orderByOrder",
        "rel_type": "object",
        "table_name": "order_items"
    }

    const configuration = relationRemoteTableMapping(relation)

    expect(configuration.remote_table).toBe("orders")
    expect(configuration.column_mapping).toStrictEqual({
      "order": "id"
    })
})
