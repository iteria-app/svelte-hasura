TODO search filter:
<ul>
	<li>multichoce state</li>
	<li>fulltext name, note</li>
</ul>
<hr/>

{#await orders}
  <li>Loading...</li>
{:then res}
{JSON.stringify(res)}

<table>
	<tr>
		<th>ID</th>
		<th>Name</th>
		<th>State</th>
		<th>Note</th>
	</tr>
	{#each res.data.orders.nodes as order}
	<tr>
		<td>{order.id}</td>
		<td>{order.name}</td>
		<td>{(order.order_state || {}).name}</td>
		<td>{order.note}</td>
	</tr>
	{:else}
		no data
	{/each}
</table>
{:catch error}
  <li>Error loading: {error}</li>
{/await}


<script>
	//import gql from 'graphql-tag';

	const variables = {
		"offset": 0, 
		"limit": 10, 
		"where": {"_and": {"id": {"_in": 1}}}, 
		"order_by": {"name": "asc"} 
		}

	const QUERY = `
	query search_orders($offset : Int, $limit : Int, $where : orders_bool_exp, $order_by : [orders_order_by!]) {
		orders: orders_aggregate(offset: $offset, limit: $limit, order_by: $order_by, where: $where) {
			aggregate {
			count(columns: id)
			}
			nodes {
			id
			name
			note
			order_state {
				name
			}
			}
		}
		order_states(order_by: {name: asc}) {
			id
			name
		}
	}
	`

	const endpoint = 'https://dev-svelte-hasura.herokuapp.com/v1/graphql'
	var orders = fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: QUERY, variables }),
		})
		.then(res => res.json())
</script>
