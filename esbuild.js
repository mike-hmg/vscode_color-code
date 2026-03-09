const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');
const isProduction = process.argv.includes('--production');

const config = {
	entryPoints: [path.join(__dirname, 'src/extension.ts')],
	bundle: true,
	outfile: path.join(__dirname, 'dist/extension.js'),
	platform: 'node',
	target: 'node18',
	external: ['vscode'],
	format: 'cjs',
	sourcemap: !isProduction,
	minify: isProduction,
};

async function build() {
	try {
		if (isWatch) {
			const ctx = await esbuild.context(config);
			await ctx.watch();
			console.log('Watching for changes...');
		} else {
			await esbuild.build(config);
			console.log('Build complete!');
		}
	} catch (error) {
		console.error('Build failed:', error);
		process.exit(1);
	}
}

build();
