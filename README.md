# The Midnight Reading Nook

A cozy, storybook-inspired book advent calendar built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion. The experience is entirely client-side and stores reading progress in `localStorage`.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

Vite uses a relative `base`, so the generated `dist/` directory works on both GitHub Pages and Vercel, including project subpaths.

## Adding reading content

Daily metadata lives in `src/data/books.json`. Add licensed online-reading URLs or PDFs that you own or have permission to distribute before wiring the placeholder reading actions to files in `public/books/`.
