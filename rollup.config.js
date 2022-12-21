import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import normalize from "postcss-normalize";
import svg from "rollup-plugin-svg"
const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: !production,
		format: "iife",
		name: "app",
		dir: "./dist",
		entryFileNames: "main.js"
	},
	// output: {
	// 	sourcemap: true,
	// 	format: 'iife',
	// 	name: 'app',
	// 	outDir: "./dist",
	// 	// dir: "./dist",
	// 	file: "./dist/bundle.js",
	// },
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),

		copy({
			targets: [
				{ src: "public/**/*", dest: "./dist" },
				{ src: 'node_modules/tinymce/*', dest: './dist/tinymce' },
				{ src: "src/assets/fonts/*", dest: "./dist/assets/fonts" },
			]
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance


		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),
		postcss({
			extract: "global.css",
			plugins: [autoprefixer(), normalize()],
		}),
		svg(),
		// In dev mode, call `npm run start` once
		// the bundle has been generated

		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload("dist"),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
