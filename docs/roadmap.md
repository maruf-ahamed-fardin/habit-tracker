# Habit Tracker Roadmap (2026-09-29)

Status legend: 🔜 next up · ⏳ in progress · ⬜ planned

---

## Phase 1 — Quick Wins: Data Safety, Organization & Archiving 🔜

### 1.1 Data Backup Import / Restore
- **Problem**: Settings has "Export CSV" and "Export JSON", but zero way to restore data if switching devices, clearing cache, or testing reset.
- **Implementation**:
  - Add "Import backup (.json)" file uploader to [src/app/you/page.tsx](file:///c:/my-github/habit%20tracker/src/app/you/page.tsx).
  - Add `/api/backup/restore` endpoint to validate JSON schema and batch upsert habits, checks, notes, and achievements.
  - Client store reload with preview of restored counts (e.g. "Restoring 6 habits, 142 checks").

### 1.2 Category Organization & Filtering
- **Schema**: `Habit.category` already exists in [prisma/schema.prisma](file:///c:/my-github/habit%20tracker/prisma/schema.prisma) (`personal`, `health`, `work`, `mind`, `finance`, `fitness`).
- **HabitSheet**: Add visual category picker (icon + accent color badge) in [HabitSheet.tsx](file:///c:/my-github/habit%20tracker/src/components/habits/HabitSheet.tsx).
- **Today & Habits Pages**:
  - Filter chips at the top of Today and Habits lists (`All`, `Health`, `Work`, etc.) with animated sliding active pill (`layoutId="category-filter"`).
- **Insights**: Category balance donut chart / breakdown showing completion rate by life domain.

### 1.3 Habit Archiving & Pausing (Soft Deletion)
- **Problem**: Deleting a habit permanently cascades and destroys all historical checks, streaks, and heatmap data.
- **Implementation**:
  - Add `isArchived Boolean @default(false)` to `Habit` model.
  - Allow "Archive habit" in habit settings/actions.
  - Archived habits are hidden from Today checklist and active list, but preserved in heatmap, insights history, and can be unarchived anytime from an "Archived" drawer.

### 1.4 Curated Template Library
- **Implementation**:
  - Create `src/lib/templates.ts` with 25+ curated habits categorized by routine:
    - *Morning*: Hydrate (💧), Make bed (🛏️), Sunlight (🌅), Meditation (🧘)
    - *Health & Fitness*: 10k Steps (🚶), Gym workout (💪), Stretch (🤸), Cook whole meal (🥗)
    - *Mind & Focus*: Deep work 90m (⚡), Read 20 pages (📚), Journal (✍️), Screen detox (📵)
    - *Evening*: Floss (🦷), Review day (📝), Sleep by 11pm (😴)
  - "Start from template" button & horizontal carousel in `HabitSheet.tsx` that pre-populates name, emoji, category, frequency, and recommended color in one tap.

---

## Phase 2 — Advanced Habit Engine: Numeric, Negative & Specific Schedules ⬜

### 2.1 Specific Day-of-Week Scheduling
- **Problem**: A 3x/week gym habit (Mon/Wed/Fri) currently shows up on Tuesday as due, causing false guilt.
- **Implementation**:
  - Add `scheduledDays String?` (JSON array or bitmask, e.g. `["mon","wed","fri"]`) to `Habit`.
  - Today checklist dynamically groups habits:
    - **Due Today**: Scheduled for today or flexible daily.
    - **Rest Day**: Not scheduled for today (can still check off if desired, but doesn't penalize perfect day).

### 2.2 Numeric & Measurable Habits
- **Schema Migration**:
  - `Habit.type String @default("boolean")` (`"boolean"` | `"numeric"` | `"negative"`).
  - `Habit.target Float?` (e.g. `2000`, `30`, `10000`).
  - `Habit.unit String?` (e.g. `ml`, `pages`, `steps`, `mins`).
  - `Habit.step Float?` (e.g. `250`, `5`, `1000`).
  - `Check.value Float?` (current logged progress).
- **UI / Interaction**:
  - HabitCard stepper: quick `+` button increments by `step` (or long press for custom number input).
  - HabitCard shows progress bar & text: `1,500 / 2,000 ml`.
  - Segmented ring supports fractional segment fill (e.g., 75% filled segment).
  - Auto-marks completed when `value >= target`.

### 2.3 Negative / Break-a-Habit Tracking
- **Concept**: For bad habits ("No Smoking", "No Alcohol", "No Sugar", "No Late-night Gaming").
- **Mechanics**:
  - Days are **clean by default** (automatic success unless a slip is logged).
  - Card displays "14 days clean" with calm milestone badges.
  - Action button: "Log Slip-up" (logs check as slip with calm, non-punitive animation and optional reflection note).
  - Streak represents consecutive clean days.

### 2.4 Built-in Timers (Duration Habits)
- Quick countdown / stopwatch overlay for time-based habits (e.g. 15-minute meditation or 25-minute study).
- Automatically marks habit as complete upon timer finish with gentle chime.

---

## Phase 3 — Streak Protection & Freeze System ⬜

### 3.1 Streak Freeze Tokens
- **Problem**: Life events (illness, flights, emergencies) wipe out hard-earned 60+ day streaks and demotivate users.
- **Implementation**:
  - Add `freezeTokens Int @default(1)` to `Settings`.
  - Add `FreezeLog(id, habitId, date)` table.
  - Earn 1 freeze token every 7 consecutive days of tracking (capped at 2 or 3).
  - **Auto-freeze**: If a user misses a day, consume 1 token to freeze the streak instead of resetting to 0.
  - Ice badge (`❄️ Frozen`) displayed on HabitCard and Month Calendar.
  - Update `lib/streak.ts` to treat frozen dates as continuous streak links.

---

## Phase 4 — Functional Reminders & Notifications ⬜

### 4.1 Web Notification & Push Integration
- **Problem**: `Habit.reminderTime` is saved in the database but never triggers any notifications.
- **Implementation**:
  - Request browser Notification permissions (`Notification.requestPermission()`).
  - Web Push service worker integration in [public/sw.js](file:///c:/my-github/habit%20tracker/public/sw.js) for push events and notification clicks.
  - Direct action buttons on push notifications: `[Mark Done]` button that immediately registers the check-in without full page navigation.
  - Local scheduled notifications (when app is open/installed PWA) and Vercel Cron `/api/cron/reminders` for push dispatch.

---

## Phase 5 — Daily Mood, Journaling & Habit Correlation ⬜

### 5.1 Daily Mood Check-in
- **Schema**: `MoodEntry(id, date String @unique, score Int, note String?, createdAt DateTime)`.
- **Today Page**: Subtle "How was your day?" 5-emoji row (😭 🙁 😐 🙂 🤩) under the checklist.
- Instant feedback and XP reward for daily reflection.

### 5.2 Insights: Mood vs. Habit Correlation Engine
- Calculate impact of individual habits on daily mood:
  - *"On days you complete 'Workout', your mood is +0.8 points higher."*
  - Scatter / correlation chart showing completion percentage vs. reported mood.
  - Consolidated daily journal view showing notes across all habits + mood on any past day.

---

## Phase 6 — Review Stories, Milestones & Social Sharing ⬜

### 6.1 Monthly & Yearly Wrap-ups (`/review/[period]`)
- Story-style swipeable summary (Spotify Wrapped style):
  - Total check-ins, top 3 habits, longest streak, XP gained, most consistent weekday.
  - "Your September review is ready" banner on the 1st of each month.

### 6.2 Milestone Share Cards
- High-res image generation via `html-to-image` or canvas for 7/30/100-day streaks and perfect weeks.
- Native `navigator.share()` API integration for Instagram stories, WhatsApp, or Twitter.

---

## Phase 7 — Offline Queue & Cloud Persistence ⬜

### 7.1 Offline First Sync Queue
- IndexedDB / localStorage queue for check-ins made while offline.
- Background sync via service worker when network reconnects, preventing "Couldn't save change" errors.

### 7.2 Cloud Database Adapter (Production Ready)
- Support Turso (libSQL) / Supabase / Postgres so data persists reliably on Vercel/serverless deployments without local SQLite ephemeral wipe.
- Optional multi-device user accounts (NextAuth / Supabase Auth) for cross-device sync.

---

## Immediate Next Step:
👉 **Start Phase 1**:
1. Add JSON Backup Import in [src/app/you/page.tsx](file:///c:/my-github/habit%20tracker/src/app/you/page.tsx).
2. Wire up category picker in [HabitSheet.tsx](file:///c:/my-github/habit%20tracker/src/components/habits/HabitSheet.tsx) + Category filter chips on Today & Habits pages.
3. Add `isArchived` soft delete to Prisma schema.

