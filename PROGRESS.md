# 🪐 Life OS — Project Summary

## Project Overview
**Life OS** is an AI-powered creative workspace built with Next.js, Tailwind CSS, Zustand, Tiptap, and Groq AI. It's a personalized space where users can study, plan, create, and remember — all in one place with a fully customizable canvas UI.

---

## Tech Stack
- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **State Management:** Zustand
- **AI:** Groq API (llama-3.3-70b-versatile)
- **Rich Text:** Tiptap
- **Animations:** Framer Motion
- **Auth:** Local auth (localStorage) with Supabase ready
- **Icons:** Lucide React

---

## Project Structure
```
life-os/
├── app/
│   ├── api/ai/
│   │   ├── notes/         # AI note generation
│   │   ├── braindump/     # Brain dump organizer
│   │   ├── flashcards/    # Flashcard generator
│   │   ├── quiz/          # Quiz + flashcard levels
│   │   ├── mindmap/       # Mind map generator
│   │   ├── mindmap-expand/ # Node expansion
│   │   ├── define/        # Node definition
│   │   ├── interview/     # Interview prep + ratings
│   │   ├── skillgap/      # Skill gap analyzer
│   │   ├── email/         # Cold email/DM generator
│   │   ├── resume/        # Resume builder
│   │   ├── journal/       # Memory journal AI
│   │   └── gratitude/     # Gratitude prompts
│   ├── auth/              # Login/Signup page
│   ├── canvas/            # Main home (canvas as home)
│   ├── dashboard/         # Old dashboard (redirects to canvas)
│   └── study/             # Study page (standalone)
├── components/
│   ├── canvas/
│   │   ├── BackgroundPicker.tsx
│   │   ├── CustomStickerUploader.tsx
│   │   ├── DraggableSticker.tsx
│   │   ├── FloatingDock.tsx       # Left dock with planet + modes
│   │   ├── IconPicker.tsx
│   │   ├── SidePanel.tsx          # Sliding panel for all modes
│   │   ├── StickerPanel.tsx
│   │   ├── ThemeManager.tsx
│   │   ├── Toolbar.tsx
│   │   └── WelcomeScreen.tsx
│   ├── widgets/
│   │   ├── DraggableWidget.tsx    # Draggable + resizable
│   │   ├── NotesWidget.tsx        # Rich text + draw + multi-page
│   │   ├── TimerWidget.tsx        # Pomodoro timer
│   │   └── TrackerWidget.tsx      # Tasks + calendar + timetable + stats
│   ├── study/
│   │   ├── AINotes.tsx
│   │   ├── BrainDump.tsx
│   │   ├── Flashcards.tsx         # 3 levels
│   │   ├── MindMap.tsx            # Interactive with expand/define
│   │   └── QuizMode.tsx           # 3 levels with ratings
│   ├── vector/
│   │   ├── Calculator.tsx         # Smart calculator with history
│   │   ├── EquationSolver.tsx     # AI step-by-step solver
│   │   ├── GraphVisualizer.tsx    # SVG function plotter
│   │   └── PracticeMode.tsx       # AI practice questions
│   ├── founder/
│   │   ├── IdeaValidator.tsx      # AI market validation
│   │   ├── PitchBuilder.tsx       # 7-section pitch deck
│   │   ├── Roadmap.tsx            # 3-phase roadmap generator
│   │   └── WeeklyGoals.tsx        # Weekly goals tracker
│   ├── builder/
│   │   └── KanbanBoard.tsx        # Kanban + bug tracker
│   ├── job/
│   │   ├── JobTracker.tsx         # Application tracker
│   │   ├── ResumeBuilder.tsx      # 5-step form + download HTML/TXT
│   │   ├── InterviewPrep.tsx      # AI ratings 1-10 + feedback
│   │   ├── SkillGap.tsx           # Skill gap analyzer
│   │   └── ColdEmail.tsx          # Email/DM generator
│   ├── journal/
│   │   ├── MemoryJournal.tsx      # Photo + AI tone writer
│   │   ├── LifeTimeline.tsx       # Life chapters timeline
│   │   └── GratitudeJournal.tsx   # Daily gratitude + streak
│   ├── planet/
│   │   ├── PlanetView.tsx         # Planet modal
│   │   └── ArtifactNotification.tsx
│   └── ui/
│       └── StarBackground.tsx
├── store/
│   ├── canvas-store.ts            # Canvas state + side panel
│   └── planet-store.ts            # Planet energy + artifacts
├── lib/
│   ├── local-auth.ts              # Local auth system
│   ├── supabase.ts                # Supabase (optional)
│   ├── sticker-bundles.ts         # Pre-made sticker bundles
│   ├── default-canvas.ts          # 4 default canvas templates
│   └── use-planet-energy.ts       # Planet energy hook
└── types/
    └── index.ts                   # All TypeScript types
```

