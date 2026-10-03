# Mobile responsiveness pass

## Goal
Make every public, account, and producer page comfortable and reliable on phone and tablet widths while preserving the current desktop design and Bulgarian visual identity.

## Changes
- Standardize mobile page spacing, readable heading sizes, safe text wrapping, tap-target sizing, and horizontal overflow prevention.
- Refine the shared header, mobile menu, footer, panel navigation, page titles, cards, search, dialogs, forms, and empty/loading states.
- Rework dense views for phones: product filters and sorting, product and producer details, dashboard statistics, product management, inquiries, reviews, settings, and messaging.
- Replace desktop-only table behavior with a scannable mobile presentation while keeping the table on larger screens.
- Ensure action rows, images, prices, badges, and long Bulgarian labels stay visible without overlap or clipping.

## Validation
- Check every route at a 393px phone viewport and representative tablet/desktop widths.
- Exercise key interactions: menu, search, filters, list/grid controls, forms/dialogs, dashboard navigation, and messaging.
- Confirm no horizontal page overflow, inaccessible controls, runtime errors, or build errors remain.

## Technical details
- Keep TanStack Router, existing shadcn controls, semantic color tokens, mock query layer, and current desktop structure.
- Use mobile-first Tailwind classes and shared responsive patterns rather than page-specific fixed widths.
- Add no backend or persistence changes.
