<div>


	<section class="section">
		<h2>About</h2>
		<p>These pages are demostration of using Hasura GraphQL engine with Svelte</p>
	</section>

	<section class="section">
		<h2>Installation</h2>

		<Code text="npm install --global @pwa/cli" />
		<Code offset label="OR" text="yarn global add @pwa/cli" />
	</section>

	<section class="section">
		<h2>Commands</h2>
		<Code label="Scaffold a new project!" text="pwa init" />
		<Code label="Run development/live-reload server" text="pwa watch" />
		<Code label="Build production bundle(s)" text="pwa build" />
		<Code label="Generate static HTML exports" text="pwa export" />
	</section>
</div>

<script>
	import Code from '@components/Code';
</script>

<style lang="css">
	.section {
		padding-bottom: 64px;
	}
	
	.section h2 {
		margin-bottom: 16px;
	}
</style>
