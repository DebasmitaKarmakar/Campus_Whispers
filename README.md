# CampusWhispers
### NFSU Students Portal

> A unified, identity-bound campus management portal for National Forensic Sciences University — built to bring every aspect of campus life into one secure, role-governed interface.

**Live:** [CampusWhispers | NFSU Students Portal](https://nfsu-students-portal.vercel.app)

---

## What is CampusWhispers?

CampusWhispers is a full-stack-style web application built entirely in the browser — no backend server required. It provides a single, coherent interface for students, faculty, canteen staff, and administrators to manage the daily operational and academic life of the campus. Every interaction is identity-bound: users can only access what their role permits, and every action is traceable.

The system uses a whitelist-based authentication model powered by TOTP (one-time passwords sent over email), meaning only pre-approved institutional members can log in. There are no open sign-ups.

---

## Modules

### Notice Board
Faculty and administrators can publish official campus notices with priority levels (Normal, Important, Urgent) and audience scoping (All Campus, Students Only, Faculty Only). Notices are visible to all eligible users immediately upon publication and can be archived when no longer relevant. Every new notice fires a campus-wide notification.

### Campus Directory
A live registry of all campus clubs, committees, cells, library resources, and services. Faculty can add, edit, enable, or disable entries. Students can browse, search by name or description, filter by organisation type, and access contact details and social links. The directory starts with two seed entries and grows entirely through the admin interface — nothing is hardcoded beyond the initial examples.

### Meal Registry (Canteen)
Students can browse the canteen menu by meal slot (Breakfast, Lunch, Dinner), place orders when the slot is open, and track order status in real time. Canteen staff manage the live order queue and mark orders as served — triggering an instant notification to the student. The admin panel provides a full audit view with feedback analytics. Both menu items and ordering windows are managed dynamically — no hardcoded data.

### Lost & Found
Students and staff can report lost items or post found items with category tagging, location, date-time, and optional photo evidence. Users can claim items with ownership proof. Every status change — someone marking your item as found, or submitting a claim — sends a direct notification to the relevant party. Sensitive categories (ID cards, wallets, electronics) are flagged for institutional review.

### Career Window (Opportunities)
Students and faculty can browse internships, placements, hackathons, and skill-building listings. Faculty and admins can post opportunities directly; student posts go through a verification queue. Admins can approve, reject, or expire listings. Each post includes mode (Online, Offline, Hybrid), deadline, description, and optional document or external links.

### Skill Share (Resources)
Two services in one. The first is a question paper and notes archive — students can upload and access past semester papers and notes, organised by year, semester, branch, and exam type, with duplicate detection via file hashing. The second is a peer help network where students can post help requests (academic or skill-based) and other students can offer to assist — matching triggers a notification to the requester.

### Grievance Portal
Students can file grievances across categories including academic, hostel, infrastructure, fees, and administration. Faculty and admins can view, respond to, categorize, and resolve submissions. Canteen staff have read access to complaints relevant to their area.

### Faculty Verification Panel
All content that requires institutional validation — events, coordinator claims, directory updates, and flagged posts — flows into this panel. Faculty can review each item, add a comment, and approve or reject. The panel tracks reviewer identity, decision, and timestamp on every action.

### Identity Governance (Admin)
Administrators manage the whitelist that controls who can log in and in what role. They can add new entries, disable accounts, and review a full audit log of all administrative actions taken across the portal.

### Notification System
A real-time notification bell visible on the dashboard header across all roles. Notifications are fired automatically by system events and are categorised by type. Users can mark individual notifications as read or clear all at once. Categories covered:

- Food Ready — when a canteen order is marked served
- New Notice — when faculty or admin publishes a notice
- Lost & Found Update — when someone acts on your post
- Skill Help — when someone offers to help with your request
- Event Declared — available for future event system integration

### Profile
Every user has an identity card with their role badge, numeric ID, department, profile photo, and preferred display name. Profile changes are persisted and reflected across the portal.

---

## Roles

| Role | Access Level |
|---|---|
| Student | Notice Board, Directory, Canteen Orders, Lost & Found, Opportunities, Skill Share, Grievances, Profile |
| Faculty | Notice Board (publish), Directory (manage), Verification Panel, Opportunity Review, Lost & Found Oversight, Grievance View, Profile |
| Canteen Staff | Order Queue Management, Menu Control, Notice Board, Lost & Found, Grievance View, Profile |
| Admin | Full access to all modules including Identity Governance, Canteen Audit, and Notice Board publishing |

---

## Authentication

Login uses a two-step TOTP flow:

1. User enters their institutional email address
2. System checks the whitelist — if the email is registered, a 6-digit one-time code is dispatched via EmailJS
3. User enters the code within the expiry window to complete login
4. Optionally, the device can be trusted for a period — skipping TOTP on future logins from the same browser

Sessions are stored in `sessionStorage` and expire on tab close. Cross-tab logout is synchronised automatically.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Email (TOTP) | EmailJS |
| Storage | Browser localStorage (no backend) |
| Deployment | Vercel / static hosting |

All data is stored in the browser's `localStorage` under namespaced keys. There is no external database or API server. This makes the application fully portable and self-contained — anyone can fork and deploy it with only an EmailJS account configured.

---

## Local Setup

```bash
# Clone the repository
git clone https://github.com/your-username/campuswhispers.git
cd campuswhispers

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Fill in your EmailJS Service ID, Template ID, and Public Key

# Start the development server
npm run dev
# Opens on http://localhost:3000
```

### Environment Variables

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

To set up EmailJS: create a free account at [emailjs.com](https://www.emailjs.com), connect an email service, and create a template with the variables `{{to_email}}`, `{{totp_code}}`, `{{user_name}}`, and `{{expires_in}}`. The free tier allows 200 emails per month.

---

## Demo Access

The following accounts are pre-loaded in the whitelist for evaluation. Log in with the email — the TOTP will be sent to that address, so use accounts you have access to, or add your own email to the whitelist via the Admin panel.

| Email | Role |
|---|---|
| `stu@gmail.com` | Student |
| `fac@gmail.com` | Faculty |
| `ct@gmail.com` | Canteen Staff |
| `ad@gmail.com` | Admin |

---

## Project Structure

```
campuswhispers/
├── components/
│   ├── admin/          — Identity governance panel
│   ├── canteen/        — Student, staff, and admin canteen views
│   ├── directory/      — Campus organisation registry
│   ├── faculty/        — Verification review panel
│   ├── grievance/      — Grievance filing and management
│   ├── lostfound/      — Lost and found reports
│   ├── noticeboard/    — Official notice publication
│   ├── notifications/  — Notification bell and feed
│   ├── opportunity/    — Career listings and opportunities
│   ├── profile/        — User identity card
│   └── resources/      — Question papers, notes, skill share
├── services/
│   ├── authService.ts  — Whitelist, TOTP, device trust
│   ├── canteenService.ts
│   ├── dbService.ts    — localStorage abstraction + notification helpers
│   ├── emailService.ts — EmailJS integration
│   ├── lostFoundService.ts
│   ├── opportunityService.ts
│   ├── profileService.ts
│   └── resourceService.ts
├── types.ts            — All shared TypeScript interfaces and enums
└── App.tsx             — Root component and session management
```

---

## Design Principles

**Identity-first.** Every action in the system is tied to a verified user. There are no anonymous operations except public notice viewing.

**Role isolation.** Each role sees exactly what it needs and nothing more. The routing, UI, and service layer all enforce this consistently.

**No hardcoding beyond examples.** All data — menu items, organisations, notices, opportunities — is managed through the interface and persisted dynamically. Seed data is kept to one or two entries purely for orientation.

**Notification as a first-class concern.** The system surfaces relevant events to users automatically — food ready, new notice, item found, help offered — without requiring them to poll or refresh.

---

## Built at NFSU

CampusWhispers was designed and built specifically for the student and faculty community of the National Forensic Sciences University. The portal reflects the institution's commitment to transparency, accountability, and institutional integrity in every interaction.

---

*Pull requests and issue reports are welcome. For access provisioning or deployment queries, contact the system administrator.*