# Navigation system check

2026-10-24 · Ordinary Operate extension of the existing Read/course system.

## Result

Compatible with the incumbent identity. Preserve `DESIGN.md` and `.impeccable/design.json`; no rebrand, token replacement or system rewrite is required.

## Evidence

- Compared the documented Epilogue/stone/ink/blue identity and existing learning extension against `learning/public/navigation.{css,js}`, `student.js`, `admin.{css,js}` and `learning/pages/{meus-cursos,administracao}.html`, with `course.css` as the incumbent reading surface.
- Navigation reuses ground, lesson-paper, ink, accent, lesson-line and error variables. Flat course rows retain explicit state text and native 5px progress. Controls remain square; admin fields reuse the existing pale field and border. No shadows, raster assets or new colour primitives were introduced.
- The 260px application sidebar is a surface layout variant; it narrows to the incumbent 235px intermediate width and collapses into native details at 760px. Lesson outline and reading layout stay available. This does not replace the documented lesson sidebar geometry.
- Student filters use an ink selected state with `aria-pressed`; this operational variant uses established colours. The blue selected catalogue category remains the home-specific variant documented in DESIGN.md.
- Shared navigation uses `aria-current`, a labelled nav, account/logout destinations and conditional admin/resume entries. The mobile menu supports Escape and restores summary focus. Existing focus and reduced-motion rules are inherited.
- Admin search, labelled course selection, explicit grant/revoke radios and a review sentence precede saving. Loading/error/empty messages and list refresh expose state without adding a visual language.
- Evidence inventory: 21 PNG captures in `.impeccable/navigation-review`, covering desktop/mobile pending, empty, active, completed, offline, mobile menu, lesson navigation and admin search/grant/revoke/course switching. Fresh reviewer reported ship with no material corrections; this documentation check relies on that visual review and source comparison.

## Existing documentation limits

The earlier lesson palette is documented in DESIGN.md prose and component snippets rather than fully represented in frontmatter primitives. This predates the navigation extension. No repair or sidecar regeneration was performed in this scoped check. The home navigation and filter descriptions remain explicitly scoped to that surface; application variants do not invalidate them.

No new system inconsistency found. Native account operations remain outside the fixture tests, as recorded in the navigation brief.
