# ShareCompass

ShareCompass is a responsive React app for discovering established nonprofit organizations by cause, location, urgency, and preferred way of helping. Its warm field-guide interface deliberately avoids the generic bright-card dashboard look common in generated prototypes.

## What works

- Firebase email/password authentication
- Firestore-backed onboarding preferences, follows, newsletter choice, and demo pledges
- A searchable catalog of 79 established organizations, including 66 newly added entries
- Cause, giving-mode, reach, and urgency filters
- Personalized matching with plain-language reasons
- Official organization website handoff for real donations and volunteering
- Password-reset email, sign-out, responsive mobile layout, and accessible keyboard focus
- Session-safe demo flow for the clearly labeled illustrative community request

ShareCompass never collects card details for real organizations. The **Visit & give** action opens the organization's listed official website in a new tab.

## Run locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` if you move the app to a different Firebase project. The included Firebase project configuration is a public client configuration; access control must come from Authentication and the included `firestore.rules`.

## Quality checks

```bash
npm test
npm run build
npm run lint
```

## Firebase deployment note

Deploy `firestore.rules` before using production data. Each signed-in user may read and write only their own `users/{uid}` document.
