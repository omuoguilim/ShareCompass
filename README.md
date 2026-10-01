<p align="center"><img src="docs/brand/sharecompass.svg" alt="ShareCompass compass mark" width="120"></p>

# ShareCompass

I built ShareCompass around a question I kept coming back to: where can I actually help? I wanted one place to explore causes, keep track of organizations and find people interested in helping too.

This repository contains my React web app. My original project was a Flutter app.

[Try ShareCompass](https://oluchi-muoguilim.superct3663.chatgpt.site/demos/sharecompass/)

## What’s in the app

- Organization search with filters for cause, contribution type, reach and urgency.
- Matching explanations based on the interests selected during onboarding.
- Following lists with links to organization pages and an unfollow option.
- Country preferences and U.S. city search.
- Light/dark themes and profile privacy controls.
- Helping Pair discovery, connection requests and an inbox for pending and accepted connections in account mode.

I keep the portfolio demo separate from account mode. Its preferences and follows stay in browser storage; Reset clears them. Helping Pair requires an account and is unavailable in the isolated demo.

## The directory

The catalog contains 579 entries, including one sample community request. I added 500 distinct organizations from public GlobalGiving project listings on October 1, 2026, covering projects in 111 countries, including 49 organizations with listed projects in Nigeria. I kept the existing entries and IDs.

I match countries using listed project locations rather than headquarters. Country results require confirmed country coverage; city results require explicit city coverage. Worldwide results put the selected country first. I only mark the added fundraising projects as supporting money contributions, rather than guessing whether they accept goods or volunteers.

The catalog is a stored snapshot, not a live availability feed. I link to the official organization or project page for current details. My sources and selection method are in [directory-sources.json](directory-sources.json).

I only show an organization photo when I have an image for that organization or its initiative. Otherwise, I leave the photo out. The cause picker has separately credited photographs in [public/credits.html](public/credits.html).

## A few things I like to test

I switch between two causes to compare the matching explanations, set a country to check the directory filters, and follow an organization before reopening the Following list and unfollowing it. For Helping Pair, I use two test accounts to check invitations, acceptance and discovery privacy.

## Pledges and privacy

I don’t process donations in ShareCompass. Giving takes place on external organization websites. **Pledged** adds saved sample intentions in USD; it does not verify payments or track money donated elsewhere. The newsletter control saves a preference and does not start an email subscription.

Accounts start private. I keep account details in owner-only `users/{uid}` documents. Opting into discovery creates a smaller `publicProfiles/{uid}` document with a display name, general location, causes and helping preferences, without email or phone details. Turning discovery off removes that profile.

Connection records are limited to their participants. Only the recipient can accept or decline a pending invitation. I commit private preferences and discoverable profiles together and show an error when a write fails.

## Run locally

I use Node.js 22.12 or newer.

```sh
git clone https://github.com/omuoguilim/ShareCompass.git
cd ShareCompass
npm ci
cp .env.example .env
npm run dev
```

I fill the `VITE_FIREBASE_*` variables with my development Firebase client configuration, enable email/password authentication, configure authorized domains and deploy `firestore.rules` before using account data. Client configuration alone does not authorize database access.

```sh
npm test
npm run lint
npm run build
npm run preview
```

For the isolated demo:

```sh
VITE_PORTFOLIO_DEMO=true npm run build -- --base=/demos/sharecompass/
```

## Code map

| File | Role |
| --- | --- |
| `App.jsx`, `AuthScreen.jsx` | Entry point and authentication |
| `ShareCompass.jsx` | Onboarding and app screens |
| `organizations.js`, `globalOrganizations.json` | Directory |
| `discovery.js` | Location filtering and ranking |
| `useProfile.js` | Account preferences |
| `useCommunity.js` | Discovery and connections |
| `firestore.rules` | Database permissions |

I use React 19, Vite 7, Firebase Authentication, Firestore, Lucide icons and Vitest. Automated tests cover selected directory, privacy, storage and following behavior. End-to-end Firebase testing remains part of my release work.

The compass mark uses the app’s Lucide Compass icon; [attribution](docs/brand/ATTRIBUTION.md) is included.
