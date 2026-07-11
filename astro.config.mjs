// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://intentweave.org',
	integrations: [
		starlight({
			title: 'IntentWeave',
			description: 'IntentWeave enforces your ADRs in CI — catching architecture violations AI agents and busy developers introduce. $0 core, no LLM or servers required.',
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
			components: {
				Hero: './src/components/Hero.astro',
			},
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
					label: 'CARI Evidence Engine — always $0',
					items: [
						{ label: 'Overview', slug: 'docs/cari/overview' },
						{ label: 'Build the Index', slug: 'docs/cari/build' },
						{ label: 'Retrieve', slug: 'docs/cari/retrieve' },
						{ label: 'Adaptive Context Package', slug: 'docs/cari/context-pack' },
						{ label: 'Connections & Gaps', slug: 'docs/cari/connections' },
						{ label: 'Architecture Visualization', slug: 'docs/cari/focus' },
						{ label: 'Health Report', slug: 'docs/cari/report' },
						{ label: 'Incremental Update', slug: 'docs/cari/update' },
						{ label: 'Internals', slug: 'docs/cari/internals' },
					],
				},
				{
					label: 'Intent Engine',
					items: [
						{ label: 'Semantic Rule Checking', slug: 'docs/cari/semantic-rules' },
						{ label: 'CI Drift Detection', slug: 'docs/cari/check' },
						{ label: 'Prescriptive Architecture Diagram', slug: 'docs/cari/prescriptive-diagram' },
						{ label: 'Insights Book', slug: 'docs/cari/insights-book' },
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
						{ label: 'Live Demo: Doc ↔ Code Map', slug: 'examples/live-doc-code-map' },
						{ label: 'Live Demo: Rules Catalog', slug: 'examples/live-rules-catalog' },
						{ label: 'Live Demo: Adaptive Context Package', slug: 'examples/live-context-pack' },
						{ label: 'Auth Topic Retrieval', slug: 'examples/auth-retrieval' },
						{ label: 'Hidden Coupling', slug: 'examples/hidden-coupling' },
						{ label: 'PR Drift Check', slug: 'examples/pr-drift' },
						{ label: 'Architecture Layers', slug: 'examples/architecture-layers' },
						{ label: 'Intent Guardrails in CI', slug: 'examples/intent-rule-checking' },
					],
				},
				{
					label: 'Compare',
					items: [
						{ label: 'Overview', slug: 'compare/overview' },
						{ label: 'vs. Semgrep', slug: 'compare/vs-semgrep' },
						{ label: 'vs. ArchUnitTS', slug: 'compare/vs-archunitts' },
						{ label: 'vs. dependency-cruiser', slug: 'compare/vs-dependency-cruiser' },
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
						{ label: 'Changelog', slug: 'community/changelog' },
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
