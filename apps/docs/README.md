# ADS documentation site

The docs site is a static Vite application. It imports the component package for live previews and reads `packages/components/custom-elements.json` for the catalogue and API panels.

From the repository root:

```bash
pnpm run dev       # start the docs site at http://127.0.0.1:4174
pnpm run docs:build
```

The catalogue is generated at build time from the checked-in custom-elements metadata. Component selection is URL-addressable with a hash such as `#ads-button`; no server-side routing or runtime API is required for the core docs experience.
