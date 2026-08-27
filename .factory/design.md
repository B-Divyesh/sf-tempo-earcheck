# Tempo Earcheck — visual thesis

## Direction

**Monochrome rehearsal broadsheet.** The interface behaves like a musician’s marked-up tempo sheet: decisive black type, warm music-paper ground, ruled columns, registration marks, and one vermilion editor’s-pencil accent. It fits the product because a tempo decision should feel recordable and defensible—not like a disposable utility dial. The metronome remains an instrument; the notebook remains the evidence.

The treatment is explicitly light-only. Warm paper is painted on every surface, including the standalone splash. Contrast and print hierarchy carry meaning; vermilion is reserved for active beats, primary actions, and corrective marks.

## Tokens

- Paper / background: `#F2EFE6`
- Raised sheet / surface: `#FBF9F2`
- Ink / text: `#171713`
- Soft ink / muted text: `#5D5B53`
- Rule / UI outline: `#77746B`
- Pencil / accent: `#B53220`; accent contrast: `#FFFFFF`
- Passed / success: `#1E6047`
- Caution: `#7A4A08`; danger: `#942D22`

All body combinations meet WCAG AA. Statuses pair color with words or symbols.

## Type

Two deliberately ordinary, local stacks create the newspaper voice without a font download: Georgia for editorial display and the platform grotesk (`Arial Narrow`, `Arial`, sans-serif) for controls, figures, and notes. Display headings are tight and high-contrast; utility labels are uppercase with generous tracking. BPM and timestamps use tabular figures. Body copy is 16–18px with 1.5 leading and a maximum measure of 68 characters.

Scale: 14 / 16 / 20 / 32 / clamp(48–88) px. Spacing follows a 4px base with 8, 12, 16, 24, 32, 48, and 64px steps.

## Layout and interaction grammar

The desktop is a two-column front page: the live tempo desk is the lead story; the practice ledger is the continuing column. On 390px, the live desk comes first and all multi-column records stack. Heavy top/bottom rules establish sections; nested rounded cards are avoided. Buttons use square editorial edges, 44px minimum targets, and a 2px offset pressed state. A red beat block travels across meter cells, and all actions answer with live text.

Keyboard: Space taps tempo when focus is not in a field; M toggles the click; Escape closes dialogs. Every shortcut is also visible beside its button.

## Motion policy

Only state-changing motion is used: a 180ms beat-cell fill, a 160ms button press, and a 220ms sheet/dialog reveal. Nothing loops as decoration. Under `prefers-reduced-motion`, transitions are removed and the beat remains an instantaneous color/state change. The audible click never autoplays.

## Asset plan and provenance

Hero illustration: an original still life of a mechanical metronome, annotated rehearsal cards, and pencil rendered as stark black editorial engraving on warm paper. It clarifies the product’s bridge between listening and recording. Generated with the factory image model (`factory-image`, Azure OpenAI), 2026-08-27; original for this product.

Prompt sheet: “Editorial broadsheet still life, top-down three-quarter view of a classic mechanical metronome beside a small stack of blank rehearsal index cards and a red proofreading pencil, black woodcut and stipple ink on warm ivory uncoated music paper, restrained vermilion accents, hard directional studio light, generous paper negative space, authentic print registration texture, sophisticated 1930s newspaper engraving, no people, no hands, no musical notation, no readable text, no logos, no watermark, no gradients, no glossy 3D render.”

App icons are hand-authored SVG registration-mark/metronome monograms, exported locally to PNG. Generated-image disclosure appears in the footer. No copyrighted or third-party assets are included.
