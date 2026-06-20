# ZCore dapp accessibility guidelines

This checklist applies to the authenticated dapp in `Front/`.

## Auth flows

- Keep wallet connection controls keyboard reachable and give them explicit accessible names.
- Announce wallet auth and signing errors with `role="alert"` and `aria-live="polite"`.
- Preserve visible focus on CTA buttons, secondary links, and wallet switch controls.

## Dashboard

- Wrap dapp pages in the `DappShell` landmark so keyboard users can skip directly to content.
- Expose credit score and tier progress with screen-reader labels, not only visual bars.
- Keep score and tier text available as real text, not only icons or decorative graphics.

## Visual checks

- Text and badge contrast should meet WCAG 2.1 AA contrast for normal text.
- Decorative grid, noise, and icons should be hidden from assistive technology with `aria-hidden`.
- Each page should keep a logical heading order from page title to section content.

## Local audit loop

1. Start the dapp locally.
2. Navigate `/login`, `/register`, and `/dashboard` using only the keyboard.
3. Confirm the skip link appears on first tab focus.
4. Confirm wallet auth errors are announced by a screen reader or browser accessibility tree.
5. Run Lighthouse or axe on the scoped pages before opening a UI PR.
