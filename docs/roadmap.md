# Roadmap (2026-09-26)

Status legend: ✅ done · 🔜 next · ⬜ not started

## Phase 1 — Motion system + Today redesign ✅ (uncommitted on `dev-branch`)

Done today:
- `src/lib/motion.ts`: one place for springs, easing, durations, list stagger variants, `haptic()`.
- `MotionProvider` (framer `reducedMotion="user"`) in `layout.tsx`.
- Route transitions with React `<ViewTransition>` in `Page`; `navType()` in `layout/nav.ts` decides forward/back; TabBar, Sidebar and in-page links pass `transitionTypes`. CSS in `globals.css` (`.nav-forward`, `.nav-back`, `.page-fade`).
- First-load entrance (`.page-enter`, `.content-enter`) only before the first client navigation (`<body data-navigated>` set by `NavigationWatcher`).
- Sticky page header: blurs, shrinks title, hides eyebrow on scroll.
- Today: time-of-day greeting, hero with gradient + slow sheen, `CountUp` numbers, message crossfade, stagger list entrance, ring arcs draw in one by one, ring pulses on perfect day.
- HabitCard: colour blooms from the tap point (`--x/--y` + clip-path), emoji wiggle, check pop + pulse ring, week dot pop, haptics on check/uncheck/perfect day.
- Tab bar: active icon bounce, plus button rotates on press.

Leftovers from phase 1:
- Undo toast progress bar (sonner has no built-in; skip or custom toast).
- Verify view transitions on a real phone (Safari behaves differently) and on browser back.

## Phase 2 — Polish other pages ✅ (uncommitted on `dev-branch`)

Done 2026-09-26:
- Habits: stagger entrance, drag lift (scale + shadow + tinted border), emoji tile morphs into the detail page header (`<ViewTransition name="habit-{id}" share="morph">`), forward/back `transitionTypes` on list, WeekGrid and back links.
- Habit detail: header/stats/calendar/notes stagger in, stat values roll when they change, calendar month slides on prev/next, day cells pop on tap and when done, current-streak tile highlighted.
- Insights: tiles use `CountUp`, cards stagger, whole content crossfades when the range changes, per-habit bars grow, heatmap fades in column by column, empty state has an animated mini bar chart.
- You: level card gradient + sheen, level and XP count up, XP bar fills, achievements stagger + 3D hover tilt + shine sweep, locked tiles grayscale/blur, theme toggle does a circular reveal from the click point (`src/lib/theme.ts`, also used by the command menu).
- Global level-up overlay (`components/layout/LevelUp.tsx`): burst + badge flip + confetti + haptic whenever the level rises.
- HabitSheet form sections stagger in; colour swatches scale; command menu results ripple in (CSS).

Leftovers from phase 2:
- Sparkline inside Insights tiles (needs per-tile series from `lib/insights.ts`).
- Achievement "newly unlocked" flip on the You page (needs unlock timestamps compared to last visit).
- Trend chart line-draw is Recharts default; a custom stroke-dash draw would look richer.

## Phase 3 — Categories + Templates 🔜
- `Habit.category` already exists in Prisma. Picker in HabitSheet (Health, Study, Work, Mind, Personal, Custom) with icon+colour; filter chips on Today/Habits (`layoutId` sliding active chip); Insights category breakdown.
- `src/lib/templates.ts`: 25–30 ready habits (emoji, colour, category, goal, type). "Start from template" grid at top of the new-habit sheet, pre-fills the form.

## Phase 4 — Numeric + Negative habits ⬜ (one migration)
- Prisma: `Habit.type` (`boolean|numeric|negative`, default boolean), `Habit.target Float?`, `Habit.unit String?`, `Check.value Float?`.
- Numeric: tap = +1 step (or long-press slider); auto-complete at target; ring segment partial fill; card shows `1.2 / 2 L`.
- Negative: day is "clean" by default; "Slipped" button logs a check-as-slip; streak = days clean; card shows "Day 12 clean"; slip resets with a calm (not red) animation.
- Update `lib/streak.ts`, `lib/insights.ts`, WeekGrid, calendar, XP.

## Phase 5 — Streak freeze ⬜
- Replace `Habit.streakShield Boolean` with `freezeTokens Int` + `FreezeLog(habitId, date)`.
- Earn 1 token per 7-day streak (max 2); auto-apply on a missed day; ice badge on card and calendar; streak calc treats frozen days as kept.

## Phase 6 — Mood / journal ⬜
- `MoodEntry(date unique, mood 1–5, note)`. "How was today?" 5-emoji row under the Today list.
- Insights: mood vs completion chart, per-habit correlation ("Gym days: mood +0.8").

## Phase 7 — Monthly / yearly review ⬜
- `/review/[period]` (2026-09 or 2026): completion %, best/worst habit, longest streak, mood avg, XP, category breakdown.
- Story-style swipeable slides; "Your September review is ready" card on Today on the 1st; share image (html-to-image + Web Share API).

## Phase 8 — Reminders + quick actions ⬜
- Web Push: VAPID keys, `PushSubscription` model, `sw.js` push + notificationclick handlers, "Mark done" action button that POSTs `/api/checks`.
- `/api/cron/reminders` (Vercel Cron every minute) matching `Habit.reminderTime`.
- Optional email digest via Resend; email field in Settings.
- "Widget" feel: per-habit manifest shortcuts, `/quick` one-tap page. Note: real home-screen widgets are not possible on the web; iOS push needs the PWA installed.

## Phase 9 — Social ⬜
- Step 1 (no accounts): streak / review share card PNG + Web Share.
- Step 2 (needs auth + hosted Postgres): accountability partner invite link, partner daily progress, nudges. Separate decision.

## How to resume
1. `git status` on `dev-branch`, run `npm run dev`, click through all four tabs, open a habit, switch theme on You.
2. Commit phases 1+2 (`feat(ui): motion system, view transitions and animated pages`).
3. Start Phase 3 (categories + templates). No schema change needed; begin in `HabitSheet.tsx` and `lib/templates.ts`.
