# FootballTLDR

A phone app that shows the NFL numbers people actually look up, and lets the rest stay folded. Not Flutter. One Expo project for iPhone and Android.

## Run it

```bash
npm install
npx expo start
```

Then open the project in Expo Go. `npm run web` runs the same UI in a browser, capped like a phone.

## Change the name, colors, or which stats show

Edit `src/config/`. Screens read those files.

- `brand.ts` — name, tagline, splash length, logo flag
- `teamColors.ts` — override a club's colors
- `statCatalog.ts` — main stats versus the ones behind "more", and the glossary
- `fantasyPresets.ts` — standard / half-PPR / PPR wording and default scoring
- `newsRules.ts` — what counts as a breaking-news headline
- `features.ts` — ticker, start/sit, export, refresh timer

The installed icon is `assets/images/icon.png`, pointed at by `app.json`. Expo reads that before the TypeScript config, so change both if you rebrand.

## Plan

`docs/memories/plan.md` is the source of truth. `docs/memories/log.md` is what has actually been done.
