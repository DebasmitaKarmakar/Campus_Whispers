# CampusWhispers — NFSU

A student-built campus utility platform for National Forensic Sciences University. No backend, no server, no database setup required. All data lives in the browser's localStorage. Deploy by opening the HTML file.

---

## Architecture

**Zero-backend design.** The app runs entirely in the browser using React + Vite. All state is persisted in localStorage via `dbService`, a thin wrapper that mimics a relational database. A custom event (`cw_db_update`) keeps multiple tabs in sync.

There is no backend, no REST API, no cloud database. You do not need Node.js running in production. You do not need any server. You deploy the built `dist/` folder as a static site.

**If you do not use a real database:** this is fine. The app is designed for this exact case. localStorage is sufficient for a single-campus deployment with moderate usage. Data survives page refreshes and browser restarts. It is cleared when the user clears browser data.

**When you would need a backend:** if you want data shared across devices or browsers, real email OTP delivery, or persistent storage that survives browser clears, you would add a backend. The service layer (`dbService`, `canteenService`, `resourceService`, `opportunityService`) is designed so all storage calls go through one place, making a backend swap straightforward.

---

## Modules

### Authentication
Whitelist-based access. Accounts are pre-approved by an admin. Login uses a simulated TOTP flow. Device trust lasts 30 days. Four roles: `student`, `faculty`, `admin`, `canteen`.

### Grievance Portal
Students file grievances by category and priority. All registered users receive a notification when a new grievance is filed. Every user can upvote grievances to signal severity to administrators. Grievances are visible to all users, sorted by vote count. Admins can mark status and add responses.

### Notice Board
Admins and faculty post notices with priority levels (Normal, Important, Urgent). All campus users receive a notification on every new notice. Notices support audience targeting (all, students only, faculty only).

### Opportunities
Students and admins post opportunities with deadlines. All users receive a notification 24 hours before any active opportunity deadline. Duplicate opportunities (same title and deadline) are blocked at submission. Pending posts require admin approval before going live.

### Resources
Peer-upload of question papers and study notes. Duplicate detection is enforced: a paper for the same subject, semester, exam type, and branch cannot be uploaded twice. Uploads are archived rather than deleted.

### Canteen
Students place meal orders per slot (Breakfast, Lunch, Dinner). The canteen operator manages the live menu and marks orders as served. Duplicate menu items (same name and meal category) are blocked. Students are notified when their order is ready.

### Campus Directory
Static read-only directory of five registered campus organisations:

| Organisation | Contact |
|---|---|
| E-Cell NFSU | ecell@nfsu.ac.in |
| Central Library | library@nfsu.ac.in |
| NSS Unit | nss@nfsu.ac.in |
| Coding Club | coding@nfsu.ac.in |
| Literary Society | literary@nfsu.ac.in |

The directory is not editable via the UI. To update entries, edit `DIRECTORY_ENTRIES` in `components/directory/CampusDirectory.tsx`.

### Lost and Found
Students report lost or found items. Items can be claimed and matched. Sensitive items are flagged for admin-only visibility. Comments are supported for coordination.

### Skill Share (within Resources)
Students request academic or skill-based peer help. Other students can offer to assist. The requester is notified when a match is found.

### Faculty Verification
Faculty review and approve/reject event announcements, org details, and flagged content submitted for verification.

---

## Roles and Permissions

| Feature | Student | Faculty | Canteen | Admin |
|---|---|---|---|---|
| File grievance | Yes | Yes | Yes | No |
| View all grievances | Yes | Yes | Yes | Yes |
| Vote on grievance | Yes | Yes | Yes | Yes |
| Respond to grievance | No | No | No | Yes |
| Post notice | No | Yes | No | Yes |
| Post opportunity | Yes | No | No | Yes |
| Approve opportunity | No | No | No | Yes |
| Manage canteen menu | No | No | Yes | No |
| Place canteen order | Yes | No | No | No |
| Upload resource | Yes | Yes | No | No |
| View directory | Yes | Yes | Yes | Yes |
| Edit directory | No | No | No | No |
| Manage whitelist | No | No | No | Yes |

---

## Local Development

```
npm install
npm run dev
```

The app opens at `http://localhost:5173`. No environment variables required for local use.

For real email OTP, set `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY` in a `.env.local` file. Without these, the app uses a simulated OTP visible in the browser console.

---

## Build and Deploy

```
npm run build
```

Serve the `dist/` folder from any static host: GitHub Pages, Netlify, Vercel, or a plain Nginx/Apache server. No server-side processing is needed.

---

## Default Test Accounts

| Email | Role |
|---|---|
| ad@gmail.com | Admin |
| fac@gmail.com | Faculty |
| stu@gmail.com | Student |
| ct@gmail.com | Canteen |

Log in with any of these. When prompted for OTP, check the browser console for the simulated code.

---

## Data Reset

To clear all localStorage data and reset the app to its initial state: log in as admin, go to the Admin panel, and use the Data Reset option. Alternatively, run `localStorage.clear()` in the browser console and reload.

---

## Tech Stack

React 18, TypeScript, Tailwind CSS, Vite. No backend dependencies. No database. No cloud services required.
