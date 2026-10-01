<p align="center"><img src="docs/brand/sharecompass.svg" alt="ShareCompass compass mark" width="120"></p>

# ShareCompass

A place to find causes you care about and people to volunteer with.

ShareCompass starts with a simple question: where can I actually help? Explore nonprofit organizations, narrow the list by your interests and follow their official sites to take the next step. Helping Pair adds a social side, so volunteering does not have to start alone.

This repository contains the React web version. The original project was a Flutter app.

[Try ShareCompass](https://oluchi-muoguilim.superct3663.chatgpt.site/demos/sharecompass/) without creating an account. Search causes, follow organizations, edit preferences and try both themes. Changes stay in your browser; Reset clears them. Helping Pair connections require an account and are unavailable in this demo.

## Explore the app

- **Find a cause:** search 79 organizations and filter by cause, giving mode, reach and urgency.
- **Understand your matches:** see why an organization fits your onboarding preferences.
- **Keep your favorites:** follow organizations, open your Following list from Profile, and unfollow whenever you want.
- **Find someone to help with:** opt into Helping Pair, discover public volunteer profiles and send or respond to connection requests. Manage pending invitations and accepted connections in the connection inbox.
- **Choose your location:** search U.S. cities by state.
- **Make it yours:** switch between light and dark appearance and manage your profile visibility.

## A few things to try

1. **Pick two different causes.** Explore interests such as education and the environment, then read the matching explanations.
2. **Narrow your search.** Combine a cause with another filter and see which organizations remain.
3. **Find one organization you would actually help.** Follow it, then visit its official website for current opportunities.
4. **Try Helping Pair with two test accounts in your own Firebase project.** Make both discoverable, send a connection request and accept it from the other account.
5. **Go private again.** Turn discovery off and check that your profile disappears from the other account's discovery view.

## Helping Pair privacy

Helping Pair keeps private account details separate from discoverable profiles. Opting into discovery shares a smaller profile, not the entire account document. The recipient decides whether to accept a connection request.

## Donations and sample requests

Donations and volunteering happen on organizations' official websites. ShareCompass does not process payments. The example community request lets you save a sample pledge, and the newsletter toggle stores a preference; neither sends money or starts an email subscription.

## Built with

React 19, Vite 7, Firebase Authentication, Cloud Firestore and Lucide icons. Vitest covers selected organization, city-search and privacy behavior.

## Run locally

Use Node.js 22.12 or newer and npm.

```sh
git clone https://github.com/omuoguilim/ShareCompass.git
cd ShareCompass
npm ci
cp .env.example .env
npm run dev
```

Fill the `VITE_FIREBASE_*` variables in `.env` with the client configuration for your own Firebase project. Enable email/password authentication, create a Firestore database and configure the appropriate authorized domains. Deploy the included `firestore.rules` before using account data.

The source includes fallback Firebase client configuration. Client configuration is public; it does not replace database authorization. Use your own project for development instead of writing test accounts into someone else's database.

## Checks and build

```sh
npm test
npm run lint
npm run build
npm run preview
```

To build the isolated portfolio version:

```sh
VITE_PORTFOLIO_DEMO=true npm run build -- --base=/demos/sharecompass/
```

Account mode uses Firebase Authentication and Firestore. Private preferences and the smaller discoverable profile are committed together; failed writes show an error instead of claiming success. Account data is loaded from Firestore, and demo preferences stay in separate browser storage. Passwords are never saved in profile documents.

The production frontend is generated in `dist/`. Firebase setup and rules deployment are separate from the frontend build.

## Privacy model

Accounts start private. Account documents under `users/{uid}` are owner-only. Opting into discovery creates a separate `publicProfiles/{uid}` document with display name, general location, causes and helping preferences. Email and phone details are not copied into that public document. Signed-in members can read discoverable profiles.

Turning discovery off removes the public profile. Connection records are limited to their two participants, and only the recipient can accept or decline a pending request.

## Code map

| File | Purpose |
| --- | --- |
| `App.jsx`, `AuthScreen.jsx` | Authentication and application entry |
| `ShareCompass.jsx` | Onboarding, discovery and main screens |
| `organizations.js` | Organization catalog and related helpers |
| `usCities.js` | U.S. city data |
| `useProfile.js` | Account preferences |
| `useCommunity.js` | Public profiles and connections |
| `firestore.rules` | Database access rules |

## Current boundaries

The organization catalog is maintained in the repository, not a live feed of every organization's opportunities. Confirm availability on the official site. Location matches do not establish a person's identity or vet a volunteering arrangement.

The compass mark in this README reuses the app's Lucide Compass icon. See [icon attribution](docs/brand/ATTRIBUTION.md).


## Worldwide directory and photographs

The October 1, 2026 expansion adds 500 distinct organizations with listed projects in 111 countries, including 49 with projects in Nigeria. Existing organizations and their IDs are retained. New entries come from GlobalGiving public project search results; each links to a project and organization profile. `directory-sources.json` records the snapshot, selection method and country counts.

Country matching uses countries with listed projects, rather than an organization's headquarters. Your country comes first in worldwide results. The Country filter includes only confirmed country coverage; the City filter requires explicit city coverage. Find Help starts with your country and provides a Worldwide option. A listed project does not guarantee current service eligibility or an available volunteer place.

The added projects list Money as a supported contribution because they have fundraising pages. Other contribution types are not inferred. Lists initially render 24 organizations and can load more. New string IDs work with the existing follow/unfollow persistence.

Cause cards use real, credited photographs rather than website screenshots. Photos illustrate the cause and do not claim to show every listed organization. Creator, source and license details are available at `public/credits.html` and `public/causes/credits.json`.

**Pledged** totals saved sample pledges in USD. It records intentions and does not confirm donations, process payments, or receive receipts from charity websites. Following an organization or opening a giving page does not increase this total.

