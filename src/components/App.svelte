<div class="app">
	<Nav />

	<main class="wrapper">
		<svelte:component this={ Route } { params } />
	</main>

	<Footer />
</div>

<script>
	import Navaid from 'navaid';
	import { onMount } from 'svelte';
	import Footer from '@components/Footer';
	import Nav from '@components/Nav';

	let Route, params={};

	function draw(m, params) {
		params = params || {};
		Route = m.default || m;
	}

	function track(obj) {
		if (window.ga) {
			ga.send('pageview', { dp:obj.uri });
		}
	}

	const router = (
		Navaid('/')
			.on('/', () => import('@pages/Home').then(draw))
			.on('/example/blog', () => import('@pages/Blog').then(draw))
			.on('/example/blog/:title', obj => import('@pages/Article').then(m => draw(m, obj)))
			.on('/example/search', obj => import('@pages/Search').then(m => draw(m, obj)))
	);

	onMount(() => {
		router.listen();
		addEventListener('replacestate', track);
		addEventListener('pushstate', track);
		addEventListener('popstate', track);

		return () => {
			removeEventListener('replacestate', track);
			removeEventListener('pushstate', track);
			removeEventListener('popstate', track);
			router.unlisten();
		};
	});
</script>

<style lang="css">
	.app {
		position: relative;
	}
	
	.wrapper {
		width: 75%;
		margin: 0 auto;
		position: relative;
		min-height: calc(55vh - 16px);
		z-index: 1;
	}
	
	@media screen and (max-width: 769px) {
		.wrapper {
			width: 90%;
		}
	}
</style>
