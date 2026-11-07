# Pai Dogs

QR-tag registry for the community dogs of Pai. Each dog wears an orange collar
with an engraved steel tag. Scanning the tag opens the dog's page: photo, name,
where it lives, sterilization and rabies status, who feeds it, and a button to
report a sighting or an injury.

## What's in it

**Public (Thai / English, picks from the phone's language)**
- `/d/K7M2X`: dog page reached from the tag. Shows a red banner if the dog is marked missing.
- `/d/K7M2X/report`: "I saw this dog" / "needs help" form with GPS, photo and an optional contact.
- `/`: program intro, plus a box to type a tag code if the QR is scratched.

**Volunteers (`/admin`, one shared password)**
- Inbox of public reports, with injured/sick ones highlighted. Tick each off with "Done".
- Map of each dog's last known position, and a dog list with search and health flags (not sterilized, rabies due).
- Dog page: edit details and photo, log your own sighting with GPS, sighting history on a map, tags.
- Tags: generate a batch of unique codes, then download a CSV for the engraver or print a QR sheet.
- Scan a blank tag while logged in and it offers "New dog with this tag" or "put on an existing dog" (replacement tag).

Optional Telegram alerts go to a volunteer group on every public report.

## How tags work

Tags are made before dogs. You generate, say, 100 random 5-character codes (no
0/O/1/I/L, so they can be read off a worn tag), send the CSV to the engraver,
and link each tag to a dog when you collar it. A dog can have several tags
over its life.

The QR encodes the URL in uppercase (`HTTPS://PAIDOGS.ORG/D/K7M2X`). That lets
the QR use alphanumeric mode, which gives a 25×25 code instead of 29×29, so the
dots are bigger on the same tag and scan more reliably on engraved steel.
`proxy.ts` serves `/D/...` as `/d/...`.

**Set `SITE_URL` to your real domain before ordering tags.** It's baked into every QR.

## Run locally

```bash
cp .env.example .env.local   # then edit
npm install
npm run db:migrate
npm run dev
```

## Deploy (free tiers)

1. Create a Postgres database on [Supabase](https://supabase.com) or [Neon](https://neon.tech) and copy its connection string.
2. Push this repo to GitHub and import it on [Vercel](https://vercel.com).
3. In Vercel, set the env vars from `.env.example`. Generate `SESSION_SECRET` with `openssl rand -hex 32`.
4. Run `DATABASE_URL=... npm run db:migrate` once from your machine.
5. Point your domain at Vercel.

Photos are resized in the browser to ~150 KB and stored in Postgres, so
there's no separate file storage to set up. 500 MB holds a few thousand photos.

## Stack

Next.js 16 (App Router, server actions), Drizzle ORM, Postgres, Tailwind, Leaflet + OpenStreetMap.

## Before launch

- Have a native speaker check the Thai strings in `lib/i18n.ts`.
- The admin UI is English only, and there's a single shared password. Add per-volunteer accounts if more than a few people will edit.
