# Palm92 Capture to Action

A software-first, local-first voice notebook pilot built around Palm92's principle: **AI investigates; humans decide.** This is an original Palm92 workflow inspired by the general capture-to-follow-through category. It does not copy Pocket's code, visual assets, branding or product design.

## Current pilot features

- Capture a title, project space and transcript or notes.
- Record audio from the browser microphone or attach an existing audio file.
- Save text and audio in this browser's IndexedDB, including offline use after the page has loaded once.
- Use browser speech recognition for dictation when supported. Dictation may be provided by the browser or device speech service. Review the transcript before saving.
- Search saved memories and filter by Personal, Palm92, Church, Learning or Career.
- Create transparent, rule-based summary and action suggestions from text.
- Require a human decision to approve or dismiss each proposed action. Approval adds it to the local action list only.
- Edit, play and delete memories. Export text, statuses and audit history as JSON.

## Run locally

Open `index.html` directly for text capture. Microphone recording requires a secure context, such as `localhost` or HTTPS. From the repository root:

```bash
npm install
npm run dev
```

Then open `/pilots/capture-to-action/` in the Vite app server. The files are under `public/`, so the existing GitHub Pages build includes them automatically at the same path after the feature branch is merged and published.

## Verification

Run the local logic checks:

```bash
node public/pilots/capture-to-action/test_app.cjs
```

## Data and privacy boundary

- The pilot has no account system, backend, cloud sync or remote AI calls.
- Memory text and audio are stored in the browser profile on the current device. Clearing browser data can remove them. Use **Export notes** for a text backup; audio is excluded from JSON and must be downloaded separately if needed.
- Browser dictation may use the browser or operating system's speech service. Do not dictate confidential or sensitive information unless that service is approved for the information.
- Do not record work, NHS, church, children or other people's sensitive conversations without the required permission and applicable organisational approval.
- Proposed summaries and actions are simple local rules, not AI-generated conclusions. Review and correct them. Approved tasks are not sent to calendars, email or task apps.

## Next development steps

1. Validate Android browser recording and offline behaviour on Faith's Samsung device.
2. Add optional, user-selected transcription and model providers with explicit data-flow disclosure.
3. Add authenticated sync and export/delete controls only after a privacy and security design review.
4. Add integrations behind a preview-and-approve gate.
5. Prepare a public pilot with a retention policy, consent flow, threat model and accessible install path.

This folder is a working personal-use prototype. It is not a production service or a substitute for organisational privacy approval.
