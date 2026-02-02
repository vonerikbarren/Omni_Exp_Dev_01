# 3D Journal Viewer

An interactive 3D journal viewer built with Three.js, featuring immersive navigation, hand-based menus, and a customizable space for managing your daily routines.

Beta = ver_0001

## Features

### 🎮 Navigation
- **WASD Movement** - Navigate through 3D space
- **R/F Keys** - Move up and down
- **C Key + Mouse** - Metroid Prime-style FPS camera look
- **O Key** - Reset camera to origin
- **Breathing Camera** - Subtle camera bobbing for immersion

### ✋ Hand Menus
- **Left Hand (Left Shift)** - Radial menu with 10 customizable options
- **Right Hand (Right Shift)** - Mirror radial menu for quick actions
- **Conscious Hand (Enter)** - Main menu with Pause, MySpace, User Pocket controls

### 🌐 MySpace (Grid Sphere)
- Spherical grid system for organizing content
- Toggle with **0 key** or MS button
- Collapse/expand animation (panels animate one-by-one)
- Customizable positions on sphere

### 📦 User Pocket
- 20-slot inventory system (4×5 grid)
- Toggle with **9 key** or via Conscious Hand menu
- Deploy/recall items to/from scene
- Password protection support
- Visual states for empty/stored/deployed items

### 🎨 Themes
9 beautiful themes available:
- Silver (default)
- Dark Blue
- Orange
- Yellow
- Red
- Purple
- Teal
- Neon Blue
- Magenta

### 🔍 Inspector Panel
- Object selection and properties
- Transparency controls
- Transform tools (Position, Rotation, Scale)
- Summon controls:
  - Summon to Center
  - Summon to Hands
  - Summon Back to Folder

### 📱 Mobile Support
- Touch-enabled joystick for movement
- Single-finger touch for FPS camera
- Mobile control buttons (POS, ROT, SCL, LH, RH, CH, MS)

### 🎯 Additional Features
- Dockable items (drag-and-drop between 4 docks)
- Session timer
- Search panel
- Hierarchical navigation menus
- 30 customizable action buttons
- Transform panel with submit functionality
- FAQ/Controls panel

## Installation

1. Clone this repository:
```bash
git clone [your-repo-url]
cd 3d-journal-viewer
```

2. Open `index.html` in a modern web browser

**Note:** Make sure all three files are in the same directory:
- `index.html`
- `style.css`
- `script.js`

## File Structure

```
3d-journal-viewer/
├── index.html    # Main HTML structure
├── style.css     # All styling and themes
└── script.js     # Three.js logic and interactions
```

## External Dependencies

The project uses CDN links for:
- Three.js r128
- GSAP 3.12.2
- Google Fonts (Orbitron)

No npm installation required!

## Controls Quick Reference

### Keyboard
- **WASD** - Move forward/left/back/right
- **R/F** - Move up/down
- **C** - Hold for FPS mouse look
- **O** - Reset camera
- **0** - Toggle MySpace
- **9** - Toggle Pocket
- **Q** - Toggle FAQ
- **X** - Toggle Inspector
- **Z** - Toggle Docks
- **Left Shift** - Left Hand menu
- **Right Shift** - Right Hand menu
- **Enter** - Conscious Hand menu

### Mouse
- **Click & Drag** - Orbit camera
- **C + Mouse** - FPS look
- **Click Objects** - Select objects

### Mobile
- **Joystick** - Move in space
- **Single Finger Touch** - FPS camera look
- **Control Buttons** - Access features

## Customization

### Adding New Journal Pages
Edit the `pageData` array in `script.js`:
```javascript
const pageData = [
    { title: 'Your\nTitle', color: 0x4A90E2, lat: 2, lon: 0 }
];
```

### Adding Themes
Edit the `themes` object in `script.js`:
```javascript
themes = {
    'yourtheme': {
        name: 'Your Theme',
        primary: 'rgba(r, g, b, a)',
        accent: '#HEXCOLOR',
        // ... other properties
    }
}
```

### Customizing Hand Menus
Edit the options arrays in `setupHandMenus()`:
```javascript
const lhOptions = ['Option 1', 'Option 2', ...];
```

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support.

## Future Enhancements

- [ ] Add item storage/retrieval to pocket
- [ ] Implement password protection for pocket items
- [ ] Add more journal page templates
- [ ] Cloud save functionality
- [ ] Multi-user collaboration
- [ ] VR support

## License

MIT License - Feel free to use and modify!

## Credits

Built with:
- Three.js for 3D rendering
- GSAP for smooth animations
- Orbitron font by Google Fonts

---

**Checkpoint:** This is a stable build ready for GitHub. All core features implemented and tested.
