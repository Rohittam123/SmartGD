# Smart GD

Smart GD is a React + Firebase application designed to support group discussion practice with real-time rooms, mentor guidance, leaderboards, and notifications.

## Project structure

- `frontend/` — React application built with Vite, Tailwind CSS, React Router, Firebase, and Framer Motion.
- `functions/` — serverless function helpers and AI integration code.

## Getting started

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Configure Firebase and environment variables in `frontend/.env` or `firebase.json` as appropriate.

Usernames are case-insensitive, unique, and immutable after being claimed. Authenticated users can search usernames and view public profile details and performance metrics.

Profile photos are uploaded to Cloudinary using the unsigned upload preset configured by `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` in `frontend/.env`. Configure the preset to accept images only and set its upload size limit to 2 MB. The upload preset name is public configuration; never put a Cloudinary API secret in the frontend.

Deploy the Firestore rules before enabling registration or username search:

```bash
firebase deploy --only firestore:rules --project smart-gd-02
```

## Available scripts

- `npm run dev` — start Vite dev server
- `npm run build` — build production assets
- `npm run preview` — preview a production build locally
- `npm run lint` — run ESLint against `src`

## Notes

- The app uses Firebase Authentication, Firestore, and Realtime listeners for rooms, notifications, and leaderboard updates.
- The `frontend/src/utils/seedData.js` file provides seed content for landing pages and practice recommendations.
