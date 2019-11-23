<div>
	<section>
		<h1 class="title">{ params.title }</h1>
		<span class="subtitle">A killer story</span>
		<p class="summary">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Doloribus laborum eaque sapiente dolorem nisi voluptate explicabo corporis, veritatis vero. Quae voluptates voluptatum ut quis quia alias tenetur impedit quam quaerat.</p>

		<div class="content">
			<a href="/example/blog" class="back">Back to Blog</a>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam maiores necessitatibus nihil quo, cupiditate consectetur voluptatem cumque ipsum consequuntur aut repellat repellendus eligendi, placeat inventore perspiciatis dolores ipsa voluptates porro.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam maiores necessitatibus nihil quo, cupiditate consectetur voluptatem cumque ipsum consequuntur aut repellat repellendus eligendi, placeat inventore perspiciatis dolores ipsa voluptates porro.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam maiores necessitatibus nihil quo, cupiditate consectetur voluptatem cumque ipsum consequuntur aut repellat repellendus eligendi, placeat inventore perspiciatis dolores ipsa voluptates porro.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam maiores necessitatibus nihil quo, cupiditate consectetur voluptatem cumque ipsum consequuntur aut repellat repellendus eligendi, placeat inventore perspiciatis dolores ipsa voluptates porro.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam maiores necessitatibus nihil quo, cupiditate consectetur voluptatem cumque ipsum consequuntur aut repellat repellendus eligendi, placeat inventore perspiciatis dolores ipsa voluptates porro.</p>
			<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam maiores necessitatibus nihil quo, cupiditate consectetur voluptatem cumque ipsum consequuntur aut repellat repellendus eligendi, placeat inventore perspiciatis dolores ipsa voluptates porro.</p>
		</div>
	</section>

</div>

<script>
	export let params = {};
</script>

<style lang="css">
	.title {
		text-transform: capitalize;
	}
	
	.subtitle {
		opacity: 0.65;
		display: block;
		text-indent: 16px;
		font-style: italic;
		margin-top: -12px;
	}
	
	.summary {
		padding-top: 16px;
	}
	
	.content {
		position: relative;
		border-top: 2px solid var(--blue);
		padding-top: 32px;
		margin-top: 32px;
	}
	
	.back {
		top: -16px;
		display: block;
		padding: 4px 12px;
		position: absolute;
		margin-bottom: 16px;
		background: var(--blue);
		border-radius: var(--radius);
		font-family: var(--font-header);
		text-transform: uppercase;
		color: var(--offwhite);
		padding-left: 32px;
		line-height: 20px;
		font-weight: 800;
		font-size: 80%;
	}
	
	.back::after {
		content: '➤';
		position: absolute;
		transform: rotate(180deg);
		font-size: 14px;
		left: 10px;
		top: 4px;
	}
</style>
