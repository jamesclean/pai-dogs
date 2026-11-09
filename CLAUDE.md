@AGENTS.md

# Pai Dogs: project context

The owner (James) runs this as a volunteer project for community/street dogs in
Pai, northern Thailand. He's a product designer, so treat visual polish as a
requirement, not a nice-to-have.

## What it is

Each dog wears an **international-orange collar** (#FF4F00) with a **stainless
slide-on tag** carrying a laser-engraved QR code. Scanning opens `/d/<CODE>`:
the dog's public page (photo, name, area, sterilization + rabies status,
caretaker with LINE button, "I saw this dog" / "Needs help" reports with GPS
and photo). Volunteers use `/admin` (shared password) for the report inbox,
last-seen map, dog editor, and tag batches (CSV + print sheet for the engraver).
Inspiration: wearescanme.com (Koh Samui).

See README.md for features and deployment, SOURCING.md for tag and collar suppliers.

## Key decisions (don't undo without asking)

- Tags are generated in batches *before* dogs exist, then linked when collared.
  Codes: 5 chars from `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (no 0/O/1/I/L).
- QR encodes the URL **uppercase** (`HTTPS://PAIDOGS.ORG/D/K7M2X`) so it uses
  alphanumeric mode, giving 25×25 modules and bigger dots on steel. `proxy.ts` rewrites
  `/D/*` to `/d/*`. (A next.config redirect loops, because it matches case-insensitively.)
  QR error correction level Q. `SITE_URL` is baked into every QR: it must be
  final before any tags are ordered.
- Photos are resized client-side to 1280px JPEG and stored as bytea in Postgres,
  so there's no separate blob storage.
- Public pages are Thai/English (cookie `lang`, falls back to Accept-Language).
  Strings live in `lib/i18n.ts`; Thai needs a native-speaker check.
  The admin UI is English only.
- Crew messaging lives inside the app: form submissions with contact details, waiting in the
  Dogs tab. No outside alerts. The crew doesn't use Telegram, and LINE Notify is dead.
- Collars and tags are optional. Every dog has a page at `/dogs/<id>`; a tag shows the same
  page at `/d/<CODE>`.
- `status` (community, missing, deceased) and `homeStatus` (Family dog, Ask about adoption) are
  separate. "Please don't take it away" stays on every community dog.
- Next 16 with `cacheComponents: false`: every page is dynamic on purpose.

## Design

The UI follows the Pai Dogs Figma file (World ID–style: white, minimal, lots of whitespace):
https://www.figma.com/design/jYLDF4OWbACbl1cO4KkTLO/Pai-Dogs?node-id=1-13201
- Kit section holds the variables (Light/Dark), text styles, components and icons.
  `app/globals.css` mirrors those variables one-to-one; components only use the token names.
- Light and Dark screen sets, plus "New features" sections (scan sighting, add a new dog,
  browse, look up). The sponsor (PromptPay) designs there are parked: don't build them yet.
- Type: Geist + IBM Plex Sans Thai. Icons: Hugeicons stroke rounded, 1.5 stroke.
- Main buttons are black (inverse). Orange is for the collar/brand only.
- No decorative dots (in chips, labels or lists). History timeline dots and map pins are fine.
- Image cards (photos, maps, the steel tag, the photo picker) have no border, Apple style.
  List and form cards keep their 1px `sep` border; removing it everywhere feels too nested.
- Copy follows James's house rules (`~/.claude/skills/copy-refinement`): verb + noun buttons,
  labels not questions, • between facts, sentence case, no em dashes.

## Status

- Code: https://github.com/jamesclean/pai-dogs. `main` is the old iOS re-skin. The redesign +
  new features are in PR #1 (`redesign-and-new-features`). Push over HTTPS as `jamesclean`
  (`git push https://github.com/jamesclean/pai-dogs.git <branch>`): the SSH key on James's Mac
  is his Verifast work account and can't push here. Don't touch his credentials.
- Not deployed. Deploy plan: Supabase (Postgres) + Vercel, not created yet. When James sends
  the connection string, run `npm run db:migrate` (migrations 0000–0002).
- Before launch: native Thai check of `lib/i18n.ts` and `app/privacy/page.tsx`;
  set `SITE_URL` (final, it's in every QR), `CONTACT_LINE`, `CONTACT_PHONE`.
- Parked: Sponsor a dog (PromptPay) is designed in Figma but not to be built yet. It needs
  real amounts and the program's PromptPay ID; a static PromptPay QR can't confirm payment.
- Not in Figma yet: the `/privacy` page.
- Deck: Figma Slides "Pai Dogs · Key features" (https://www.figma.com/slides/vvMZPTeKHcDFDzSZbOPNqL),
  6 slides with shots of the current screens. Re-export shots if screens change.
- Tags and collars: not ordered. Recommendation in SOURCING.md is 304 stainless slide-on,
  fiber-laser QR ≥18 mm, slot ≥26×4 mm, and a 25 mm orange TPU/biothane collar
  with metal buckle. Get samples first.

## Working locally

```bash
cp .env.example .env.local   # DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET, SITE_URL
npm install && npm run db:migrate
npm run build && npm start
npx playwright install chromium   # once
npm run e2e -- /tmp/pai-e2e         # full public + volunteer flow in headless iPhones
```

In the cloud container, Postgres 16 is installed:
`pg_ctlcluster 16 main start`, then create role/db `dogs`/`paidogs`.
OSM map tiles are blocked by the sandbox network (the maps render grey there, which is fine).