---

## ✅ Completed Features

### Phase 1 — Canvas Core
- [x] Draggable + resizable stickers with 4-corner resize handles
- [x] Rotate stickers (15° per click)
- [x] 7 pre-made sticker bundles (Spiderman, Stars, Hearts, Flowers, Batman, Kawaii, Gamer)
- [x] Custom sticker uploader (drag & drop images)
- [x] Background picker (solid colors, gradients, custom hex)
- [x] Widget icon changer (pick any sticker as widget icon)
- [x] Theme save & load (localStorage)
- [x] Theme share via URL (base64 encoded)
- [x] Draggable + resizable widgets

### Phase 2 — Study Mode
- [x] AI Notes Generator (Structured / ELI5 / Summary modes)
- [x] Brain Dump → Organize (chaos → clean notes)
- [x] Flashcards (3 levels: Basic/Intermediate/Advanced)
- [x] Quiz Mode (3 levels with per-question ratings)
- [x] Mind Map (interactive, click to define/expand nodes)
- [x] Save AI notes directly to canvas Notes widget

### Phase 3 — Canvas Improvements
- [x] Widget resize from bottom-right corner
- [x] Widget icon changer
- [x] Custom sticker uploader with localStorage persistence
- [x] Theme Manager (save/load/share/delete)
- [x] 4 default canvas templates (Cosmic, Aesthetic, Minimal, Blank)

### Canvas as Home
- [x] After login → lands on /canvas directly
- [x] First-time welcome screen with template picker
- [x] Templates button in toolbar (always accessible)
- [x] Left floating dock (planet + study/job/journal + user)
- [x] Side panel slides over canvas (all modes)
- [x] Auth redirects to /canvas

### Notes Widget Upgrade
- [x] Multiple pages (tabs) per note widget
- [x] Rich text editor (Tiptap) — bold, italic, underline
- [x] Highlight with 6 colors
- [x] Text color picker
- [x] Text alignment (left/center/right)
- [x] Bullet & numbered lists
- [x] Draw mode (freehand canvas with colors + brush sizes)
- [x] Export note as .txt
- [x] Rename pages inline

### Tracker Widget Upgrade
- [x] 4 tabs: Tasks / Calendar / Timetable / Stats
- [x] Tasks with priority (low/medium/high) + categories
- [x] Date navigation (prev/next day)
- [x] Calendar view (all tasks by date with productivity %)
- [x] Weekly timetable grid (Mon-Sun × 08:00-20:00)
- [x] Add class/slot with color coding
- [x] Stats: overall progress, today's productivity, by category, pending tasks

### Phase 4 — Job Mode
- [x] Job Application Tracker (5 statuses, expand for details)
- [x] Resume Builder (5-step form + AI generation + download HTML/TXT)
- [x] Interview Prep (AI questions + 1-10 rating + detailed feedback)
- [x] Skill Gap Analyzer (missing skills + roadmap + time estimate)
- [x] Cold Email/DM Generator (3 tones: Professional/Friendly/Bold)

