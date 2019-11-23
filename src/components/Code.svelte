<pre class={classes}>
	{#if label}
		<span class="comment"># {label}</span>
	{/if}
	<span class="text"># {text}</span>
</pre>

<script>
	export let label = '';
	export let offset = false;
	export let text = '';

	$: classes = 'pre' + (offset ? ' offset' : '');
</script>

<style lang="css">
	.pre {
		padding: 12px;
		background: rgb(246, 248, 255);
		font-family: 'Roboto Mono', monospace;
		white-space: initial;
		line-height: 1.5;
		font-size: 14px;
	}
	
	.offset {
		margin-top: -24px;
	}
	
	.comment {
		display: block;
		color: rgb(89, 89, 121);
	}
	
	.text {
		display: block;
		color: rgb(16, 96, 182);
	}
</style>
