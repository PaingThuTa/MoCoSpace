# MoCoSpace

MoCoSpace is a frontend-only spaced repetition web app for coding and learning topics. It uses a lightweight SM-2 based review algorithm, localStorage persistence, and a responsive React + Tailwind UI.

## Features

- Add, edit, delete learning items
- Item fields: title, category, difficulty, tags, notes/solution (Markdown), and URL
- SM-2 style scheduling with ratings:
  - Again (0)
  - Hard (3)
  - Good (4)
  - Easy (5)
- Auto-schedules new items for tomorrow
- Due-only study mode with one-card-at-a-time review
- Dashboard with due count, streak, reviewed today, and mastered items
- Filter/search/sort item collection
- LocalStorage auto-save
- JSON export/import
- Optional dark mode toggle

## Tech Stack

- React (hooks) + Vite
- Tailwind CSS
- lucide-react icons
- localStorage

## Project Structure

```text
src/
├── components/
│   ├── Dashboard.jsx
│   ├── ReviewCard.jsx
│   ├── AddItemForm.jsx
│   ├── ItemList.jsx
│   ├── FilterBar.jsx
│   └── Statistics.jsx
├── utils/
│   ├── spacedRepetition.js
│   └── storage.js
├── hooks/
│   └── useLocalStorage.js
├── App.jsx
└── main.jsx
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview production build:

```bash
npm run preview
```

## SM-2 Based Logic Used

For each item, MoCoSpace tracks:

- `easinessFactor` (default `2.5`, minimum `1.3`)
- `repetition`
- `interval` (days)
- `nextReviewDate`

Rating behavior:

- Again: reset to `1` day
- Hard: `interval * 1.2`
- Good: `interval * easinessFactor`
- Easy: `interval * easinessFactor * 1.3`

Easiness factor update:

```text
EF = EF + (0.1 - (5 - rating) × (0.08 + (5 - rating) × 0.02))
```

## Data Persistence

All application data is stored in localStorage under key:

- `mocospace:v1`

Use Export to download a backup JSON and Import to restore data.
