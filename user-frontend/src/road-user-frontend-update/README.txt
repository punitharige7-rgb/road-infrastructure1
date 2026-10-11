ROAD INFRASTRUCTURE CARE — USER FRONTEND UPDATE

Included:
- src/App.jsx: replace your existing user-frontend/src/App.jsx
- src/style.css: replace your existing user-frontend/src/style.css (or merge styles if you have existing custom styles)
- public/images/: generated infrastructure-themed background images

Install:
1. Make a backup of your existing user-frontend/src/App.jsx and src/style.css.
2. Copy this package's src/App.jsx to user-frontend/src/App.jsx.
3. Copy this package's src/style.css to user-frontend/src/style.css.
4. Copy the public/images folder into user-frontend/public/images.
5. From the user-frontend folder, run npm run dev.
6. Open http://localhost:5173.

Pages: Home, Report, Track, Issue Map, My Complaints, About, and a separate detail page for each issue category.
API notes:
- Uses http://localhost:8081/api/tickets
- Report submission assumes POST /api/tickets accepts category, title, description, location, reporterName, reporterPhone, reporterEmail.
- Tracking first tries GET /api/tickets/{id}; if that route is unavailable, it searches tickets returned by GET /api/tickets.
- The map is a styled illustrative preview, not a live geospatial map. Live maps need coordinates and a map integration.
- Photo names are selected in the browser but not uploaded; persistent photo uploads require a backend endpoint.
- My Complaints currently displays all tickets returned by the API. Per-user filtering needs authentication/user identity in the backend.
