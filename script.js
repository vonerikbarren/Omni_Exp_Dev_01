// ===========================
// THREE.js Scene Setup
// ===========================

let scene, camera, renderer;
let floors = [];
let gridHelpers = [];
let objects = [];
let keys = {};
let gravity = { enabled: false, strength: 0 };
let floorSpacing = 30;
let lastTime = performance.now();
let fps = 60;

// Camera movement parameters
const moveSpeed = 0.5;
const rotateSpeed = 0.02;

// Initialize scene
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.Fog(0xffffff, 50, 200);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 100);

    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Memory optimization
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Create initial floors (basement, main, attic)
    createFloor(-floorSpacing, 0xff6b6b); // Basement - red
    createFloor(0, 0x4ecdc4);            // Main - cyan
    createFloor(floorSpacing, 0x95e1d3); // Attic - green

    // Add some octahedral objects
    addOctahedron(0, 0, 0, 0x00ff88);
    addOctahedron(-20, 0, -20, 0x00d4ff);
    addOctahedron(20, 0, 20, 0xff00ff);

    // Initialize HUD
    initHUD();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Start animation
    animate();
}

// ===========================
// Floor Management
// ===========================

function createFloor(yPos, color) {
    const size = 100;
    const divisions = 20;
    
    // Grid Helper (reusing THREE.GridHelper for memory efficiency)
    const gridHelper = new THREE.GridHelper(size, divisions, color, color);
    gridHelper.position.y = yPos;
    gridHelper.material.opacity = 0.5;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
    
    gridHelpers.push(gridHelper);
    floors.push({ yPos, gridHelper, color });
    
    updateFloorCount();
}

function updateFloorSpacing(spacing) {
    floorSpacing = spacing;
    
    // Redistribute floors evenly
    const totalFloors = floors.length;
    const startY = -(totalFloors - 1) * spacing / 2;
    
    floors.forEach((floor, index) => {
        const newY = startY + index * spacing;
        floor.yPos = newY;
        floor.gridHelper.position.y = newY;
    });
}

function addFloorAbove() {
    if (floors.length >= 10) {
        alert('Maximum 10 floors allowed for memory efficiency');
        return;
    }
    
    const colors = [0xff6b6b, 0x4ecdc4, 0x95e1d3, 0xffe66d, 0xff6b9d, 0x6bcf7f];
    const topFloor = Math.max(...floors.map(f => f.yPos));
    const newColor = colors[floors.length % colors.length];
    
    createFloor(topFloor + floorSpacing, newColor);
}

function removeFloor() {
    if (floors.length <= 1) {
        alert('Must keep at least one floor');
        return;
    }
    
    const floor = floors.pop();
    scene.remove(floor.gridHelper);
    floor.gridHelper.geometry.dispose();
    floor.gridHelper.material.dispose();
    
    updateFloorCount();
}

function updateFloorCount() {
    document.getElementById('floorCount').textContent = floors.length;
}

// ===========================
// Octahedron Creation
// ===========================

function addOctahedron(x, y, z, color) {
    const geometry = new THREE.OctahedronGeometry(5, 0); // Detail 0 for memory efficiency
    const material = new THREE.MeshStandardMaterial({ 
        color: color,
        metalness: 0.5,
        roughness: 0.3,
        wireframe: false
    });
    const octahedron = new THREE.Mesh(geometry, material);
    octahedron.position.set(x, y, z);
    
    // Physics properties
    octahedron.userData.velocity = new THREE.Vector3(0, 0, 0);
    octahedron.userData.mass = 1;
    
    scene.add(octahedron);
    objects.push(octahedron);
    
    // Animate with GSAP
    gsap.to(octahedron.rotation, {
        y: Math.PI * 2,
        duration: 4,
        repeat: -1,
        ease: "none"
    });
    
    return octahedron;
}

// ===========================
// Physics System
// ===========================

