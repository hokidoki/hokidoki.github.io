import App from './App.svelte';
import "./Quill/CustomQuill"

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;