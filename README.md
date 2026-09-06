# Dana’s Tutoring — GitHub Pages prototype

Static React/Vite website for the assessment. No server or database is required. Sample bookings are saved only in the current browser's localStorage; parent and student names and email addresses are neither stored nor submitted. Tutor profiles, photos, rates, and availability are samples.

## Deploy

1. In this GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to `main`. The **Deploy tutoring prototype to GitHub Pages** workflow builds `project_files` and deploys its `dist` folder.
4. Open the URL shown by the successful workflow and check the tutor photos and booking demo before submitting.

Expected URL for this repository: https://peterupskill.github.io/PeterUpskill/

For a private repository, Pages requires a GitHub plan supporting private-repository Pages. Do not change repository visibility without reviewing its contents.

## PostHog telemetry

Edit `project_files/public/posthog-config.js` and enter the public project token (`phc_...`) plus your ingestion host. US: `https://us.i.posthog.com`; EU: `https://eu.i.posthog.com`. Commit and push. Never put a personal API key in this file.

The browser sends page_viewed, subject_filtered, booking_started, time_selected, and booking_completed events directly to PostHog. No form values, session replay, advertising, or person profiles. An empty token disables delivery. The old server environment variables are not used by this static build.

## Local preview

```
cd project_files
npm ci
npm run build
npm run preview
```

GitHub Actions installs dependencies; do not commit node_modules or dist. The retained `app/api` and `db` files belong to the earlier server prototype and are not included in the static build.