function applyPhysics(deltaTime) {
    if (!gravity.enabled) return;
    
    objects.forEach(obj => {
        // Apply gravity
        obj.userData.velocity.y += gravity.strength * deltaTime;
        
        // Update position
        obj.position.x += obj.userData.velocity.x * deltaTime;
        obj.position.y += obj.userData.velocity.y * deltaTime;
        obj.position.z += obj.userData.velocity.z * deltaTime;
        
        // Floor collision detection
        let onFloor = false;
        floors.forEach(floor => {
            if (obj.position.y <= floor.yPos + 5 && obj.position.y >= floor.yPos - 1) {
                obj.position.y = floor.yPos + 5;
                obj.userData.velocity.y = 0;
                onFloor = true;
            }
        });
        
        // Bounce on floor
        if (onFloor && Math.abs(obj.userData.velocity.y) > 0.1) {
            obj.userData.velocity.y *= -0.5;
        }
        
        // Air resistance
        obj.userData.velocity.multiplyScalar(0.98);
    });
}

// ===========================
// Camera Controls
// ===========================

function updateCamera() {
    const moveVector = new THREE.Vector3();
    
    // Forward/Backward (W/S)
    if (keys['w'] || keys['W']) {
        moveVector.z -= moveSpeed;
    }
    if (keys['s'] || keys['S']) {
        moveVector.z += moveSpeed;
    }
    
    // Left/Right (A/D)
    if (keys['a'] || keys['A']) {
        moveVector.x -= moveSpeed;
    }
    if (keys['d'] || keys['D']) {
        moveVector.x += moveSpeed;
    }
    
    // Up/Down (R/F)
    if (keys['r'] || keys['R']) {
        moveVector.y += moveSpeed;
    }
    if (keys['f'] || keys['F']) {
        moveVector.y -= moveSpeed;
    }
    
    // Apply rotation to movement vector
    moveVector.applyQuaternion(camera.quaternion);
    camera.position.add(moveVector);
    
    // Rotation controls (I, 9, 0, P, L, K)
    if (keys['i'] || keys['I']) {
        camera.rotation.x += rotateSpeed; // Rotate up
    }
    if (keys['k'] || keys['K']) {
        camera.rotation.x -= rotateSpeed; // Rotate down
    }
    if (keys['9']) {
        camera.rotation.y += rotateSpeed; // Rotate left
    }
    if (keys['0']) {
        camera.rotation.y -= rotateSpeed; // Rotate right
    }
    if (keys['l'] || keys['L']) {
        camera.rotation.z -= rotateSpeed; // Roll right
    }
    if (keys['p'] || keys['P']) {
        camera.rotation.z += rotateSpeed; // Roll left
    }
    
    // Update info panel
    updateInfoPanel();
}

function resetCamera() {
    gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 100,
        duration: 1,
        ease: "power2.inOut"
    });
    
    gsap.to(camera.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        ease: "power2.inOut"
    });
}

// ===========================
// HUD System
// ===========================

function initHUD() {
    const hudGrid = document.getElementById('hudGrid');
    
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'hud-cell';
        cell.textContent = i + 1;
        cell.dataset.index = i;
        
        cell.addEventListener('click', () => {
            toggleCellExpansion(cell);
        });
        
        hudGrid.appendChild(cell);
    }
}

function toggleCellExpansion(cell) {
    const allCells = document.querySelectorAll('.hud-cell');
    
    if (cell.classList.contains('expanded')) {
        // Collapse
        cell.classList.remove('expanded');
        allCells.forEach(c => c.style.display = 'flex');
        
        // Spawn object in 3D space
        const index = parseInt(cell.dataset.index);
        const x = (index % 4 - 1.5) * 10;
        const z = (Math.floor(index / 4) - 1.5) * 10;
        const colors = [0x00ff88, 0x00d4ff, 0xff00ff, 0xffff00];
        addOctahedron(x, 10, z, colors[index % 4]);
    } else {
        // Expand
        allCells.forEach(c => {
            c.classList.remove('expanded');
            c.style.display = 'flex';
        });
        
        cell.classList.add('expanded');
        allCells.forEach(c => {
            if (c !== cell) c.style.display = 'none';
        });
    }
}

// ===========================
// UI Controls
// ===========================

