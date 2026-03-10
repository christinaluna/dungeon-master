# ⚔️ Dungeon Master — AI-Powered Adventure

A full React application that uses Google AI Studio (Gemini API) to run an immersive, open-ended D&D-style adventure with character creation, dice mechanics, and a living character sheet.

---

## Project Structure

```text
dungeon-master/
├── api/
│   └── gemini.js                 # Vercel serverless Gemini proxy route
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                    # React entry point
    ├── App.jsx                     # Root component, phase routing
    │
    ├── api/
    │   └── dungeonMasterApi.js     # All Gemini API fetch calls
    │
    ├── constants/
    │   ├── gameData.js             # Races, classes, stats, inventory
    │   └── prompts.js              # System prompt & model config
    │
    ├── hooks/
    │   └── useGame.js              # Central game state & logic hook
    │
    ├── utils/
    │   └── gameUtils.js            # Dice rolling, outcomes, character building
    │
    ├── components/
    │   ├── CharacterCreation.jsx   # Intro screen & character form
    │   ├── CharacterSidebar.jsx    # Live character sheet panel
    │   ├── GameScreen.jsx          # Main game layout
    │   ├── StoryFeed.jsx           # Scrolling narration + dice entries
    │   ├── ActionPanel.jsx         # Choice buttons + custom input
    │   └── EndScreen.jsx           # Death / Victory screens
    │
    └── styles/
        ├── global.css              # Reset, CSS variables, root background
        ├── intro.css               # Character creation screen styles
        ├── game.css                # Sidebar, story feed, action panel
        └── endScreens.css          # Death/victory + notification toast
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your Gemini API key

Copy `.env.example` to `.env` and paste your key:

```env
GEMINI_API_KEY=YOUR_KEY_HERE
```

This app calls a backend route at `/api/gemini`.

- In production (Vercel), `/api/gemini` is served by `api/gemini.js`.
- In local dev (`npm run dev`), Vite proxies `/api/gemini` to Gemini directly.

Current proxy config in `vite.config.js`:

```js
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";

  return {
    server: {
      proxy: {
        "/api/gemini": {
          target: "https://generativelanguage.googleapis.com",
          changeOrigin: true,
          rewrite: () =>
            `/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
        },
      },
    },
  };
});
```

`src/api/dungeonMasterApi.js` should target:

```js
const API_URL = "/api/gemini";
```

Do not commit `.env` or hardcode API keys in client-side source files.

### 3. Run the dev server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Before pushing to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Security checklist:

- Keep `.env` local only (already ignored by `.gitignore`).
- Commit `.env.example` so collaborators know required variables.
- Rotate your API key if it has ever been pasted into chats, screenshots, or logs.

---

## Game Features

- **5 Races** with unique stat bonuses (Human, Elf, Dwarf, Half-Orc, Fae)
- **5 Classes** with distinct starting stats and inventory (Warrior, Mage, Rogue, Ranger, Cleric)
- **d20 dice system** with 5 outcome tiers (Critical Fail → Critical Success)
- **Live character sheet** — HP, stats, and inventory update in real time
- **Open-ended sessions** — play until death or a legendary victory
- **Custom actions** — choose from DM suggestions or type your own
- **Rich fantasy UI** — Cinzel typography, parchment aesthetic, animated dice

---

## Customisation Tips

- **Add more races/classes** — extend `gameData.js` and `gameUtils.js`
- **Tune difficulty** — adjust damage ranges in the system prompt in `prompts.js`
- **Add sound effects** — hook into `useGame.js` on dice rolls or HP changes
- **Persist sessions** — save `history` and `character` to localStorage in `useGame.js`
