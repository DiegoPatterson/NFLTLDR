# FootballTLDR — session log

Newest entries on top. The plan lives in [plan.md](./plan.md). Update that file when a decision changes. Use this file for what actually happened.

## 2026-09-21 — sideload APK

- Release APK built locally with `npm run apk` (`scripts/build-apk.ps1`). Output copied to `dist/FootballTLDR.apk` (about 97 MB). Package `com.diegopatterson.footballtldr`, versionCode 1.
- Signed with the debug keystore so it can be installed on a phone. That signature is not for the Play Store.
- The build needs JDK 21 (`%USERPROFILE%\jdks\jdk-21*`), not the system JDK 25. Build from the real project path. A short junction breaks the JS bundle because Metro sees two roots.

## 2026-09-21 — NFL rule sheet, no new tab

- One line at the top of League, "NFL rules / Most looked-up first." It is not a tab.
- The list lives in `src/config/nflRules.ts`, common flags first, rarer ones and overtime or replay after. Each row shows the usual result. Tap it for a short explanation. Wording is a reminder, not the league's book.


## 2026-09-21 — startup mark has no grass

- The startup was cropping `icon.png`, so the dark grass showed up as a rough cutout inside the team frame.
- `assets/images/mark.png` is the same football and gold ring with the grass made transparent. The startup uses that, so the club color shows through. The phone icon stays the full grass version.

## 2026-09-21 — phone icon, startup only

- Put the in-app header back. Home still shows the club logo, not the new badge.
- The installed icon is now a football on dark green with a gold ring: `assets/images/icon.png`, plus the Android adaptive icon, favicon, and native splash image.
- The in-app startup still frames that football in the followed club's colors. Expo Go itself keeps the Expo icon on the phone; this file shows up when the app is installed.


## 2026-09-21 — stale banner and gitignore

- Home treated any later scoreboard miss as "the feed did not answer," even when the board on screen was still good. The warning now shows only when that screen has no games, or when the scoreboard itself came back from an old save.
- League no longer raises that warning because standings failed, or because it fell back to the built-in club list.
- Scoreboard tries the CDN if the main feed is empty or down, and each request retries once.
- `.gitignore` now also skips env files, logs, installable build outputs, and the usual Windows junk. `node_modules`, `.expo`, and generated `ios`/`android` were already ignored.

## 2026-09-21 — live scoreboard polls every 5 seconds

- While a game is in progress, Home refreshes the scoreboard and that game's detail every 5 seconds (`liveRefreshMs` in `src/config/features.ts`). It does not reload the whole team digest on that timer. The pre-kickoff check stays at 60 seconds. The game page uses the same 5-second timer.

## 2026-09-21 — your-team block on Home follows the skin

- The club card, section titles, stat labels, next/last games, injuries, and division row were still using the turf green and gold type. Headings and the "your team" label now use the accent. Captions use a chalk tint instead of the green-gray.
- The identity card and the compact your-team card wear that club's two colors as a stripe, the same pair as the rest of the theme.

## 2026-09-21 — near-match search

- Player search ranks the current rosters with `src/logic/fuzzy.ts`, so a letter or two off still hits (Mahommes, Patrik Mahomes). The roster list is cached for 12 hours. If that list fails, an exact ESPN search is the backup.
- Team search uses the same scorer on the name, city, nickname, and abbreviation. "Cheifs" and "dolphines" match.

## 2026-09-21 — lineup, player pages, watch list

- The fantasy sheet only accepts active players, and it fills the spots from the custom rule sheet: QB, RB, WR, TE, flex, defense, kicker, bench. A full position refuses another add. Defenses are the 32 clubs, not players.
- Watch is its own tab. You can save extra teams and players there, separate from the club you follow and from the fantasy roster.
- Any player search opens a stat page. Inactive players can be read there, but not watched or rostered.
- Slot placement lives in `src/logic/lineup.ts`.

## 2026-09-21 — fantasy and scoreboard picked up the team skin