### Phase 5 — Memory Journal
- [x] Memory Journal (photo upload + AI tone writer: Deep/Aesthetic/Funny/Minimal)
- [x] Life Timeline (chapters with emoji, color, period, memories)
- [x] Gratitude Journal (AI prompts + streak tracker + mood selector)

### Planet System 🪐
- [x] 5 planet stages (Barren Rock → First Spark → Living World → Thriving City → Legendary Universe)
- [x] 4 energy types (Mind, Hustle, Creative, Memory)
- [x] 12 unlockable artifacts
- [x] Streak tracker
- [x] Planet view modal (rename, energy bars, artifacts, progress)
- [x] Artifact unlock notification (bottom popup)
- [x] Energy wired to: notes, tasks, memories, gratitude, daily login

---

## ⏳ Remaining Features

### Vector Mode (Math Workspace) ✅
- [x] Smart calculator (with history)
- [x] Equation solver with step-by-step AI explanation
- [x] Vector operations (magnitude, dot/cross product via AI solver)
- [x] Graph visualizer (SVG canvas, multi-function, zoom)
- [x] Practice mode with AI questions (topic + level selector)
- [ ] Auto-create notes with formulas

### Founder Mode ✅
- [x] Idea → Validate (AI market analysis, score, green/red flags)
- [x] Pitch builder (7-section AI pitch deck)
- [x] Roadmap generator (3-phase with task checkboxes)
- [x] Weekly goals tracker (categories, progress bar, localStorage)
- [ ] Startup metrics dashboard

### Builder Mode ✅
- [x] Kanban board (Backlog / In Progress / Review / Done)
- [x] Bug tracker (bug/feature/task types)
- [x] Priority levels (low/medium/high)
- [x] Move cards between columns
- [x] Notes per card

### Phase 6 — Social OS
- [ ] Theme marketplace (browse/use community themes)
- [ ] Planet leaderboard
- [ ] Friend accountability system
- [ ] Community sticker bundles
- [ ] Public profile page

### Polish & Improvements
- [ ] Real sticker images for Naruto, Spiderman, Batman bundles
- [x] Planet energy wired to: equation solver, graph, idea validator, pitch, roadmap
- [ ] Study streak visual tracker
- [ ] Brain dump save to canvas notes button
- [ ] Mobile responsive layout

---

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

---

## How to Run
```bash
cd C:\Users\lenovo\Desktop\Vault\life-os
npm run dev
# Open http://localhost:3000
```

---

## Key Design Decisions
1. **Canvas as Home** — user's canvas IS the app, modes open as side panels
2. **Local-first** — everything works without Supabase (localStorage)
3. **Planet System** — gamification that ties all features together
4. **No XP bars** — unique "planet grows" system instead of generic XP
5. **Side panels** — modes slide over canvas, canvas always visible

---

## Amazon Q Restart Prompt

Use this prompt to continue work in a new chat:

```
I'm building "Life OS" — an AI-powered creative workspace in Next.js.
Project location: C:\Users\lenovo\Desktop\Vault\life-os

Read the file C:\Users\lenovo\Desktop\Vault\life-os\PROGRESS.md for full context of what's been built and what's remaining.

Tech stack: Next.js 16, TypeScript, Tailwind CSS v4, Zustand, Groq AI (llama-3.3-70b-versatile), Tiptap, Framer Motion, Lucide React.

The app is running on http://localhost:3000
Main canvas page: /canvas (this is the home after login)
All modes (Study, Job, Journal) open as side panels over the canvas.
Planet system tracks user actions and grows the planet.

What's remaining to build:
1. Vector Mode — AI math workspace (calculator, equation solver, graph visualizer, practice mode)
2. Founder Mode — startup workspace (idea validation, pitch builder, roadmap, weekly goals)
3. Builder Mode — dev workspace (bug tracker, feature planning, kanban)
4. Phase 6 Social — theme marketplace, leaderboard, friend system
5. Polish — real sticker images, mobile responsive, planet energy wired to more actions

Please read PROGRESS.md and continue from where we left off.
```
