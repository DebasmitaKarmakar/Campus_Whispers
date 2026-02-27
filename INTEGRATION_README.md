# MicroHelp — Integration Guide

## Files in this patch

| File | Action |
|------|--------|
| `components/microhelp/MicroHelpDashboard.tsx` | **NEW** — Main MicroHelp component |
| `services/microHelpService.ts` | **NEW** — All data operations for MicroHelp |
| `types.ts` | **REPLACE** — Adds `MicroHelpPost`, `MicroHelpOffer`, `MicroHelpCategory`, `MicroHelpStatus` |
| `components/Dashboard.tsx` | **REPLACE** — Adds `microhelp` view + nav cards for all roles |
| `services/dbService.ts` | **REPLACE** — Seeds 2 pre-loaded MicroHelp posts on init |

## Steps

1. Drop all files into your project preserving the directory structure.
2. Run `npm run dev` — no new packages needed.

## Features

- **Students** can post anonymous or named help requests with supporting document + payment QR
- **Faculty & Admin** see real identity even for anonymous posts; get notified on new submissions
- **Admin & Faculty** can Approve / Reject / Delete — poster gets a notification for each action
- **Canteen** can browse the public board
- **2 pre-loaded posts** — old textbooks need and ATKT fee help
- Fully localStorage-based, matches your existing `dbService` pattern