- Fantasy rules, the custom sheet, the punishment log, and the roster builder were still gold and turf. Headings, borders, search, points, and preset chips now use the team skin.
- The scoreboard's kickoff label, possession dot, down-and-distance line, and yard bar were still gold. Those follow the accent too.

## 2026-09-21 — Panthers more black

- Carolina was fielded on `#0085CA`, so the app read as blue. Field is now black. Carolina blue stays the accent and half the stripe.

## 2026-09-21 — both club colors, not one

- The skin was keeping whichever color passed a brightness check and dropping the other. Chargers stayed powder blue and never showed yellow. Dolphins stayed aqua and never showed orange. Ravens purple lost to a black "alternate," then the accent fell back to generic gold.
- Each team now has an explicit pair in `src/config/teamColors.ts`. `field` dyes the background. `accent` is the second color on the stripe, buttons, and labels. The stripe is an even split of the two real colors, not a thin hint.
- Ravens are purple and gold. Chargers are powder blue and yellow. Dolphins are aqua and orange.

## 2026-09-21 — team skin, not just an accent

- Team colors now dye the whole app. The darker club color is mixed into the background and cards. The brighter one is the accent on buttons, labels, the ticker, and the tab bar.
- The header shows that team's logo. Home is titled with the nickname (Bills, Rams, and so on). Other screens keep their title and put the nickname above it. A two-tone stripe sits under the header.
- The switch in Settings still turns all of this off.

## 2026-09-21 — scores, logos, team color switch, sideline notes

- The Puka Nacua line was the news ticker, not a score. Nothing was live yet (Giants at Rams was still scheduled). Inactive headlines are no longer treated as breaking news.
- Home now leads with the scoreboard even when nothing is live: next kickoff up top, final scores for the week under it, digest below. Within three hours of kickoff it polls so the card can flip to live on its own.
- Team marks use the ESPN 500px logo URL in `src/config/logos.ts`.
- Settings has a Team colors switch. On tints the header, tabs, and buttons. Off keeps the gold chrome. Default is on.
- Team pages and the digest get at most two "From the building" notes, preferring a coach or quote. If there isn't one, a single team headline. Betting writeups are dropped. Tap a note to read the sentence.

## 2026-09-21 — v1 built

- You picked the recommended v1, and a custom home rule: any live game can be in front; when your team's game comes on it takes the front once; tapping the strip swaps them and that choice sticks until your next game starts. That rule is `src/logic/focus.ts`.
- Expo SDK 57, TypeScript, not Flutter. Routes in `app/`. Editable copy and stats in `src/config/`.
- Data is ESPN's site web API, with the CDN scoreboard as a fallback. `site.api.espn.com` returned 403 here. Sleeper was not used. Odds in the payload are ignored.
- Mapped a real scoreboard (16 games) and a real box score through `mapEvent` / `mapSummary`. Focus tests passed. `tsc --noEmit` passed.
- On-device: primary team, focus memory, custom rules (starts on half-PPR), punishment log, roster. Export is a share sheet of that JSON.
- Leaders on a team page are last-game leaders, labeled that way. Season team rates are the offense and defense cards. Missing numbers are hidden.
- Web export bundled and statically rendered every route (home, league, fantasy and its four pages, team, game, onboarding, settings). Not clicked through on a phone.

## 2026-09-21 — proposal only, no app code

- Project folder had an empty `README.md` and nothing else.
- Did not scaffold the app. You asked to hear extra features before any building.
- Wrote the proposed plan in `docs/memories/plan.md`.
- Assumed NFL, Expo + TypeScript (not Flutter), on-device fantasy, ESPN public endpoints for scores and team data, Sleeper only as a cached player index for fantasy search.
- Recommended home rule, still unconfirmed: your team stays on Home unless your team is the one playing. Other live games are a strip, not a takeover.
- Recommended extras, still unconfirmed: team-color theme, stat glossary and one-line TLDRs, next-opponent injuries, schedule and standings, start/sit glance, cache and pull to refresh, export of house rules and punishments, settings to change team.
- Left for later on purpose: accounts, shared leagues, notifications, odds, college, AI recaps, widgets, trade calculator, highlights.
