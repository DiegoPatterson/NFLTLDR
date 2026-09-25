# FootballTLDR — plan

Status: **v1 built** on 2026-09-21. You confirmed the recommended feature set, with the home-screen rule below (any live game can be in front; your team takes over once when it kicks off; a tap swaps them). This file is the source of truth. Read it before adding a screen, a stat, or a data source. If a decision changes, edit this file first, then the code.

Last updated: 2026-09-21

Routes live in `app/`, not `src/app`. That is the Expo Router root this project was generated with. Do not move them. Shared code lives in `src/`. The home-screen rule is `src/logic/focus.ts`.

## What this app is

A phone app for American football (NFL). Full stat sheets are the problem. FootballTLDR shows the few numbers most people actually check, and lets you open a section when you want the rest.

It is not a Flutter app. It is one React Native codebase via Expo, so the same project runs on iPhone and Android (Expo Go while developing).

It does not have accounts, and fantasy does not connect to other people. That can come later.

## Decisions already made

| Topic | Decision | Why |
| --- | --- | --- |
| Sport | NFL only for v1 | Fantasy rules, injury reports, and punishment logs are the NFL version of this idea. College is a later league, not a second app. |
| Stack | Expo + TypeScript, file-based routing | Cross-platform, not Flutter, no native rewrite to get on both phones. |
| Look | Built around the followed club | With team colors on, the background, cards, header, and tab bar are mixed from that club's colors. Home is titled with the nickname, and the header carries the logo plus a jersey stripe. Settings can turn this off and return to turf and gold. Logos are the ESPN club marks from `src/config/logos.ts`. The skin is `useTeamSkin` in `src/components/shell.tsx`. |
| Where you edit brand and copy | `src/config/` only | Name, tagline, logo, colors, which stats are "main", fantasy presets, feature flags. Screens read these files. They do not hardcode them. |
| Data | ESPN's site web API (`site.web.api.espn.com`) for scores, teams, standings, news, rosters, schedules, game summaries, and player search. Core API for season team stat splits. CDN scoreboard is the fallback if the site web API fails. | `site.api.espn.com` returns 403 from this network (Akamai). The web API answered. No API key. Sleeper was dropped for v1: ESPN player search returns a real stat line and avoids a 5MB player dump. A provider folder still wraps this so a paid feed can replace it. |
| Stats we will not invent | Advanced numbers (EPA, CPOE, success rate) | Show them only if a real source returns them. v1 does not pretend. |
| Storage | On device only | Primary team, custom fantasy rules, roster, and the punishment log. |
| Phone install | Local release APK, debug-signed | `npm run apk` writes `dist/FootballTLDR.apk` for sideload. Needs JDK 21. Not a Play Store build. Expo Go still shows the Expo icon; this APK shows the football icon. |

ESPN's endpoints are unofficial. They can change or fail. The app must cache the last good response and show it with a "last updated" time instead of going blank. Do not show betting lines, even when a payload includes them.

## Screens

Bottom tabs, icons only (no words). A fixed short bar clipped the old labels once a phone's home indicator took its share of the height.

1. **Home** — the front door. What it shows depends on the game state (see below).
2. **League** — every other team, then a team page when you tap one.
3. **Playbook** — formations, runs, route concepts, coverages, and the “if they keep doing this” answers. Replaced the Watch tab.
4. **Rules** — the plain-language NFL reminders, most looked-up first. This replaced the fantasy tab.

A gear in the header opens **Settings** (change primary team, data credits). Settings is not a tab.

First launch, before the tabs: a **load screen**, then **pick your team** if none is saved. You can change the team later in Settings.

### Home states

Confirmed 2026-09-21. This replaces the earlier "your team always stays in front" idea.

