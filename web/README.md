# RocketSim Browser Edition

A playable browser-based Rocket League-inspired game built with pure JavaScript/HTML/CSS. Works on Chromebooks and any modern web browser.

## Features

- 🎮 **Local 2-player gameplay** - Play on the same keyboard
- 🌐 **Peer-to-peer multiplayer** - Play with friends using PeerJS (no server required)
- 📱 **Chromebook compatible** - Runs in any modern browser
- ⚡ **Responsive physics** - Ball collision, car physics, boost mechanics
- 📊 **Live stats** - FPS counter, ball position, score tracking

## How to Play

### Local Game
1. Click **"Start Game"** in the Local Match panel
2. **Player 1 (Red)**: Use Arrow Keys to move, Space to boost
3. **Player 2 (Blue)**: Use WASD to move, Shift to boost
4. Score goals on the opposite end of the field!

### Multiplayer (PeerJS)
1. Click **"Multiplayer"** tab
2. One player clicks **"Create Room"** - this generates a room code
3. Share the room code with friends
4. Friends click **"Join Room"** and paste the code
5. Game starts when both players are connected!

## Getting Started

### Local Development
Simply open `index.html` in your browser:

```bash
# Navigate to the web directory
cd web

# Start a simple HTTP server (Python 3)
python -m http.server 8000

# Or using Node.js http-server
npx http-server

# Then visit http://localhost:8000
```

### Deployment

#### Option 1: GitHub Pages (Free)
```bash
# Push the web/ folder to your repo
git add web/
git commit -m "Add web game"
git push origin web-game

# Go to repository Settings > Pages
# Select 'web' folder as source
# Access at: https://super12hacker.github.io/RocketSim/web
```

#### Option 2: Vercel (Free, Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Option 3: Netlify (Free)
Drag and drop the `web/` folder to https://app.netlify.com/drop

## Game Mechanics

### Car Physics
- **Acceleration**: Hold movement key to accelerate
- **Max Speed**: ~2300 units/second
- **Boost**: Increases acceleration 2x, regenerates over time
- **Drag**: Natural friction reduces speed

### Ball Physics
- **Gravity**: Ball falls naturally
- **Collision**: Bounces off cars and arena walls
- **Bounce Coefficient**: 0.6 (60% energy retention)
- **Arena Bounds**: Keep ball in play with wall bounces

### Scoring
- **Red Team**: Score when ball crosses right goal line
- **Blue Team**: Score when ball crosses left goal line
- Ball resets to center after each goal

## Controls Reference

| Action | Player 1 | Player 2 |
|--------|----------|----------|
| Move Up | ↑ | W |
| Move Down | ↓ | S |
| Move Left | ← | A |
| Move Right | → | D |
| Boost | Space | Shift |

## Multiplayer Network Info

- **Protocol**: WebRTC Peer-to-Peer (via PeerJS)
- **Room Codes**: First 8 characters of peer ID
- **No Server**: Direct browser-to-browser connection
- **Low Latency**: Sub-100ms typical latency
- **Network Type**: Works on WiFi, 4G, etc.

## Browser Support

- ✅ Chrome/Chromebook (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## Technical Stack

- **Frontend**: HTML5 Canvas, CSS3, Vanilla JavaScript
- **Physics**: Custom 2D physics engine
- **Multiplayer**: PeerJS (WebRTC wrapper)
- **Rendering**: Canvas 2D context
- **No Dependencies**: Except PeerJS CDN

## File Structure

```
web/
├── index.html       # Main game page
├── style.css        # UI styling
├── game.js          # Game engine & physics
└── README.md        # This file
```

## Customization

### Change Arena Size
In `game.js`, modify:
```javascript
const ARENA_WIDTH = 8192;   // Increase for bigger field
const ARENA_HEIGHT = 6560;
```

### Adjust Car Speed
```javascript
this.maxSpeed = 2300;        // Max velocity
this.acceleration = 1000;    // Acceleration rate
```

### Modify Ball Physics
```javascript
this.gravity = 650;          // Gravity strength
this.bounce = 0.6;           // Bounce coefficient (0-1)
```

### Change Team Colors
In `game.js`, find the `draw()` method:
```javascript
ctx.fillStyle = this.team === 0 ? '#ff6b6b' : '#4da6ff';  // Red vs Blue
```

## Known Limitations

- Single game instance per tab (no spectating yet)
- Network sync is basic (no interpolation yet)
- Mobile touch controls not implemented yet
- Graphics are simple 2D shapes (no 3D)

## Future Enhancements

- [ ] Touch controls for mobile/tablets
- [ ] 3D graphics with Three.js
- [ ] Ranked matchmaking
- [ ] Game replays
- [ ] AI opponents
- [ ] Custom arena themes
- [ ] Power-ups (speed boost, ball size changes)
- [ ] Team chat

## Legal Notice

This is a fan-made project inspired by Rocket League. It does **not** use any code or assets from Rocket League. Created for educational and entertainment purposes only.

## Support

For issues or feature requests, open a GitHub issue on the main repository.

---

**Play now**: Open `index.html` in your browser!
