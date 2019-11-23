<div>
	<section class="section">
		<h2>Example Blog!</h2>
		<p class="indent">Please select an Article to read:</p>
	</section>

	<div class="blog_grid">
		{#each items as _item, idx}
			<a class="blog_item" href={ `/example/blog/article${idx}` }>
				<Card>
					<strong>Article #{idx}</strong>
					<em>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Labore enim, natus. Beatae ducimus quasi doloremque ad quam qui dolor, architecto repellendus provident rem nostrum accusamus, magnam voluptate vel voluptas iste.</em>
				</Card>
			</a>
		{/each}
	</div>
</div>

<script>
	import Card from '@components/Card';

	const items = Array.from({ length:10 });
</script>

<style lang="css">
	.indent {
		opacity: 0.85;
		font-style: italic;
		border-left: 4px solid var(--blue);
		padding: 4px 16px;
	}
	
	.blog_grid {
		display: grid;
		grid-gap: 16px;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		margin-bottom: 32px;
	}
	
	.blog_item {
		cursor: pointer;
	}
	
	.blog_item:hover {
		text-decoration: none;
	}
	
	.blog_item strong {
		display: block;
		margin-bottom: 8px;
	}
	
	.blog_item em {
		font-size: 85%;
		line-height: 1;
	}
</style>
