# intentweave.org

Source for the [IntentWeave](https://intentweave.org) website — built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build), deployed on [Cloudflare Pages](https://pages.cloudflare.com).

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output → dist/
npm run preview   # preview the build locally
```

## Deployment

Cloudflare Pages auto-deploys on push to `main`.

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` |

## License

Content: © Benjamin Becker. Code: MIT.
