# CampusWhispers — NFSU

A campus utility platform built for National Forensic Sciences University, Gandhinagar. CampusWhispers consolidates notice distribution, grievance tracking, canteen orders, academic resources, lost items, and more into a single interface — built by students, maintained by students.

No backend. No server. No cloud database. The entire app runs in the browser.

---

## Core Philosophy

The platform is built around one constraint: **zero infrastructure**. All data lives in the browser's `localStorage` via a thin service layer that mimics a relational database. A custom DOM event (`cw_db_update`) keeps multiple open tabs in sync. The build output is a static folder that deploys to any file host — GitHub Pages, Netlify, Vercel, or a plain web server.

This means data is per-device. If two students use different browsers or devices, they see different states. If a user clears browser storage, their data is gone. For a single campus kiosk or shared lab machine, this works perfectly. For cross-device sync, a backend swap is the natural next step — all storage calls funnel through `dbService`, so the migration surface is minimal.

---

## Getting Started

**Run locally:**
```
npm install
npm run dev
```
**online deployed:**
```
https://campus-whispers-eta.vercel.app/

**Build for production:**
```
npm run build
```
Serve the `dist/` folder from any static host. No server-side processing needed.

**Email OTP (optional):**
Without configuration, the app generates OTP codes and prints them to the browser console — sufficient for development and demos. For real email delivery, create a `.env.local` file:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## Test Accounts

| Email | Role |
|---|---|
| ad@gmail.com | Admin |
| fac@gmail.com | Faculty |
| stu@gmail.com | Student |
| ct@gmail.com | Canteen |

When prompted for OTP, check the browser console for the code. On first login from a new device, OTP is always required. Subsequent logins from the same browser skip OTP for 30 days via device trust.

---

## Authentication

**Whitelist-based access.** There are no open registrations. Every account must be pre-approved by an administrator. The whitelist is seeded with test accounts and managed live from the Admin panel.

**Login flow:**

1. User enters their email address.
2. The system checks the email against the whitelist.
3. If found, an OTP is generated (6-digit, expires in 10 minutes) and sent to the email. In development, it appears in the console.
4. User enters the OTP to complete login.
5. On success, the session is stored in `sessionStorage`. If the user chooses to trust the device, a trust record is stored in `localStorage` for 30 days — future logins from this browser skip OTP entirely.

**Roles:** `student`, `faculty`, `admin`, `canteen`. Each role has a distinct dashboard view and permission set.

**Session management:** Sessions are tab-scoped via `sessionStorage`. Closing all tabs ends the session. Logging out clears the session but does not revoke device trust (by design — the user explicitly trusted the device).

---

## Modules

### Notice Board

Admins and faculty can publish official notices visible to the campus community.

- Three priority levels: Normal, Important, Urgent — each with distinct visual styling
- Audience targeting: notices can be directed to all users, students only, or faculty only
- Optional attachment URL on each notice
- Every published notice triggers a campus-wide notification to all registered users
- Priority filter on the board view (All / Normal / Important / Urgent)
- Admins can archive notices to remove them from the active board without deleting them

---

### Grievance Portal

A transparent, community-driven issue reporting system.

- Students, faculty, and canteen staff can file grievances
- 13 categories: Academic, Hostel and Accommodation, Canteen and Food, Infrastructure and Maintenance, Library, Transport, Fee and Finance, Examination, Ragging and Harassment, Medical and Health, Sports and Facilities, Administrative, Other
- Four priority levels: Low, Medium, High, Urgent
- Optional anonymous submission — reporter identity is hidden from everyone including admins
- All grievances are visible to all users (not just the reporter)
- Any user can upvote a grievance to signal how broadly the issue is felt. Upvotes can be toggled on and off. The list is sorted by vote count, putting the most widely-felt issues at the top
- When a grievance is submitted, a notification goes out to all registered users on campus
- Admins can update status (Open, Under Review, Resolved, Rejected) and attach a written response
- Filters by category and status; a tab switcher between All Grievances and My Reports

---

### Opportunity Window

A verified listing of internships, placements, hackathons, competitions, and other opportunities.

- All users can browse active opportunities
- Students can submit new opportunities for admin review before they go live
- Admins can post opportunities directly (goes live immediately) or approve/reject pending student submissions
- When an opportunity goes live — either by direct admin post or admin approval — a notification is sent to all registered users
- A second notification goes out to all users 24 hours before any active opportunity's deadline as a reminder
- Duplicate prevention: an opportunity with the same title and deadline as an active or pending post is rejected
- Each listing shows mode (Online / Offline / Hybrid), deadline, description, optional document attachment, and official URL
- The URL field accepts any format: `www.example.com`, `https://`, plain domain names
- Tabs: Active, Pending (admin only), My Posts, Archived (expired and rejected)

