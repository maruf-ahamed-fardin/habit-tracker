# Habit Tracker

A gamified habit tracker built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Prisma ORM with SQLite**.

---

## ✨ Features

- **Today**: one tap checks a habit off. Cards fill with the habit’s color, a segmented ring shows what’s left, and every check-in has an Undo.
- **Weekly goals that respect rest days**: “3× a week” habits count streaks in weeks, so planned rest days never break them.
- **Insights**: completion trend (7/30/90 days), strongest and weakest weekdays, per-habit progress against its goal, and a 12-week heatmap.
- **Habits**: drag to reorder, and a page per habit with a month calendar for fixing past days, stats and daily notes.
- **You**: level and XP (calculated from your check-ins, so it never resets), 20 achievements, theme (light, dark or system), sound (off by default), install as an app, export to CSV/JSON.
- **Keyboard and command menu**: `1`–`9` to check off, `N` for a new habit, `Ctrl/⌘ K` to search everything.
- **Works on every screen**: bottom tab bar on phones, sidebar on desktop, installable PWA.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/) + [shadcn/ui](https://ui.shadcn.com/) (Radix)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [canvas-confetti](https://github.com/catdad/canvas-confetti)
- **Charts**: [Recharts](https://recharts.org/)
- **Database & ORM**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up the Database

```bash
npx prisma generate
npx prisma db push
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `1` – `9` | Check off habit #1 through #9 for today |
| `N` | New habit |
| `Ctrl` / `⌘` + `K` | Search habits, pages and actions |
| `?` | Show keyboard shortcuts |

---

## 📜 Scripts

- `npm run dev`: Start Next.js development server
- `npm run build`: Generate Prisma client and build production bundle
- `npm run start`: Start production server
- `npm run lint`: Run ESLint checks
- `npm run db:push`: Push Prisma schema to SQLite database
- `npm run db:studio`: Launch Prisma Studio database GUI
