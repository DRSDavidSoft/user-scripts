# Soft98 Ad Blocker

Maintainable source for `../soft98_ad-blocker.user.js`.

## Build

```bash
npm ci
npm run check
```

The build uses `src/meta.txt` and `src/runtime.js`, then writes the single minified userscript at the repository root.

## Runtime Layers

- Document-start script and `eval` hijacking
- Dean Edwards packed-script unpacking before patching
- Behavior-based anti-adblock patch rules
- Download-link preservation and recovery
- Heuristic ad-surface detection by source, href, and ad dimensions
- Optional Soft98 Pro panel with modern dark design, badges, diagnostics, pirate logo, and success-only taunt
- PersianBlocker/MasterKia external notice removal, tested separately from Soft98's own warning removals
- Browser extension recommendation after a successful cleanup; the extension is the preferred install for richer controls

Avoid relying on generated Soft98 class names, IDs, or mutable message keys. Prefer behavior and structure.