---

### Academic Bank (Resources)

A peer-maintained repository of question papers and subject notes.

**Repository tab:**

- Upload question papers (End-Sem, Mid-Sem, CA1, CA2) or subject notes
- Uploads are organized by year, semester, branch, and subject
- The upload panel is inline — it reads year, semester, branch, subject, and exam type directly from the active filter bar, so there is no need to re-enter information. Only the contributor name and PDF file need to be provided
- Contributor name is pre-filled from the logged-in user's identity but can be edited before committing
- Duplicate prevention: a paper for the same subject, semester, exam type, and branch cannot be uploaded twice. Notes are not subject to this check
- Admins can archive individual entries to remove them from the public view without permanent deletion
- Filter by year, semester, exam type, branch, and subject

**Skill Share tab:**

- Students can post requests for academic or skill-based peer help
- Specify topic, help category (Academic or Skill-based), session type (Individual or Group), preferred time, and preferred location
- Other students can offer to help by responding to open requests
- The original requester is notified when someone offers to assist
- Admins can mark help sessions as Completed or Archived
- Separate sub-tab for skill offers: students can register themselves as available tutors or mentors for a subject, with a proficiency PDF attachment

---

### Canteen

A slot-based meal ordering system connecting students with the canteen operator.

**For students:**

- Place orders for Breakfast, Lunch, or Dinner during open slots
- Add items to a cart and submit an order
- Track order status: Pending, Served, Cancelled, Expired
- Cancel a pending order with a reason
- Edit items in a pending order before it is processed
- Receive a notification when the canteen operator marks an order as served
- Submit per-order feedback on taste, quantity, and hygiene (1–5 stars) after an order is served
- Submit general feedback by category: Service Speed, Staff Behavior, Pricing, Hygiene, Other

**For the canteen operator:**

- Toggle ordering open or closed independently for each meal slot
- Manage the live menu: add items with name, price, and meal category; toggle availability; delete items
- Duplicate menu items (same name and meal category) are blocked
- View the live order pipeline with real-time refresh
- Mark orders as Served or decline them with a reason
- Search orders by student name or order ID

**For admins:**

- View aggregate quality feedback scores across all categories
- Read general feedback submissions from students
- Monitor the order pipeline

---

### Lost and Found

A campus-wide item tracking board.

- Report a lost item: name, category (ID Card, Wallet, Electronics, Documents, Keys, Other), location, date and time, description, optional photo
- Report a found item: same fields, photo recommended
- Sensitive items can be flagged — these are shown with a Sensitive Item badge visible to all users
- Four tabs on the board: All, Lost, Found, My Posts. Search by title or description
- Community comment thread on each item for coordination between users
- Status transitions:
  - Lost item: a user who found it clicks Report Finding, provides current location and a photo
  - Item moves to Pending Handover — the finder uploads a verification proof image
  - Original reporter reviews the proof and clicks Verify and Close Case to mark it Collected
  - Found item: a user who owns it clicks Claim Ownership and describes identifying details
  - Similar handover and verification flow follows

---

### Campus Directory

A static, read-only listing of five official campus organisations.

| Organisation | Contact |
|---|---|
| E-Cell NFSU | ecell@nfsu.ac.in |
| Central Library | library@nfsu.ac.in |
| NSS Unit | nss@nfsu.ac.in |
| Coding Club | coding@nfsu.ac.in |
| Literary Society | literary@nfsu.ac.in |

