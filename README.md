<p align="center"><img src="docs/brand/sharecompass.svg" alt="ShareCompass compass mark" width="120"></p>

# ShareCompass

A web app for finding nonprofit organizations and people to volunteer with. Choose the causes you care about, explore organizations, and follow their official websites when you are ready to help.

This repository contains the current **React web implementation**, not the original Flutter app.

## What you can do

- Search a catalog of 79 established organizations.
- Filter by cause, giving mode, reach and urgency.
- See matching reasons based on onboarding preferences.
- Follow organizations and save preferences to your account.
- Discover public volunteer profiles through Helping Pair and send or respond to connection requests.
- Search U.S. cities by state.
- Sign up, sign in, reset a password and sign out.
- Switch between light and dark appearance.

Real donations and volunteering are handled on organizations' official websites. ShareCompass does not collect payment-card details. The illustrative community request saves a demo pledge; it does not transfer money. Newsletter choice is stored as a preference, not a claim that an email-delivery service is running.

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
