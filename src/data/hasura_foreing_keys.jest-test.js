import {fkConfigurationSrcRef, fkConfigurationRefSrc} from './hasura_foreign_keys'

test('orders.order_items -> order_items.order', () => {
  const fks = [
    {
      "table_name": "order_items",
      "ref_table": "orders",
      "column_mapping": {
        "order": "id"
      }
    }
  ]

  const configuration = fkConfigurationRefSrc(fks, "order")
  expect(configuration.remote_table).toBe("order_items")
  expect(configuration.column_mapping).toStrictEqual({
    "id": "order"
  })
});

test('order_items.order -> orders.order_items', () => {
  const fks = [
    {
      "table_name": "order_items",
      "ref_table": "orders",
      "column_mapping": {
        "order": "id"
      }
    }
  ]
  
  const configuration = fkConfigurationSrcRef(fks, "order")
  expect(configuration.remote_table).toBe("orders")
  expect(configuration.column_mapping).toStrictEqual({
    "order": "id"
  })
});