Each entry shows a one-line description, contact email, and a link to the official website. The directory is not editable through the UI. To update entries, edit the `DIRECTORY_ENTRIES` array in `components/directory/CampusDirectory.tsx`.

---

### Profile

Each user has a personal identity page.

- Profile photo upload (stored as base64 in localStorage)
- Preferred display name — overrides the registered full name in all visible headers and avatars
- Current branch or department (editable)
- Institutional ID, account status, last login timestamp, and account creation date
- Activity summary showing contribution stats across modules:
  - Canteen: total orders placed, average feedback rating given, last order status
  - Lost and Found: items reported lost, items recovered, found reports filed
  - Opportunities: total posts submitted, approved live posts, pending validation count
  - Resources: question papers uploaded, peer help sessions completed, help requests created

---

### Notifications

A per-user notification inbox accessible via the bell icon in the navigation bar.

- Unread count badge (shows 9+ if more than nine unread)
- Notifications arrive for: new grievances filed campus-wide, new notices published, new opportunities going live, 24-hour opportunity deadline reminders, canteen order served, peer help match found
- Broadcast notifications (sent to all users) are tracked via a read-set in localStorage so each user's read state is independent
- Mark individual notifications as read on click
- Mark all as read in one action
- Notification categories are visually labelled: Food, Notice, Opportunity, Lost and Found, Skill Help, Grievance

---

### Faculty Review Panel

A dedicated review queue for faculty members.

- View all pending verification requests submitted by students or other users
- Request types: Event, Coordinator, Notice, Organisation Detail, Flagged Content
- Approve or reject each request with an optional comment
- Filter by status: All, Pending, Approved, Rejected
- Pending count badge on the module navigation

---

### Admin Panel

Full administrative control over the platform.

**Identity Governance (Whitelist Management):**

- View all registered users with their roles, institutional IDs, departments, and email addresses
- Filter by role (Admin, Faculty, Canteen, Student) or search by name, email, or ID
- Add new users to the whitelist with assigned role and institutional ID
- Remove users from the whitelist (with confirmation prompt)
- All additions and removals are logged with timestamp, admin identity, and action details
- Role count summary across all registered users
- Audit log tab showing full history of all admin actions

**Data Reset:**

- Full platform data reset from the admin panel, clearing all tables and returning to seed data
- Also accessible by running `localStorage.clear()` in the browser console and reloading

---

## Roles and Permissions

| Feature | Student | Faculty | Canteen | Admin |
|---|---|---|---|---|
| File grievance | Yes | Yes | Yes | No |
| View all grievances | Yes | Yes | Yes | Yes |
| Upvote grievances | Yes | Yes | Yes | Yes |
| Respond to grievance | No | No | No | Yes |
| Post notice | No | Yes | No | Yes |
| Archive notice | No | No | No | Yes |
| Post opportunity | Yes | No | No | Yes |
| Approve or reject opportunity | No | No | No | Yes |
| View pending opportunities | No | No | No | Yes |
| Upload academic resource | Yes | Yes | No | No |
| Archive resource | No | No | No | Yes |
| Request peer help | Yes | Yes | No | No |
| Offer peer help | Yes | Yes | No | No |
| Place canteen order | Yes | No | No | No |
| Manage canteen menu | No | No | Yes | No |
| Process canteen orders | No | No | Yes | No |
| Report lost or found item | Yes | Yes | Yes | Yes |
| View directory | Yes | Yes | Yes | Yes |
| Edit directory | No | No | No | No |
| Review verification requests | No | Yes | No | Yes |
| Manage whitelist | No | No | No | Yes |
| View admin audit log | No | No | No | Yes |
| Reset platform data | No | No | No | Yes |

---

## Tech Stack

React 18, TypeScript, Tailwind CSS, Vite.

No backend. No database. No cloud services required for core functionality. EmailJS is an optional integration for real OTP delivery.