function setupUIControls() {
    // Left Menu Toggle
    const leftMenuToggle = document.getElementById('leftMenuToggle');
    const leftMenu = document.getElementById('leftMenu');
    
    leftMenuToggle.addEventListener('click', () => {
        leftMenu.classList.toggle('active');
        leftMenuToggle.classList.toggle('active');
    });
    
    // Right Menu Toggle
    const rightMenuToggle = document.getElementById('rightMenuToggle');
    const rightMenu = document.getElementById('rightMenu');
    
    rightMenuToggle.addEventListener('click', () => {
        rightMenu.classList.toggle('active');
        rightMenuToggle.classList.toggle('active');
    });
    
    // Gravity Controls
    const gravitySlider = document.getElementById('gravitySlider');
    const gravityValue = document.getElementById('gravityValue');
    const toggleGravity = document.getElementById('toggleGravity');
    
    gravitySlider.addEventListener('input', (e) => {
        gravity.strength = parseFloat(e.target.value);
        gravityValue.textContent = gravity.strength.toFixed(1);
    });
    
    toggleGravity.addEventListener('click', () => {
        gravity.enabled = !gravity.enabled;
        toggleGravity.textContent = gravity.enabled ? 'Disable Gravity' : 'Enable Gravity';
        toggleGravity.style.borderColor = gravity.enabled ? '#ff6b6b' : '#00ff88';
    });
    
    // Floor Spacing
    const floorSpacingSlider = document.getElementById('floorSpacing');
    const spacingValue = document.getElementById('spacingValue');
    
    floorSpacingSlider.addEventListener('input', (e) => {
        const spacing = parseInt(e.target.value);
        spacingValue.textContent = spacing;
        updateFloorSpacing(spacing);
    });
    
    // Floor Management
    document.getElementById('addFloor').addEventListener('click', addFloorAbove);
    document.getElementById('removeFloor').addEventListener('click', removeFloor);
    
    // Grid Opacity
    const gridOpacity = document.getElementById('gridOpacity');
    const opacityValue = document.getElementById('opacityValue');
    
    gridOpacity.addEventListener('input', (e) => {
        const opacity = parseFloat(e.target.value);
        opacityValue.textContent = opacity.toFixed(1);
        gridHelpers.forEach(grid => {
            grid.material.opacity = opacity;
        });
    });
    
    // Reset Camera
    document.getElementById('resetCamera').addEventListener('click', resetCamera);
    
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // You can add page-specific logic here
            const page = link.dataset.page;
            console.log('Navigating to:', page);
        });
    });
}

// ===========================
// Event Handlers
// ===========================

function onKeyDown(event) {
    keys[event.key] = true;
    
    // Reset camera with 'O' key
    if (event.key === 'o' || event.key === 'O') {
        resetCamera();
    }
}

function onKeyUp(event) {
    keys[event.key] = false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===========================
// Info Panel Updates
// ===========================

function updateInfoPanel() {
    const pos = camera.position;
    const rot = camera.rotation;
    
    document.getElementById('positionInfo').textContent = 
        `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}`;
    
    document.getElementById('rotationInfo').textContent = 
        `${(rot.x * 180 / Math.PI).toFixed(0)}°, ${(rot.y * 180 / Math.PI).toFixed(0)}°, ${(rot.z * 180 / Math.PI).toFixed(0)}°`;
}

function updateFPS() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTime;
    fps = Math.round(1000 / deltaTime);
    document.getElementById('fpsInfo').textContent = fps;
    lastTime = currentTime;
}

// ===========================
// Animation Loop
// ===========================

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = 0.016; // Approximate 60fps
    
    updateCamera();
    applyPhysics(deltaTime);
    updateFPS();
    
    renderer.render(scene, camera);
}

// ===========================
// Initialize Application
// ===========================

window.addEventListener('DOMContentLoaded', () => {
    init();
    setupUIControls();
    
    // Welcome animation
    gsap.from('.menu-toggle', {
        scale: 0,
        duration: 0.5,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });
    
    gsap.from('.info-panel', {
        y: 100,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.out"
    });
    
    gsap.from('.hud-container', {
        scale: 0,
        opacity: 0,
        duration: 1,
        delay: 0.7,
        ease: "back.out(1.7)"
    });
});

// ===========================
// Memory Management
// ===========================

// Clean up resources when needed
window.addEventListener('beforeunload', () => {
    // Dispose of geometries and materials
    objects.forEach(obj => {
        obj.geometry.dispose();
        obj.material.dispose();
    });
    
    gridHelpers.forEach(grid => {
        grid.geometry.dispose();
        grid.material.dispose();
    });
    
    renderer.dispose();
});