- **Any live game can take the front.** If games are in progress and yours is not, Home is one live game: score, clock, and the short stat compare for both clubs. The other live games sit in a thin strip.
- **When your team's game comes on, it takes the front once.** The game you were watching moves into the strip. This happens one time per your-team game (at kickoff, or the first time the app sees that game already live). It does not yank the screen back on every refresh.
- **Tap the strip to swap.** The tapped game becomes the front. If your team's game is live and no longer in front, it sits on the strip. Tap it to put yours back. A manual swap sticks until a new game of yours starts.
- **Nothing is live.** Home still leads with the scoreboard: the next game (kickoff, logos, and any listed inactives) and the week's final scores under it. Your team's digest sits below that. An upcoming game does not pretend to be live. Tapping a final or the next game opens it.
- **Near kickoff.** If a game starts within three hours, Home keeps asking for a new scoreboard so it flips to live without a pull-to-refresh. The interval is `soonRefreshMs` in `src/config/features.ts`. Live games use the faster `liveRefreshMs`.
- **Offseason or an empty week.** Do not fake a live game. Show last result, record, and the calendar.

Remember `focusedGameId`, `userPinnedGameId`, and the your-team game ids already auto-promoted. The rule lives in `src/logic/focus.ts`. Do not reimplement it inside a screen.

Leaders on the team digest are **last-game leaders**, labeled that way. The free feed does not hand over a season-long player leaderboard in one call, and we do not invent one. Season team rates (points per game, yards per game, third down, red zone) come from the team stat split.

### Team digest (your team, and any other team)

Same layout everywhere. Your team is just the default.

Collapsed sections, each with the few numbers people look up first. Tap to expand the rest and a plain-English line for any abbreviation.

- Record and division standing
- Next game, or last game if the season is between weeks
- Scores: every finished game this season, newest first. Tap one for that game.
- Leaders: passing, rushing, receiving
- Offense: points, yards, turnovers, third down, red zone
- Defense: points allowed, sacks, takeaways
- Injuries, grouped Out / Doubtful / Questionable

Which numbers are "main" vs "more" is a list in `src/config/statCatalog.ts`, not buried in the component.

The team page uses that club’s colors while it is open, the same way a player page does, and backing out restores the followed club. Players is a closed section. Open it for the roster, grouped by position. Inside a position, the depth chart order is used: the player the club lists first, then the next, and anyone not on that chart last. Tap a name for the same player card as search. Pin and unpin use the same list as League.

### League

A playoff picture sits above the team list. It uses ESPN's current seed, not a guessed tiebreaker. Seed 1 would have the bye. The wild-card pairings are 2-7, 3-6, and 4-5, higher seed at home, labeled as what would happen if the season ended today. After the wild-card weekend the league reseeds, so the picture does not draw a locked path to the Super Bowl. Once playoff games are on the schedule, those real games replace the projection. The Super Bowl is the AFC winner against the NFC winner.

Conferences and divisions, plus search. The same box also searches players, but player hits stay hidden until there is a search. Pin a player and he stays under the search bar so the team list can still be scrolled. Tap a team for the same digest. The page makes it obvious this is not your primary team, with a way to set it as primary.

The open player card shows his name and the full club name, with that club’s logo beside the name. The position stays an abbreviation. While the page is open the chrome uses his club’s colors, from the same field and accent pair as the rest of the app. Backing out restores the followed club. Under the name, the clubs he actually played for come from the season stat feed, with the years. An injury-report line shows only when he is on it. The latest wire note and a couple of headlines that name him fill the rest. A pinned row is the logo plus the abbreviations, not the news or the recolor.

### Playbook

`src/config/playbook.ts` is the list. Grouped: formations, runs, quick game, concepts, play action, screens, coverage, fronts, and a last section for what to call when a team keeps doing the same thing. A row shows the name and what it looks like. Tap it for a published Wikimedia Commons diagram when one exists (`src/config/playImages.ts`), then how it works, the tell, when to call it, and the answer. Do not draw a guessed board for a play that has no published diagram. Not a club’s secret sheet.

### Rules

One tab, not a line buried on League. Short reminders in `src/config/nflRules.ts`, common flags first. Tap a row to open the explanation. Wording is a reminder, not the league's book.

### Fantasy

Removed from the app on 2026-09-21. It was not useful. Do not put the roster builder, custom sheet, or punishment log back on a tab unless asked. The old save shape can still be on the phone; nothing on screen reads it.

