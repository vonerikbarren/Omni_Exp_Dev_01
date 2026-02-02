# 3D Workspace - THREE.js Project

A professional, memory-efficient 3D workspace built with THREE.js and GSAP featuring dynamic floor management, physics, and an interactive HUD system.

## Features

### 🎮 Controls
- **WASD** - Move camera (Forward, Left, Back, Right)
- **R/F** - Move Up/Down
- **I/K** - Rotate camera Up/Down
- **9/0** - Rotate camera Left/Right  
- **L/P** - Roll camera Right/Left
- **O** - Reset camera to default position (0, 0, 100)

### 🏗️ System Features
- **Multi-Floor Grid System** - Dynamic floors (basement, main, attic)
- **Gravity Physics** - Adjustable gravity system for objects
- **Memory Efficient** - Optimized for performance with minimal resource usage
- **Floor Management** - Add/remove floors and adjust spacing dynamically
- **Interactive HUD** - Grid overlay with expandable cells
- **Real-time Info Panel** - Position, rotation, and FPS display

### 🎨 UI Components
- **Left Menu** - System controls (gravity, floors, scene settings)
- **Right Menu** - Navigation pages (Home, About, Portfolio, Services, Products, Contact)
- **HUD Grid** - Interactive 4x4 grid with expandable cells
- **Info Panel** - Real-time camera and performance metrics

## Quick Start

### GitHub Pages Setup

1. **Create a new repository on GitHub**
   ```bash
   # Create a new repo on GitHub (e.g., "3d-workspace")
   ```

2. **Clone and add files**
   ```bash
   git clone https://github.com/YOUR-USERNAME/3d-workspace.git
   cd 3d-workspace
   
   # Copy the three files into the repository:
   # - index.html
   # - style.css
   # - script.js
   ```

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: 3D Workspace"
   git push origin main
   ```

4. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click **Settings**
   - Navigate to **Pages** (left sidebar)
   - Under **Source**, select **main** branch
   - Click **Save**
   - Your site will be live at: `https://YOUR-USERNAME.github.io/3d-workspace/`

## Local Development

Simply open `index.html` in a modern web browser. No build process or local server required!

## Project Structure

```
3d-workspace/
├── index.html      # Main HTML structure
├── style.css       # Styling with tech aesthetic
├── script.js       # THREE.js logic and controls
└── README.md       # This file
```

## Technical Details

### Dependencies (CDN)
- **THREE.js** (r128) - 3D rendering engine
- **GSAP** (3.12.2) - Animation library

### Memory Optimization
- Low-poly octahedrons (detail level 0)
- Efficient grid helpers
- Pixel ratio capped at 2x
- Proper geometry/material disposal
- Maximum 10 floors limit

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern browsers with WebGL support

## Customization

### Adding New Objects
Edit `script.js` and use the `addOctahedron()` function:
```javascript
addOctahedron(x, y, z, color);
// Example: addOctahedron(10, 5, -10, 0xff0000);
```

### Changing Floor Colors
Modify the colors array in the `addFloorAbove()` function:
```javascript
const colors = [0xff6b6b, 0x4ecdc4, 0x95e1d3, 0xffe66d, 0xff6b9d, 0x6bcf7f];
```

### Adjusting Camera Speed
In `script.js`, modify these constants:
```javascript
const moveSpeed = 0.5;      // Movement speed
const rotateSpeed = 0.02;   // Rotation speed
```

## Features to Extend

- Add custom 3D models
- Implement object selection/manipulation
- Add more physics interactions
- Create save/load system for camera positions
- Add collaborative features
- Integrate with backend API

## Performance Tips

1. Keep floor count under 10 for optimal performance
2. Limit the number of octahedrons (under 50 recommended)
3. Use lower pixel ratios on mobile devices
4. Close unused menus to reduce UI overhead

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Credits

Built with:
- [THREE.js](https://threejs.org/) - 3D graphics library
- [GSAP](https://greensock.com/gsap/) - Animation platform
- Custom controls and physics system

---

**Enjoy building in 3D space! 🚀**

For questions or improvements, feel free to open an issue on GitHub.
