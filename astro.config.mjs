// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://intentweave.org',
	integrations: [
		starlight({
			title: 'IntentWeave',
			description: 'Code + docs + git → a queryable context index. $0 by default.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/intentweave/intentweave' },
			],
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: false,
			},
			head: [
				{
					tag: 'meta',
					attrs: { property: 'og:image', content: '/og-image.png' },
				},
			],
			customCss: ['./src/styles/custom.css'],
			editLink: {
				baseUrl: 'https://github.com/intentweave/intentweave/edit/main/website/',
			},
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Installation & Quick Start', slug: 'docs/getting-started' },
					],
				},
				{
					label: 'Core (Layer 1 — $0)',
					items: [
						{ label: 'Overview', slug: 'docs/cari/overview' },
						{ label: 'Build the Index', slug: 'docs/cari/build' },
						{ label: 'Retrieve', slug: 'docs/cari/retrieve' },
						{ label: 'Connections & Gaps', slug: 'docs/cari/connections' },
						{ label: 'Architecture Visualization', slug: 'docs/cari/focus' },
						{ label: 'CI Drift Check', slug: 'docs/cari/check' },
						{ label: 'Health Report', slug: 'docs/cari/report' },
						{ label: 'Incremental Update', slug: 'docs/cari/update' },
						{ label: 'Internals', slug: 'docs/cari/internals' },
					],
				},
				{
					label: 'Plugins',
					items: [
						{ label: 'Overview & Combinations', slug: 'docs/plugins/overview' },
						{ label: 'Knowledge Graph', slug: 'docs/kg/overview' },
						{ label: 'Try the KG', slug: 'docs/kg/try-it' },
					],
				},
				{
					label: 'Integrations',
					items: [
						{ label: 'GitHub Actions / CI', slug: 'docs/integrations/ci' },
						{ label: 'Copilot / MCP', slug: 'docs/integrations/mcp' },
					],
				},
				{
					label: 'Use Cases',
					items: [
						{ label: 'Auth Topic Retrieval', slug: 'examples/auth-retrieval' },
						{ label: 'Hidden Coupling', slug: 'examples/hidden-coupling' },
						{ label: 'PR Drift Check', slug: 'examples/pr-drift' },
						{ label: 'Architecture Layers', slug: 'examples/architecture-layers' },
					],
				},
				{
					label: 'Architecture',
					items: [
						{ label: 'Overview', slug: 'architecture/overview' },
						{ label: 'CARI Technical Spec', slug: 'architecture/cari-spec' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'CLI Reference', slug: 'docs/reference/cli' },
						{ label: 'Library API', slug: 'docs/reference/library-api' },
						{ label: 'Troubleshooting', slug: 'docs/reference/troubleshooting' },
					],
				},
				{
					label: 'Community',
					items: [
						{ label: 'Contributing', slug: 'community/contributing' },
						{ label: 'Roadmap', slug: 'community/roadmap' },
					],
				},
				{
					label: 'Legal',
					collapsed: true,
					items: [
						{ label: 'Imprint (Impressum)', slug: 'legal/imprint' },
					],
				},
			],
		}),
	],
});