### News bar

A thin scrolling bar that any screen can turn on. It is for big items only: injury moves to Out, score changes in games you care about, and headlines that look like news rather than features. Quieter headlines sit in a list under it, not in the scroller. "Big" is a rule in config (keywords and injury statuses), not an editor in a newsroom. If the feed is down, the bar hides. It does not show a fake headline.

### Load screen

Short, and skippable by tap. Field lines, the app name, and the tagline. Name, tagline, how long it stays up, and the logo file all come from `src/config/brand.ts`. If no logo file is set, the screen draws a mark in code so you are not blocked on art.

## Extra features included unless you cut them

These were not in the original list. They are in v1 because the app feels broken without them.

1. **Team colors.** Picking the Eagles (or anyone) restyles the accent. Override any team in `src/config/teamColors.ts`. If you don't, use the color from the data feed.
2. **Plain-English layer.** Every main section gets one TLDR sentence, and tapping a label like "RTG" or "YPC" explains it. The glossary is data in the stat catalog.
3. **Next-opponent injuries**, not only your own team's list, when a game is coming up.
4. **Schedule strip and division standing** on the team digest. A record with no context is not a digest.
5. **Pull to refresh, cache, and last-updated.** The unofficial feed will fail sometimes.
6. **Settings** to change the primary team and to credit ESPN.

## Explicitly later (do not build these now)

- Accounts, friends, shared leagues, live drafts
- Push notifications
- Betting lines or odds
- College football
- AI-written recaps (a template sentence is enough for v1)
- Home-screen widgets
- Trade calculator
- Video highlights

## Config files (edit these, not the screens)

| File | What you change |
| --- | --- |
| `src/config/brand.ts` | App name, tagline, logo path, splash length |
| `src/config/theme.ts` | Base dark theme, fonts, spacing |
| `src/config/teamColors.ts` | Per-team color overrides |
| `src/config/statCatalog.ts` | Section order, main vs expanded stats, glossary |
| `src/config/newsRules.ts` | What counts as big enough for the ticker |
| `src/config/fantasyPresets.ts` | Standard / half-PPR / PPR text and default scoring |
| `src/config/features.ts` | Switches for ticker, start/sit, export |
| `src/config/copy.ts` | Empty states, errors, onboarding lines |

## Data the screens are allowed to show

From ESPN, when the field exists:

- Scoreboard: score, clock, quarter, possession, red zone, team records
- Game summary: the box-score groups we listed, leaders, recent plays
- Team: record, roster, schedule, injuries, news
- Standings: division rank, wins, losses, points for and against

Fantasy search and the regular-season stat line on a roster pick also come from ESPN (search, athlete, and the player overview). There is no Sleeper call in v1.

If a number is missing, hide that row. Never write 0 just to fill the card.

## Where the v1 code lives

| Piece | Path |
| --- | --- |
| Home rule | `src/logic/focus.ts` (tests in `focus.test.ts`) |
| ESPN mapping | `src/data/espn.ts`, composed in `src/data/repository.ts` |
| Saved team, focus, fantasy | `src/state/AppState.tsx` |
| Load screen | `src/components/splash.tsx`, shown from `app/_layout.tsx` |
| Home, league, fantasy tabs | `app/(tabs)/` |
| Team and game pages | `app/team/[id].tsx`, `app/game/[id].tsx` |

## Build order

Done for v1:

1. Expo app, config files, theme, load screen
2. Provider + on-device cache, with a typed model that is not ESPN's raw JSON
3. Team picker, saved primary team
4. Home states, live strip, ticker
5. Expandable team digest
6. League list and team page
7. Fantasy: rules, custom sheet, punishments, roster, export
8. Settings, empty states, pull to refresh

Not done: a pass on a physical phone. The web bundle is the check that the project compiles. Layout is capped at phone width.

## Out of scope for the code

Do not scrape behind a login, do not bypass paywalls, and do not hammer the feeds. Refresh live games on a timer measured in tens of seconds, not a tight loop. Credit the sources in Settings.
