# PRISM PULSE GAME

A fast-paced arcade game of color, rotation, and reflex. Rotate your shield to absorb matching orbs — one wrong move and it's over.

![Prism Pulse Game](https://img.shields.io/badge/status-playable-ff2e97) ![License](https://img.shields.io/badge/license-MIT-6ee7ff) ![No Dependencies](https://img.shields.io/badge/dependencies-none-ffd500)

---

## 🎮 Gameplay

A shield orbits your core. Orbs of four colors spiral inward. Your job is simple but brutal:

- **Rotate your shield** to match the color of an incoming orb.
- **Absorb matching orbs** to score points and build your streak.
- **Miss an orb** or **touch the wrong color** — the game ends.

The shield's color changes based on its angle around the core. Each of the four color sectors (pink, gold, cyan, purple) occupies a 90° arc. To absorb an orb, your shield must be facing the correct sector when the orb arrives.

Your best score is saved locally in your browser.

---

## 🕹️ Controls

| Action | Input |
|--------|-------|
| Rotate shield (mouse) | Move your **mouse** around the core |
| Rotate shield (touch) | Drag your **finger** around the core |
| Rotate shield (keyboard) | Hold **←** / **→** or **A** / **D** |
| Start / Retry | Click the on-screen button |

The game automatically switches between mouse and keyboard control depending on your last input.

---

## ✨ Features

- **Four-color matching** — pink, gold, cyan, and purple sectors
- **Angle-based shield color** — your shield's color is determined by its position
- **Streak system** — consecutive absorptions increase score-per-orb
- **Dynamic difficulty** — orb speed and spawn rate scale with survival time
- **Particle bursts** — explosions, ripples, and shockwaves on every absorb
- **Screen shake** — punchy feedback on pickups and deaths
- **Motion trails** — orbs leave fading trails as they spiral inward
- **Persistent high score** — saved via `localStorage`
- **Fully responsive** — works on desktop, tablet, and mobile
- **Zero dependencies** — no frameworks, no build step

---

## 📁 Project Structure

```
prism-pulse-game/
├── index.html      # Main HTML structure
├── style.css       # All styling and animations
├── script.js       # Game logic, rendering, and input
├── README.md       # You are here
└── LICENSE         # MIT License
```

If you prefer a single-file version, you can inline `style.css` and `script.js` into `index.html` — the game works either way.

---

## 🚀 Getting Started

### Play Locally

1. Clone or download this repository.
2. Open `index.html` in any modern browser.
3. Click **Play** and start rotating.

No server, no install, no build tools required.

### Clone the Repository

```bash
git clone https://github.com/reyrove/prism-pulse-game.git
cd prism-pulse-game
```

### Run via Local Server (optional)

```bash
# Python 3
python -m http.server 8000

# Node.js (with npx)
npx serve
```

Then visit `http://localhost:8000`.

### Play Online (GitHub Pages)

If GitHub Pages is enabled, the game is playable at:

```
https://your-username.github.io/prism-pulse-game/
```

---

## 🧠 How It Works

- **Canvas rendering** with `requestAnimationFrame` for a smooth game loop.
- **Delta-time updates** so gameplay speed is consistent across refresh rates.
- **Angle-based color matching** — the circle is divided into four 90° sectors, each assigned a color. `colorIdxFromAngle()` maps the shield's angle to a color index.
- **Collision detection** — orbs are checked against the shield's radial band and angular arc each frame.
- **State machine** for `MENU`, `PLAYING`, and `DEAD` states.
- **Difficulty ramp** reduces spawn intervals and increases orb speed as `elapsed` time grows.
- **Visual polish** via particle systems, expanding rings, shockwaves, and screen shake.

---

## 🎯 Tips & Strategy

- **Pre-rotate.** Watch which color is spawning and start rotating before the orb arrives.
- **Stay calm.** The orbs move slowly at first — use the early game to learn the color positions.
- **Muscle memory.** The four colors are always in the same order around the circle. Learn their positions.
- **Watch multiple orbs.** At higher difficulty, two or three orbs may spawn at once — prioritize the closest one.
- **Don't over-rotate.** Smooth mouse movement beats frantic swinging. Use small adjustments.

---

## 🛠️ Customization

Easy knobs to turn in `script.js`:

| Variable | Default | What it does |
|----------|---------|--------------|
| `COLORS` | 4 colors | The palette and order of color sectors |
| `SHIELD_ARC` | `Math.PI / 3` | Width of the shield arc (60°) |
| `SHIELD_ORBIT` | `78` | Distance of shield from core |
| `CORE_R` | `26` | Radius of the central core |
| `ORB_R` | `12` | Radius of orbs |
| `KEY_ROTATE_SPEED` | `5.2` | Rotation speed in rad/s for keyboard |
| `spawnInterval` | formula | Time between orb spawns |
| `gained` | formula | Points per absorbed orb |

Colors, fonts, and UI styling live in `style.css`.

---

## 🌐 Browser Support

Works in all modern browsers that support:

- HTML5 Canvas
- `requestAnimationFrame`
- CSS `conic-gradient` (for the title)
- `localStorage` (for high score persistence)

Tested in Chrome, Firefox, Safari, and Edge.

---

## 🗺️ Roadmap

Ideas for future versions:

- [ ] **Power-ups** — temporary slow-motion, color freeze, or shield widen
- [ ] **Game modes** — endless, time attack, hardcore (no streak bonus)
- [ ] **Sound design** — Web Audio API tones for absorbs and deaths
- [ ] **Leaderboard** — local top-10 scores with initials
- [ ] **Accessibility** — colorblind-friendly palettes and reduced-motion mode
- [ ] **Mobile haptics** — vibration feedback on absorb and death

Contributions welcome — open an issue or PR.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-idea`
3. Commit your changes: `git commit -m "Add my idea"`
4. Push to the branch: `git push origin feature/my-idea`
5. Open a Pull Request.

Please keep changes focused and test in at least two browsers.

---

## 📜 License

MIT — free to use, modify, and distribute. See `LICENSE` for details.

---

## 🙌 Credits

Built as a self-contained arcade experiment in vanilla JavaScript. Inspired by color-matching puzzle games, radial arcade shooters, and the satisfying feel of a perfect streak.

---

## 🔗 Links

- **Repository:** [github.com/reyrove/prism-pulse-game](https://github.com/reyrove/prism-pulse-game)
- **Play Online:** [reyrove.github.io/prism-pulse-game](https://reyrove.github.io/prism-pulse-game/)
- **Report a Bug:** [Issues](https://github.com/reyrove/prism-pulse-game/issues)
- **Request a Feature:** [Issues](https://github.com/reyrove/prism-pulse-game/issues)

---

**Match the color. Time the pulse. Don't blink. ◆**