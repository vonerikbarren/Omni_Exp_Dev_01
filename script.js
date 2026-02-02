        // Global variables
        let scene, camera, renderer;
        let interactiveObjects = [];
        let journalPages = [];
        let gridObjects = [];
        let selectedObject = null;
        let hoveredObject = null;
        let isRotating = false;
        let previousMousePosition = { x: 0, y: 0 };
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const cameraTarget = new THREE.Vector3(0, 0, 0);

        // Keyboard controls
        const keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            r: false,
            f: false,
            c: false
        };
        const moveSpeed = 0.2;

        // Mouse look controls - only active when holding C
        let lastMouseX = window.innerWidth / 2;
        let lastMouseY = window.innerHeight / 2;
        const lookSensitivity = 0.002;

        // Camera breathing effect (Metroid Prime style)
        let breathTime = 0;
        const breathSpeed = 0.8;
        const breathIntensity = 0.02;

        // Hand menus
        let leftHandVisible = false;
        let rightHandVisible = false;
        let consciousHandVisible = false;

        // MySpace (grid sphere) state
        let mySpaceExpanded = true;
        let mySpaceAnimating = false;
        const expandedRadius = 25;
        const collapsedRadius = 5;

        // Pocket system
        let pocketVisible = false;
        let pocketItems = {}; // Object to store pocket items with metadata
        const maxPocketSlots = 20;
        
        // Initialize pocket slots
        for (let i = 0; i < maxPocketSlots; i++) {
            pocketItems[i] = {
                occupied: false,
                deployed: false, // true if item is out in the scene
                itemData: null,
                password: null
            };
        }

        // Docks visibility
        let docksVisible = true;

        // Session timer
        let sessionStartTime = Date.now();
        let timerInterval = null;

        // Theme system
        const themes = {
            'silver': {
                name: 'Silver',
                primary: 'rgba(60, 60, 70, 0.8)',
                accent: '#C0C0C0',
                text: '#E8E8E8',
                dockBg: '#ffffff',
                dockText: '#333333',
                dockGlow: 'rgba(255, 255, 255, 0.6)',
                preview: 'linear-gradient(135deg, #3c3c46, #808080)'
            },
            'darkblue': {
                name: 'Dark Blue',
                primary: 'rgba(15, 15, 35, 0.7)',
                accent: '#4A90E2',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#1a1a2e',
                dockGlow: 'rgba(74, 144, 226, 0.6)',
                preview: 'linear-gradient(135deg, #0f0f23, #4A90E2)'
            },
            'orange': {
                name: 'Orange',
                primary: 'rgba(30, 20, 10, 0.7)',
                accent: '#FF8C00',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#1e140a',
                dockGlow: 'rgba(255, 140, 0, 0.6)',
                preview: 'linear-gradient(135deg, #FF6B00, #FFA500)'
            },
            'yellow': {
                name: 'Yellow',
                primary: 'rgba(40, 40, 20, 0.7)',
                accent: '#FFD700',
                text: '#333',
                dockBg: '#ffffff',
                dockText: '#282814',
                dockGlow: 'rgba(255, 215, 0, 0.6)',
                preview: 'linear-gradient(135deg, #FFC107, #FFD700)'
            },
            'red': {
                name: 'Red',
                primary: 'rgba(30, 10, 10, 0.7)',
                accent: '#DC143C',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#1e0a0a',
                dockGlow: 'rgba(220, 20, 60, 0.6)',
                preview: 'linear-gradient(135deg, #DC143C, #FF6B6B)'
            },
            'purple': {
                name: 'Purple',
                primary: 'rgba(20, 10, 30, 0.7)',
                accent: '#9370DB',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#140a1e',
                dockGlow: 'rgba(147, 112, 219, 0.6)',
                preview: 'linear-gradient(135deg, #6A0DAD, #9370DB)'
            },
            'teal': {
                name: 'Teal',
                primary: 'rgba(10, 25, 25, 0.7)',
                accent: '#20B2AA',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#0a1919',
                dockGlow: 'rgba(32, 178, 170, 0.6)',
                preview: 'linear-gradient(135deg, #008B8B, #20B2AA)'
            },
            'neonblue': {
                name: 'Neon Blue',
                primary: 'rgba(10, 10, 25, 0.7)',
                accent: '#00FFFF',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#0a0a19',
                dockGlow: 'rgba(0, 255, 255, 0.6)',
                preview: 'linear-gradient(135deg, #00CED1, #00FFFF)'
            },
            'magenta': {
                name: 'Magenta',
                primary: 'rgba(30, 10, 30, 0.7)',
                accent: '#FF00FF',
                text: '#fff',
                dockBg: '#ffffff',
                dockText: '#1e0a1e',
                dockGlow: 'rgba(255, 0, 255, 0.6)',
                preview: 'linear-gradient(135deg, #C71585, #FF00FF)'
            }
        };

        let currentTheme = 'silver';

        // Wisdom, jokes, and FYIs
        const wiseSayings = [
            "The journey of a thousand miles begins with a single step.",
            "It does not matter how slowly you go as long as you do not stop.",
            "The only way to do great work is to love what you do.",
            "Innovation distinguishes between a leader and a follower.",
            "Your time is limited, don't waste it living someone else's life.",
            "The best time to plant a tree was 20 years ago. The second best time is now.",
            "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
            "Believe you can and you're halfway there.",
            "Do not wait for leaders; do it alone, person to person.",
            "The future belongs to those who believe in the beauty of their dreams."
        ];

        const funnyJokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a fake noodle? An impasta!",
            "Why did the bicycle fall over? It was two tired!",
            "What did one wall say to the other? I'll meet you at the corner!",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What's the best thing about Switzerland? I don't know, but the flag is a big plus!",
            "How does a penguin build its house? Igloos it together!"
        ];

        const randomFYIs = [
            "FYI: Honey never spoils. Archaeologists have found 3000-year-old honey that's still edible!",
            "FYI: Octopuses have three hearts and blue blood!",
            "FYI: A group of flamingos is called a 'flamboyance'!",
            "FYI: The shortest war in history lasted 38 minutes!",
            "FYI: Bananas are berries, but strawberries aren't!",
            "FYI: There are more stars in the universe than grains of sand on Earth!",
            "FYI: A single bolt of lightning contains enough energy to toast 100,000 slices of bread!",
            "FYI: The human brain uses 20% of the body's energy despite being only 2% of body weight!",
            "FYI: Venus is the only planet that rotates clockwise!",
            "FYI: A jiffy is an actual unit of time - 1/100th of a second!"
        ];

        function showWisdomPrompt() {
            document.getElementById('restart-prompt').classList.remove('visible');
            
            const allContent = [...wiseSayings, ...funnyJokes, ...randomFYIs];
            const randomContent = allContent[Math.floor(Math.random() * allContent.length)];
            
            document.getElementById('wisdom-text').textContent = randomContent;
            document.getElementById('wisdom-prompt').classList.add('visible');
            playSound('passive');
        }

        function applyTheme(themeName) {
            const theme = themes[themeName];
            if (!theme) return;

            currentTheme = themeName;
            
            // Update CSS variables or directly update elements
            const root = document.documentElement;
            root.style.setProperty('--theme-primary', theme.primary);
            root.style.setProperty('--theme-accent', theme.accent);
            root.style.setProperty('--theme-text', theme.text);

            // Update all panels
            document.querySelectorAll('.side-menu, #inspector-panel, #info-panel, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, #transform-panel').forEach(el => {
                el.style.background = theme.primary;
                el.style.backdropFilter = 'blur(20px)';
                el.style.color = theme.text;
            });

            // Update accent colors
            document.querySelectorAll('.menu-title, .info-space-title, .breadcrumb-current, .controls-title, .prompt-title').forEach(el => {
                el.style.color = theme.accent;
            });

            // Update borders
            document.querySelectorAll('.side-menu, #inspector-panel, #info-panel, #search-panel, .dock, .hamburger-btn, #faq-panel, .prompt-modal, .menu-item, .submenu-item, #transform-panel').forEach(el => {
                el.style.borderColor = theme.accent + '80';
            });

            // Update hamburger spans
            document.querySelectorAll('.hamburger-btn span').forEach(el => {
                el.style.background = theme.accent;
            });

            // Update text elements
            document.querySelectorAll('.menu-item, .submenu-item, .breadcrumb, .info-username, .faq-answer, .faq-question, .prompt-message').forEach(el => {
                el.style.color = theme.text;
            });

            // Keep timer always visible (bold white or dark depending on theme)
            const timer = document.querySelector('.info-timer');
            if (timer) {
                timer.style.color = theme.text === '#333' ? '#000' : '#fff';
            }

            // Update breadcrumb separators
            document.querySelectorAll('.breadcrumb-separator').forEach(el => {
                el.style.color = theme.text === '#333' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
            });

            // Update dock items with white glow and theme-specific text
            document.querySelectorAll('.dock-item').forEach(el => {
                el.style.background = '#ffffff';
                el.style.color = theme.dockText;
                el.style.border = `1px solid ${theme.accent}`;
                el.style.boxShadow = `0 0 10px ${theme.dockGlow}, 0 0 20px ${theme.dockGlow}, inset 0 0 5px rgba(255, 255, 255, 0.3)`;
                el.style.textShadow = `0 0 8px ${theme.accent}, 0 0 12px ${theme.accent}`;
            });

            // Update docks background
            document.querySelectorAll('.dock').forEach(el => {
                el.style.background = theme.primary;
                el.style.borderColor = theme.accent + '50';
            });

            // Update mobile controls (joystick and buttons)
            const joystickBase = document.querySelector('.joystick-base');
            if (joystickBase) {
                joystickBase.style.background = theme.primary;
                joystickBase.style.borderColor = theme.accent + '50';
            }

            const joystickStick = document.querySelector('.joystick-stick');
            if (joystickStick) {
                joystickStick.style.background = theme.accent + '99';
                joystickStick.style.borderColor = theme.accent;
            }

            // Update control buttons
            document.querySelectorAll('.control-btn').forEach(el => {
                el.style.background = theme.primary;
                el.style.borderColor = theme.accent + '50';
                el.style.color = theme.text;
            });

            // Update action buttons
            document.querySelectorAll('.action-btn').forEach(el => {
                el.style.background = theme.primary;
                el.style.borderColor = theme.accent + '50';
                el.style.color = theme.text;
            });

            // Update transform panel inputs
            document.querySelectorAll('.transform-input, .step-input').forEach(el => {
                el.style.background = 'rgba(255, 255, 255, 0.05)';
                el.style.borderColor = theme.accent + '50';
                el.style.color = theme.text;
            });

            // Update camera circle
            const cameraCircle = document.getElementById('camera-circle');
            if (cameraCircle) {
                cameraCircle.style.borderColor = theme.accent + '33';
            }

            // Update hand menu radial items
            document.querySelectorAll('.radial-item').forEach(el => {
                el.style.borderColor = theme.accent + '99';
                el.style.boxShadow = `0 0 10px ${theme.accent}66`;
            });

            // Update pause overlay
            const pauseTitle = document.querySelector('.pause-title');
            if (pauseTitle) {
                pauseTitle.style.color = theme.accent;
            }

            const pauseBtn = document.querySelector('.pause-btn');
            if (pauseBtn) {
                pauseBtn.style.background = theme.accent + '66';
                pauseBtn.style.borderColor = theme.accent + 'B3';
            }

            // Update pocket panel
            const pocketPanel = document.getElementById('pocket-panel');
            if (pocketPanel) {
                pocketPanel.style.background = theme.primary;
                pocketPanel.style.borderColor = theme.accent + '66';
            }

            const pocketHeader = document.querySelector('.pocket-header');
            if (pocketHeader) {
                pocketHeader.style.color = theme.accent;
            }

            document.querySelectorAll('.pocket-slot').forEach(el => {
                el.style.borderColor = theme.accent + '80';
            });

            // Update menu item hovers
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                .menu-item:hover, .submenu-item:hover {
                    background: ${theme.accent}33 !important;
                    border-color: ${theme.accent}80 !important;
                }
                .prompt-btn {
                    background: ${theme.accent}50 !important;
                    border-color: ${theme.accent}80 !important;
                }
                .prompt-btn:hover {
                    background: ${theme.accent}80 !important;
                }
                .search-input {
                    color: ${theme.text} !important;
                    border-color: ${theme.accent}50 !important;
                }
                .search-input:focus {
                    border-color: ${theme.accent}99 !important;
                    background: ${theme.accent}1A !important;
                }
                .dock-item:hover {
                    background: #ffffff !important;
                    border-color: ${theme.accent} !important;
                    box-shadow: 0 0 15px ${theme.dockGlow}, 0 0 30px ${theme.dockGlow}, inset 0 0 8px rgba(255, 255, 255, 0.4) !important;
                    text-shadow: 0 0 10px ${theme.accent}, 0 0 15px ${theme.accent} !important;
                    transform: scale(1.1);
                }
                .dock-item.dragging {
                    opacity: 0.5;
                }
                .control-btn:hover, .action-btn:hover {
                    background: ${theme.accent}50 !important;
                    border-color: ${theme.accent}99 !important;
                }
                .control-btn.active, .action-btn.active {
                    background: ${theme.accent}99 !important;
                    border-color: ${theme.accent} !important;
                    color: ${theme.dockText} !important;
                }
                .joystick-stick:active {
                    background: ${theme.accent} !important;
                }
                .transform-input:focus, .step-input:focus {
                    border-color: ${theme.accent}99 !important;
                    background: ${theme.accent}1A !important;
                }
                .transform-input, .step-input {
                    color: ${theme.text} !important;
                    background: rgba(255, 255, 255, 0.05) !important;
                    border-color: ${theme.accent}50 !important;
                }
                .fps-mode #camera-circle {
                    border-color: ${theme.accent}99 !important;
                    border-width: 3px;
                }
                .fps-mode #camera-circle::before {
                    background: ${theme.accent}E6 !important;
                }
                .summon-btn, .transform-submit-btn {
                    background: ${theme.accent}50 !important;
                    border-color: ${theme.accent}80 !important;
                    color: ${theme.text} !important;
                }
                .summon-btn:hover, .transform-submit-btn:hover {
                    background: ${theme.accent}80 !important;
                    border-color: ${theme.accent} !important;
                }
                .radial-item:hover {
                    background: ${theme.accent}E6 !important;
                    border-color: ${theme.accent} !important;
                }
                .pause-title {
                    color: ${theme.accent} !important;
                }
                .pause-btn {
                    background: ${theme.accent}66 !important;
                    border-color: ${theme.accent}B3 !important;
                }
                .pause-btn:hover {
                    background: ${theme.accent}B3 !important;
                    box-shadow: 0 0 20px ${theme.accent}99 !important;
                }
                .pocket-panel {
                    background: ${theme.primary} !important;
                    border-color: ${theme.accent}66 !important;
                }
                .pocket-header {
                    color: ${theme.accent} !important;
                }
                .pocket-slot {
                    border-color: ${theme.accent}80 !important;
                }
                .pocket-slot:hover {
                    background: ${theme.accent}80 !important;
                    border-color: ${theme.accent}E6 !important;
                }
            `;
            
            // Remove old theme styles
            const oldStyle = document.getElementById('theme-dynamic-styles');
            if (oldStyle) oldStyle.remove();
            styleSheet.id = 'theme-dynamic-styles';
            document.head.appendChild(styleSheet);

            // Update active theme in grid
            document.querySelectorAll('.theme-option').forEach(el => {
                el.classList.remove('active');
            });
            const activeTheme = document.querySelector(`[data-theme="${themeName}"]`);
            if (activeTheme) {
                activeTheme.classList.add('active');
            }

            playSound('active');
        }

        function initThemeSelector() {
            const grid = document.getElementById('theme-grid');
            grid.innerHTML = '';

            Object.keys(themes).forEach(themeKey => {
                const theme = themes[themeKey];
                const option = document.createElement('div');
                option.className = 'theme-option';
                option.setAttribute('data-theme', themeKey);
                if (themeKey === currentTheme) {
                    option.classList.add('active');
                }
                
                option.innerHTML = `
                    <div class="theme-color-preview" style="background: ${theme.preview}"></div>
                    <div>${theme.name}</div>
                `;
                
                option.addEventListener('click', () => {
                    applyTheme(themeKey);
                });
                
                grid.appendChild(option);
            });
        }

        function setupHandMenus() {
            const leftHand = document.getElementById('left-hand');
            const rightHand = document.getElementById('right-hand');
            const consciousHand = document.getElementById('conscious-hand');
            const pauseOverlay = document.getElementById('pause-overlay');
            const resumeBtn = document.getElementById('resume-btn');

            // Create radial menu items for Left Hand
            const lhRadial = document.getElementById('lh-radial');
            const lhOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 
                              'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'];
            createRadialMenu(lhRadial, lhOptions, 'lh');

            // Create radial menu items for Right Hand
            const rhRadial = document.getElementById('rh-radial');
            const rhOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 
                              'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'];
            createRadialMenu(rhRadial, rhOptions, 'rh');

            // Create radial menu items for Conscious Hand
            const chRadial = document.getElementById('ch-radial');
            const chOptions = ['Pause Menu', 'MySpace', 'User Pocket', 'Option 4', 'Option 5', 
                              'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10'];
            createRadialMenu(chRadial, chOptions, 'ch');

            // Resume button
            resumeBtn.addEventListener('click', () => {
                pauseOverlay.classList.remove('visible');
                playSound('active');
            });

            // Mobile buttons
            const btnLH = document.getElementById('btn-lh');
            const btnRH = document.getElementById('btn-rh');
            const btnCH = document.getElementById('btn-ch');

            if (btnLH) {
                btnLH.addEventListener('click', () => {
                    toggleLeftHand();
                });
            }

            if (btnRH) {
                btnRH.addEventListener('click', () => {
                    toggleRightHand();
                });
            }

            if (btnCH) {
                btnCH.addEventListener('click', () => {
                    toggleConsciousHand();
                });
            }

            const btnMySpace = document.getElementById('btn-myspace');
            if (btnMySpace) {
                btnMySpace.addEventListener('click', () => {
                    toggleMySpace();
                });
            }
        }

        function createRadialMenu(container, options, handType) {
            const radius = 100; // Distance from center
            const angleStep = (Math.PI * 2) / options.length;

            options.forEach((option, index) => {
                const angle = angleStep * index - Math.PI / 2; // Start from top
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                const item = document.createElement('div');
                item.className = 'radial-item';
                item.textContent = option;
                item.style.left = `calc(50% + ${x}px)`;
                item.style.top = `calc(50% + ${y}px)`;
                item.style.transform = 'translate(-50%, -50%)';

                item.addEventListener('click', () => {
                    handleRadialItemClick(handType, option, index);
                });

                container.appendChild(item);
            });
        }

        function handleRadialItemClick(handType, option, index) {
            console.log(`${handType} - ${option} clicked (index: ${index})`);
            playSound('active');

            // Handle special options
            if (handType === 'ch' && option === 'Pause Menu') {
                document.getElementById('pause-overlay').classList.add('visible');
                // Hide conscious hand when pause menu opens
                toggleConsciousHand();
            }

            if (handType === 'ch' && option === 'MySpace') {
                toggleMySpace();
                // Hide conscious hand after selection
                toggleConsciousHand();
            }

            if (handType === 'ch' && option === 'User Pocket') {
                togglePocket();
                // Hide conscious hand after selection
                toggleConsciousHand();
            }

            // Add more functionality here for each option
        }

        function toggleLeftHand() {
            leftHandVisible = !leftHandVisible;
            const leftHand = document.getElementById('left-hand');
            
            if (leftHandVisible) {
                leftHand.classList.add('visible');
                // Hide other hands
                document.getElementById('right-hand').classList.remove('visible');
                document.getElementById('conscious-hand').classList.remove('visible');
                rightHandVisible = false;
                consciousHandVisible = false;
            } else {
                leftHand.classList.remove('visible');
            }
            playSound('passive');
        }

        function toggleRightHand() {
            rightHandVisible = !rightHandVisible;
            const rightHand = document.getElementById('right-hand');
            
            if (rightHandVisible) {
                rightHand.classList.add('visible');
                // Hide other hands
                document.getElementById('left-hand').classList.remove('visible');
                document.getElementById('conscious-hand').classList.remove('visible');
                leftHandVisible = false;
                consciousHandVisible = false;
            } else {
                rightHand.classList.remove('visible');
            }
            playSound('passive');
        }

        function toggleConsciousHand() {
            consciousHandVisible = !consciousHandVisible;
            const consciousHand = document.getElementById('conscious-hand');
            
            if (consciousHandVisible) {
                consciousHand.classList.add('visible');
                // Hide other hands
                document.getElementById('left-hand').classList.remove('visible');
                document.getElementById('right-hand').classList.remove('visible');
                leftHandVisible = false;
                rightHandVisible = false;
            } else {
                consciousHand.classList.remove('visible');
            }
            playSound('passive');
        }

        function toggleMySpace() {
            if (mySpaceAnimating) return; // Prevent multiple animations
            
            mySpaceAnimating = true;
            mySpaceExpanded = !mySpaceExpanded;
            
            const targetRadius = mySpaceExpanded ? expandedRadius : collapsedRadius;
            
            // Animate each grid panel one by one
            gridObjects.forEach((panel, index) => {
                // Stagger the animation for each panel
                setTimeout(() => {
                    // Calculate new position on sphere
                    const currentPos = panel.position.clone().normalize();
                    const targetPos = currentPos.multiplyScalar(targetRadius);
                    
                    gsap.to(panel.position, {
                        duration: 0.6,
                        x: targetPos.x,
                        y: targetPos.y,
                        z: targetPos.z,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            // Make panel look at center
                            panel.lookAt(0, 0, 0);
                            
                            // Mark animation complete on last panel
                            if (index === gridObjects.length - 1) {
                                mySpaceAnimating = false;
                            }
                        }
                    });
                    
                    // Also animate opacity for collapse effect
                    gsap.to(panel.material, {
                        duration: 0.6,
                        opacity: mySpaceExpanded ? 0.2 : 0.1,
                        ease: 'power2.inOut'
                    });
                    
                }, index * 20); // 20ms delay between each panel
            });
            
            playSound('active');
        }

        function togglePocket() {
            pocketVisible = !pocketVisible;
            const pocketPanel = document.getElementById('pocket-panel');
            
            if (pocketVisible) {
                pocketPanel.classList.add('visible');
            } else {
                pocketPanel.classList.remove('visible');
            }
            
            playSound('passive');
        }

        function initPocket() {
            const pocketGrid = document.getElementById('pocket-grid');
            
            // Create 20 pocket slots
            for (let i = 0; i < maxPocketSlots; i++) {
                const slot = document.createElement('div');
                slot.className = 'pocket-slot empty';
                slot.setAttribute('data-slot', i);
                
                // Slot number
                const slotNumber = document.createElement('div');
                slotNumber.className = 'pocket-slot-number';
                slotNumber.textContent = i + 1;
                slot.appendChild(slotNumber);
                
                // Slot content (icon + text)
                const slotContent = document.createElement('div');
                slotContent.className = 'pocket-slot-content';
                
                const slotIcon = document.createElement('div');
                slotIcon.className = 'pocket-slot-icon';
                slotIcon.textContent = '📦';
                slotContent.appendChild(slotIcon);
                
                const slotText = document.createElement('div');
                slotText.textContent = 'Empty';
                slotContent.appendChild(slotText);
                
                slot.appendChild(slotContent);
                
                // Click handler
                slot.addEventListener('click', () => {
                    handlePocketSlotClick(i);
                });
                
                pocketGrid.appendChild(slot);
            }
        }

        function handlePocketSlotClick(slotIndex) {
            const slot = pocketItems[slotIndex];
            
            console.log(`Pocket slot ${slotIndex} clicked`);
            playSound('active');
            
            if (!slot.occupied) {
                // Empty slot - could add item here
                console.log('Empty slot - ready to add item');
            } else if (slot.deployed) {
                // Item is deployed in scene - recall it
                console.log('Recalling item from scene');
                slot.deployed = false;
                updatePocketSlot(slotIndex);
            } else {
                // Item is in pocket - deploy it
                console.log('Deploying item to scene');
                slot.deployed = true;
                updatePocketSlot(slotIndex);
            }
        }

        function updatePocketSlot(slotIndex) {
            const slot = pocketItems[slotIndex];
            const slotElement = document.querySelector(`[data-slot="${slotIndex}"]`);
            
            if (!slotElement) return;
            
            // Update visual state
            slotElement.classList.remove('empty', 'in-scene');
            
            if (!slot.occupied) {
                slotElement.classList.add('empty');
            } else if (slot.deployed) {
                slotElement.classList.add('in-scene');
            }
            
            // Update transparency based on state
            if (slot.deployed) {
                slotElement.style.opacity = '0.2'; // Item out in scene (20%)
            } else {
                slotElement.style.opacity = '0.35'; // Item in pocket (35%)
            }
        }

        // Mobile controls
        let joystickActive = false;
        let joystickStartPos = { x: 0, y: 0 };
        let currentTransformMode = null; // 'position', 'rotation', 'scale'

        // Panel drag functionality
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let panelStartX = 20;
        let panelStartY = 20;

        // Sound effects
        function playSound(type) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'hover') {
                oscillator.frequency.value = 600;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } else if (type === 'active') {
                oscillator.frequency.value = 800;
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
            } else if (type === 'passive') {
                oscillator.frequency.value = 400;
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            }
        }

        // Initialize scene
        function init() {
            // Scene
            scene = new THREE.Scene();

            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 15);

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            document.getElementById('canvas-container').appendChild(renderer.domElement);

            // Outer sphere with gradient
            const sphereGeometry = new THREE.SphereGeometry(30, 64, 64);
            const sphereMaterial = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                uniforms: {
                    color1: { value: new THREE.Color(0x333333) },
                    color2: { value: new THREE.Color(0xffffff) }
                },
                vertexShader: `
                    varying vec3 vPosition;
                    void main() {
                        vPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 color1;
                    uniform vec3 color2;
                    varying vec3 vPosition;
                    void main() {
                        float mixValue = (vPosition.y + 30.0) / 60.0;
                        gl_FragColor = vec4(mix(color1, color2, mixValue), 1.0);
                    }
                `
            });
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            scene.add(sphere);

            // Grid plane at 0, -5, 0
            const gridSize = 50;
            const gridDivisions = 50;
            const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xffffff, 0xffffff);
            gridHelper.position.set(0, -5, 0);
            gridHelper.material.opacity = 0.3;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);

            // Grid sphere
            const gridRadius = 25;
            const segments = 8;
            const gridGeometry = new THREE.PlaneGeometry(3, 3);
            
            for (let lat = 0; lat < segments; lat++) {
                for (let lon = 0; lon < segments * 2; lon++) {
                    const phi = (lat / segments) * Math.PI;
                    const theta = (lon / (segments * 2)) * Math.PI * 2;
                    
                    const x = gridRadius * Math.sin(phi) * Math.cos(theta);
                    const y = gridRadius * Math.cos(phi);
                    const z = gridRadius * Math.sin(phi) * Math.sin(theta);
                    
                    const gridMaterial = new THREE.MeshBasicMaterial({
                        color: 0xeeeeee,
                        transparent: true,
                        opacity: 0.2,
                        side: THREE.DoubleSide
                    });
                    
                    const gridPanel = new THREE.Mesh(gridGeometry, gridMaterial);
                    gridPanel.position.set(x, y, z);
                    gridPanel.lookAt(0, 0, 0);
                    gridPanel.userData = { 
                        type: 'grid',
                        label: `Grid ${lat}-${lon}`,
                        originalColor: 0xeeeeee,
                        originalPosition: { x, y, z }
                    };
                    
                    scene.add(gridPanel);
                    gridObjects.push(gridPanel);
                    interactiveObjects.push(gridPanel);
                    
                    // Add grid lines
                    const edgesGeometry = new THREE.EdgesGeometry(gridGeometry);
                    const edgesMaterial = new THREE.LineBasicMaterial({ 
                        color: 0xeeeeee, 
                        opacity: 0.3, 
                        transparent: true 
                    });
                    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                    gridPanel.add(edges);
                }
            }

            // Journal pages - now square and positioned on grid
            const pageData = [
                { title: 'Morning\nRoutine', color: 0x4A90E2, lat: 2, lon: 0 },
                { title: 'Job\nRoutine', color: 0xF5A623, lat: 4, lon: 4 },
                { title: 'Before Bed\nRoutine', color: 0x9013FE, lat: 6, lon: 8 }
            ];

            pageData.forEach((data, index) => {
                // Calculate position on grid sphere
                const phi = (data.lat / 8) * Math.PI;
                const theta = (data.lon / 16) * 2 * Math.PI;
                
                const x = gridRadius * Math.sin(phi) * Math.cos(theta);
                const y = gridRadius * Math.cos(phi);
                const z = gridRadius * Math.sin(phi) * Math.sin(theta);
                
                // Square geometry (2.5 x 2.5)
                const pageGeometry = new THREE.BoxGeometry(2.5, 2.5, 0.1);
                const pageMaterial = new THREE.MeshPhongMaterial({
                    color: data.color,
                    transparent: true,
                    opacity: 0.8,
                    shininess: 100
                });
                
                const page = new THREE.Mesh(pageGeometry, pageMaterial);
                page.position.set(x, y, z);
                page.lookAt(0, 0, 0); // Face center
                page.userData = {
                    type: 'page',
                    title: data.title.replace('\n', ' '),
                    index: index,
                    originalColor: data.color,
                    originalPosition: { x, y, z }
                };
                
                scene.add(page);
                journalPages.push(page);
                interactiveObjects.push(page);

                // Add text using canvas
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 40px Orbitron, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const lines = data.title.split('\n');
                lines.forEach((line, i) => {
                    ctx.fillText(line, 256, 256 + (i - 0.5) * 50);
                });
                
                const texture = new THREE.CanvasTexture(canvas);
                const textMaterial = new THREE.MeshBasicMaterial({ 
                    map: texture, 
                    transparent: true,
                    side: THREE.DoubleSide
                });
                const textPlane = new THREE.PlaneGeometry(2.3, 2.3);
                const textMesh = new THREE.Mesh(textPlane, textMaterial);
                textMesh.position.z = 0.06;
                page.add(textMesh);
            });

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            scene.add(ambientLight);

            const pointLight1 = new THREE.PointLight(0x4A90E2, 1, 100);
            pointLight1.position.set(10, 10, 10);
            scene.add(pointLight1);

            const pointLight2 = new THREE.PointLight(0xF5A623, 1, 100);
            pointLight2.position.set(-10, -10, 10);
            scene.add(pointLight2);

            // Event listeners
            renderer.domElement.addEventListener('mousemove', onMouseMove);
            renderer.domElement.addEventListener('mousedown', onMouseDown);
            renderer.domElement.addEventListener('mouseup', onMouseUp);
            window.addEventListener('resize', onResize);

            // Panel controls
            setupPanelControls();

            // Keyboard controls
            window.addEventListener('keydown', (e) => {
                const key = e.key.toLowerCase();
                if (key in keys) {
                    keys[key] = true;
                    // Add visual feedback for C key (FPS mode)
                    if (key === 'c') {
                        renderer.domElement.parentElement.classList.add('fps-mode');
                    }
                }
                // FAQ panel toggle
                if (key === 'q') {
                    const faqPanel = document.getElementById('faq-panel');
                    faqPanel.classList.toggle('visible');
                    playSound('passive');
                }
                // Inspector panel toggle
                if (key === 'x') {
                    const inspectorPanel = document.getElementById('inspector-panel');
                    inspectorPanel.classList.toggle('visible');
                    playSound('passive');
                }
                // Docks toggle
                if (key === 'z') {
                    docksVisible = !docksVisible;
                    const docks = document.querySelectorAll('.dock');
                    docks.forEach(dock => {
                        if (docksVisible) {
                            dock.classList.remove('hidden');
                        } else {
                            dock.classList.add('hidden');
                        }
                    });
                    playSound('passive');
                }
                // Reset camera position
                if (key === 'o') {
                    gsap.to(camera.position, {
                        duration: 1.5,
                        x: 0,
                        y: 0,
                        z: 10,
                        ease: 'power2.inOut'
                    });
                    camera.quaternion.set(0, 0, 0, 1); // Reset rotation
                    playSound('active');
                }
                // Left Hand toggle (Left Shift)
                if (e.key === 'Shift' && e.location === 1) { // Left Shift
                    e.preventDefault();
                    toggleLeftHand();
                }
                // Right Hand toggle (Right Shift)
                if (e.key === 'Shift' && e.location === 2) { // Right Shift
                    e.preventDefault();
                    toggleRightHand();
                }
                // Conscious Hand toggle (Enter)
                if (e.key === 'Enter') {
                    e.preventDefault();
                    toggleConsciousHand();
                }
                // MySpace toggle (0 key)
                if (e.key === '0') {
                    e.preventDefault();
                    toggleMySpace();
                }
                // Pocket toggle (9 key)
                if (e.key === '9') {
                    e.preventDefault();
                    togglePocket();
                }
            });

            window.addEventListener('keyup', (e) => {
                const key = e.key.toLowerCase();
                if (key in keys) {
                    keys[key] = false;
                    // Remove visual feedback for C key
                    if (key === 'c') {
                        renderer.domElement.parentElement.classList.remove('fps-mode');
                    }
                }
            });

            // Mobile controls
            setupMobileControls();
            setupTransformPanel();
            setupActionGrid();
            setupHamburgerMenus();
            setupDockDragDrop();
            setupTimer();
            setupSearchPanel();
            setupHandMenus();
            initPocket();

            // Apply default theme
            applyTheme('silver');

            // Start animation
            animate();
        }

        function onMouseMove(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // Mouse look - only when holding C key (Metroid Prime style)
            if (keys.c && !isRotating) {
                const deltaX = event.clientX - lastMouseX;
                const deltaY = event.clientY - lastMouseY;
                
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;

                // Apply FPS-style rotation
                if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
                    // Horizontal rotation (yaw) - rotate around world Y axis
                    camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -deltaX * lookSensitivity);
                    
                    // Vertical rotation (pitch) - rotate around camera's local X axis
                    const pitchAxis = new THREE.Vector3(1, 0, 0);
                    const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(pitchAxis, -deltaY * lookSensitivity);
                    camera.quaternion.multiply(pitchQuaternion);
                    
                    // Clamp pitch to prevent looking too far up or down
                    const forward = new THREE.Vector3(0, 0, -1);
                    forward.applyQuaternion(camera.quaternion);
                    
                    // If looking too far down, clamp it
                    if (forward.y < -0.99) {
                        const correctionAxis = new THREE.Vector3(1, 0, 0);
                        const correctionAngle = -0.01;
                        const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, correctionAngle);
                        camera.quaternion.multiply(correctionQuaternion);
                    }
                    // If looking too far up, clamp it
                    else if (forward.y > 0.99) {
                        const correctionAxis = new THREE.Vector3(1, 0, 0);
                        const correctionAngle = 0.01;
                        const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, correctionAngle);
                        camera.quaternion.multiply(correctionQuaternion);
                    }
                }
            } else {
                // Update last mouse position even when not looking
                lastMouseX = event.clientX;
                lastMouseY = event.clientY;
            }

            // Orbit rotation (when dragging without C key)
            if (isRotating && !keys.c) {
                const deltaX = event.clientX - previousMousePosition.x;
                const deltaY = event.clientY - previousMousePosition.y;
                
                const rotationSpeed = 0.005;
                const euler = new THREE.Euler(
                    deltaY * rotationSpeed,
                    deltaX * rotationSpeed,
                    0,
                    'XYZ'
                );
                
                const quaternion = new THREE.Quaternion().setFromEuler(euler);
                camera.position.applyQuaternion(quaternion);
                camera.lookAt(cameraTarget);
                
                previousMousePosition = { x: event.clientX, y: event.clientY };
            }

            // Raycasting for hover
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveObjects);

            if (intersects.length > 0) {
                const hoveredObj = intersects[0].object;
                if (hoveredObj !== hoveredObject) {
                    if (hoveredObject && hoveredObject !== selectedObject) {
                        hoveredObject.material.color.setHex(hoveredObject.userData.originalColor);
                        hoveredObject.material.opacity = hoveredObject.userData.type === 'grid' ? 0.2 : 0.8;
                    }
                    hoveredObject = hoveredObj;
                    if (hoveredObj !== selectedObject) {
                        hoveredObj.material.color.setHex(0x888888);
                        hoveredObj.material.opacity = 0.6;
                    }
                    playSound('hover');
                }
            } else {
                if (hoveredObject && hoveredObject !== selectedObject) {
                    hoveredObject.material.color.setHex(hoveredObject.userData.originalColor);
                    hoveredObject.material.opacity = hoveredObject.userData.type === 'grid' ? 0.2 : 0.8;
                }
                hoveredObject = null;
            }
        }

        function onMouseDown(event) {
            if (event.button === 0) {
                const rect = renderer.domElement.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
                const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
                
                raycaster.setFromCamera({ x, y }, camera);
                const intersects = raycaster.intersectObjects(interactiveObjects);

                if (intersects.length > 0) {
                    const clickedObj = intersects[0].object;
                    
                    // Reset previous selection
                    if (selectedObject) {
                        selectedObject.material.color.setHex(selectedObject.userData.originalColor);
                        selectedObject.material.opacity = selectedObject.userData.type === 'grid' ? 0.2 : 0.8;
                    }
                    
                    selectedObject = clickedObj;
                    clickedObj.material.color.setHex(0x4A90E2);
                    clickedObj.material.opacity = 1.0;
                    playSound('active');
                    
                    // Update UI
                    updateInspectorPanel();
                    
                    // Animate camera
                    gsap.to(camera.position, {
                        duration: 1.5,
                        x: clickedObj.position.x * 1.5,
                        y: clickedObj.position.y * 1.5,
                        z: clickedObj.position.z + 10,
                        ease: 'power2.inOut',
                        onUpdate: () => {
                            camera.lookAt(clickedObj.position);
                        }
                    });
                    
                    gsap.to(cameraTarget, {
                        duration: 1.5,
                        x: clickedObj.position.x,
                        y: clickedObj.position.y,
                        z: clickedObj.position.z,
                        ease: 'power2.inOut'
                    });
                } else {
                    isRotating = true;
                    previousMousePosition = { x: event.clientX, y: event.clientY };
                }
            }
        }

        function onMouseUp() {
            isRotating = false;
        }

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function updateInspectorPanel() {
            if (selectedObject) {
                document.getElementById('selected-name').textContent = 
                    selectedObject.userData.title || selectedObject.userData.label;
                document.getElementById('object-type').textContent = 
                    selectedObject.userData.type === 'page' ? 'Journal Page' : 'Grid Panel';
                document.getElementById('object-position').textContent = 
                    `Position: ${selectedObject.position.x.toFixed(2)}, ${selectedObject.position.y.toFixed(2)}, ${selectedObject.position.z.toFixed(2)}`;
                
                // Update transform panel if it's open
                if (currentTransformMode && document.getElementById('transform-panel').style.display === 'block') {
                    const transformX = document.getElementById('transform-x');
                    const transformY = document.getElementById('transform-y');
                    const transformZ = document.getElementById('transform-z');
                    
                    if (currentTransformMode === 'position') {
                        transformX.value = selectedObject.position.x.toFixed(2);
                        transformY.value = selectedObject.position.y.toFixed(2);
                        transformZ.value = selectedObject.position.z.toFixed(2);
                    } else if (currentTransformMode === 'rotation') {
                        transformX.value = (selectedObject.rotation.x * 180 / Math.PI).toFixed(2);
                        transformY.value = (selectedObject.rotation.y * 180 / Math.PI).toFixed(2);
                        transformZ.value = (selectedObject.rotation.z * 180 / Math.PI).toFixed(2);
                    } else if (currentTransformMode === 'scale') {
                        transformX.value = selectedObject.scale.x.toFixed(2);
                        transformY.value = selectedObject.scale.y.toFixed(2);
                        transformZ.value = selectedObject.scale.z.toFixed(2);
                    }
                }
                
                document.getElementById('object-details').style.display = 'block';
            } else {
                document.getElementById('selected-name').textContent = 'None';
                document.getElementById('object-details').style.display = 'none';
            }
        }

        function setupPanelControls() {
            const panel = document.getElementById('inspector-panel');
            const header = document.getElementById('panel-header');
            const minimizeBtn = document.getElementById('minimize-btn');
            const closeBtn = document.getElementById('close-btn');
            const transparencySlider = document.getElementById('transparency-slider');
            const transparencyValue = document.getElementById('transparency-value');

            // Minimize
            minimizeBtn.addEventListener('click', () => {
                panel.classList.toggle('minimized');
                document.getElementById('panel-content').classList.toggle('hidden');
                minimizeBtn.textContent = panel.classList.contains('minimized') ? '□' : '_';
            });

            // Close (hide via toggle class)
            closeBtn.addEventListener('click', () => {
                panel.classList.remove('visible');
                playSound('passive');
            });

            // Transparency
            transparencySlider.addEventListener('input', (e) => {
                const value = e.target.value;
                transparencyValue.textContent = value;
                if (selectedObject) {
                    selectedObject.material.opacity = value / 100;
                }
            });

            // Drag
            header.addEventListener('mousedown', (e) => {
                isDragging = true;
                dragStartX = e.clientX - panel.offsetLeft;
                dragStartY = e.clientY - panel.offsetTop;
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    panel.style.left = (e.clientX - dragStartX) + 'px';
                    panel.style.top = (e.clientY - dragStartY) + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // Summon buttons
            const summonCenter = document.getElementById('summon-center');
            const summonHands = document.getElementById('summon-hands');
            const summonFolder = document.getElementById('summon-folder');

            summonCenter.addEventListener('click', () => {
                if (selectedObject) {
                    gsap.to(selectedObject.position, {
                        duration: 1.2,
                        x: 0,
                        y: 0,
                        z: 5,
                        ease: 'power2.inOut'
                    });
                    gsap.to(selectedObject.rotation, {
                        duration: 1.2,
                        x: 0,
                        y: 0,
                        z: 0,
                        ease: 'power2.inOut'
                    });
                    playSound('active');
                }
            });

            summonHands.addEventListener('click', () => {
                if (selectedObject) {
                    // Position in front of camera
                    const forward = new THREE.Vector3(0, 0, -3);
                    forward.applyQuaternion(camera.quaternion);
                    const targetPos = camera.position.clone().add(forward);
                    
                    gsap.to(selectedObject.position, {
                        duration: 1.0,
                        x: targetPos.x,
                        y: targetPos.y,
                        z: targetPos.z,
                        ease: 'power2.inOut'
                    });
                    selectedObject.lookAt(camera.position);
                    playSound('active');
                }
            });

            summonFolder.addEventListener('click', () => {
                if (selectedObject && selectedObject.userData.originalPosition) {
                    const orig = selectedObject.userData.originalPosition;
                    gsap.to(selectedObject.position, {
                        duration: 1.2,
                        x: orig.x,
                        y: orig.y,
                        z: orig.z,
                        ease: 'power2.inOut'
                    });
                    // Reset rotation to face center
                    gsap.to(selectedObject.rotation, {
                        duration: 1.2,
                        x: 0,
                        y: 0,
                        z: 0,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            selectedObject.lookAt(0, 0, 0);
                        }
                    });
                    playSound('active');
                }
            });

            // FAQ panel close
            const faqClose = document.getElementById('faq-close');
            faqClose.addEventListener('click', () => {
                document.getElementById('faq-panel').classList.remove('visible');
                playSound('passive');
            });
        }

        function setupMobileControls() {
            const joystickStick = document.getElementById('joystick-stick');
            const joystickBase = joystickStick.parentElement;

            // Joystick touch/mouse controls
            joystickStick.addEventListener('mousedown', startJoystick);
            joystickStick.addEventListener('touchstart', startJoystick);

            function startJoystick(e) {
                e.preventDefault();
                joystickActive = true;
                const rect = joystickBase.getBoundingClientRect();
                joystickStartPos = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };

                document.addEventListener('mousemove', moveJoystick);
                document.addEventListener('touchmove', moveJoystick);
                document.addEventListener('mouseup', stopJoystick);
                document.addEventListener('touchend', stopJoystick);
            }

            function moveJoystick(e) {
                if (!joystickActive) return;
                
                e.preventDefault(); // Prevent scrolling on mobile
                
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;

                const deltaX = clientX - joystickStartPos.x;
                const deltaY = clientY - joystickStartPos.y;

                const distance = Math.min(45, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
                const angle = Math.atan2(deltaY, deltaX);

                const maxOffset = 45;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;

                joystickStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

                // Move camera based on joystick
                const moveX = (offsetX / maxOffset) * moveSpeed;
                const moveZ = (offsetY / maxOffset) * moveSpeed;

                camera.position.x += moveX;
                camera.position.z += moveZ;
                cameraTarget.x += moveX;
                cameraTarget.z += moveZ;
            }

            function stopJoystick() {
                joystickActive = false;
                joystickStick.style.transform = 'translate(-50%, -50%)';
                document.removeEventListener('mousemove', moveJoystick);
                document.removeEventListener('touchmove', moveJoystick);
                document.removeEventListener('mouseup', stopJoystick);
                document.removeEventListener('touchend', stopJoystick);
            }

            // Mobile touch for FPS camera look (single finger on canvas)
            const canvas = renderer.domElement;
            let touchStartX = 0;
            let touchStartY = 0;
            let isTouchLooking = false;

            canvas.addEventListener('touchstart', (e) => {
                // Only handle single finger touch for camera look
                if (e.touches.length === 1) {
                    const touch = e.touches[0];
                    touchStartX = touch.clientX;
                    touchStartY = touch.clientY;
                    isTouchLooking = true;
                }
            });

            canvas.addEventListener('touchmove', (e) => {
                if (isTouchLooking && e.touches.length === 1) {
                    e.preventDefault();
                    const touch = e.touches[0];
                    
                    const deltaX = touch.clientX - touchStartX;
                    const deltaY = touch.clientY - touchStartY;
                    
                    touchStartX = touch.clientX;
                    touchStartY = touch.clientY;

                    // Apply FPS-style rotation (same as C key mouse look)
                    if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) {
                        // Horizontal rotation (yaw)
                        camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -deltaX * lookSensitivity * 2);
                        
                        // Vertical rotation (pitch)
                        const pitchAxis = new THREE.Vector3(1, 0, 0);
                        const pitchQuaternion = new THREE.Quaternion().setFromAxisAngle(pitchAxis, -deltaY * lookSensitivity * 2);
                        camera.quaternion.multiply(pitchQuaternion);
                        
                        // Clamp pitch
                        const forward = new THREE.Vector3(0, 0, -1);
                        forward.applyQuaternion(camera.quaternion);
                        
                        if (forward.y < -0.99) {
                            const correctionAxis = new THREE.Vector3(1, 0, 0);
                            const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, -0.01);
                            camera.quaternion.multiply(correctionQuaternion);
                        } else if (forward.y > 0.99) {
                            const correctionAxis = new THREE.Vector3(1, 0, 0);
                            const correctionQuaternion = new THREE.Quaternion().setFromAxisAngle(correctionAxis, 0.01);
                            camera.quaternion.multiply(correctionQuaternion);
                        }
                    }
                }
            });

            canvas.addEventListener('touchend', () => {
                isTouchLooking = false;
            });
        }

        function setupTransformPanel() {
            const transformPanel = document.getElementById('transform-panel');
            const transformClose = document.getElementById('transform-close');
            const transformTitle = document.getElementById('transform-title');
            
            const btnPos = document.getElementById('btn-pos');
            const btnRot = document.getElementById('btn-rot');
            const btnScale = document.getElementById('btn-scale');

            const transformX = document.getElementById('transform-x');
            const transformY = document.getElementById('transform-y');
            const transformZ = document.getElementById('transform-z');
            const stepSize = document.getElementById('step-size');

            transformClose.addEventListener('click', () => {
                transformPanel.style.display = 'none';
                currentTransformMode = null;
                btnPos.classList.remove('active');
                btnRot.classList.remove('active');
                btnScale.classList.remove('active');
            });

            btnPos.addEventListener('click', () => {
                showTransformPanel('POSITION', 'position', btnPos);
            });

            btnRot.addEventListener('click', () => {
                showTransformPanel('ROTATION', 'rotation', btnRot);
            });

            btnScale.addEventListener('click', () => {
                showTransformPanel('SCALE', 'scale', btnScale);
            });

            function showTransformPanel(title, mode, button) {
                transformTitle.textContent = title;
                currentTransformMode = mode;
                transformPanel.style.display = 'block';

                // Update active states
                btnPos.classList.remove('active');
                btnRot.classList.remove('active');
                btnScale.classList.remove('active');
                button.classList.add('active');

                // Update values based on selected object
                if (selectedObject) {
                    if (mode === 'position') {
                        transformX.value = selectedObject.position.x.toFixed(2);
                        transformY.value = selectedObject.position.y.toFixed(2);
                        transformZ.value = selectedObject.position.z.toFixed(2);
                    } else if (mode === 'rotation') {
                        transformX.value = (selectedObject.rotation.x * 180 / Math.PI).toFixed(2);
                        transformY.value = (selectedObject.rotation.y * 180 / Math.PI).toFixed(2);
                        transformZ.value = (selectedObject.rotation.z * 180 / Math.PI).toFixed(2);
                    } else if (mode === 'scale') {
                        transformX.value = selectedObject.scale.x.toFixed(2);
                        transformY.value = selectedObject.scale.y.toFixed(2);
                        transformZ.value = selectedObject.scale.z.toFixed(2);
                    }
                }
            }

            // Apply transform changes
            function applyTransform() {
                if (!selectedObject || !currentTransformMode) return;

                const x = parseFloat(transformX.value) || 0;
                const y = parseFloat(transformY.value) || 0;
                const z = parseFloat(transformZ.value) || 0;

                if (currentTransformMode === 'position') {
                    selectedObject.position.set(x, y, z);
                } else if (currentTransformMode === 'rotation') {
                    selectedObject.rotation.set(
                        x * Math.PI / 180,
                        y * Math.PI / 180,
                        z * Math.PI / 180
                    );
                } else if (currentTransformMode === 'scale') {
                    selectedObject.scale.set(x, y, z);
                }

                updateInspectorPanel();
                playSound('active');
            }

            // Submit button applies changes
            const transformSubmit = document.getElementById('transform-submit');
            transformSubmit.addEventListener('click', () => {
                applyTransform();
            });

            // Arrow keys for fine control (but don't apply immediately)
            [transformX, transformY, transformZ].forEach(input => {
                input.addEventListener('keydown', (e) => {
                    const step = parseFloat(stepSize.value) || 1;
                    const currentValue = parseFloat(input.value) || 0;

                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        input.value = (currentValue + step).toFixed(2);
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        input.value = (currentValue - step).toFixed(2);
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        applyTransform();
                    }
                });
            });
        }

        function setupActionGrid() {
            const actionButtons = document.querySelectorAll('.action-btn');
            
            actionButtons.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    // Toggle active state
                    btn.classList.toggle('active');
                    
                    // Custom action for each button
                    console.log(`Action button ${index + 1} clicked`);
                    playSound('passive');
                    
                    // You can add specific functionality for each button here
                    // For example, save states, trigger animations, etc.
                });
            });
        }

        function setupHamburgerMenus() {
            const leftHamburger = document.getElementById('left-hamburger');
            const rightHamburger = document.getElementById('right-hamburger');
            const leftMenu = document.getElementById('left-menu');
            const rightMenu = document.getElementById('right-menu');
            const leftBreadcrumb = document.getElementById('left-breadcrumb');
            const rightBreadcrumb = document.getElementById('right-breadcrumb');

            // Toggle left menu
            leftHamburger.addEventListener('click', () => {
                leftMenu.classList.toggle('open');
                leftHamburger.classList.toggle('menu-open');
                playSound('passive');
            });

            // Toggle right menu
            rightHamburger.addEventListener('click', () => {
                rightMenu.classList.toggle('open');
                rightHamburger.classList.toggle('menu-open');
                playSound('passive');
            });

            // Handle menu item clicks for both menus
            const allMenuItems = document.querySelectorAll('.menu-item');
            allMenuItems.forEach(item => {
                const header = item.querySelector('.menu-item-header');
                
                header.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Toggle submenu expansion
                    item.classList.toggle('expanded');
                    
                    const page = item.getAttribute('data-page');
                    const isLeftMenu = item.closest('#left-menu');
                    const breadcrumb = isLeftMenu ? leftBreadcrumb : rightBreadcrumb;
                    const menuTitle = isLeftMenu ? 'Admin & System' : 'Navigation';
                    
                    // Update breadcrumb
                    const pageName = header.querySelector('span').textContent;
                    breadcrumb.innerHTML = `
                        <span class="breadcrumb-item" data-level="root">${menuTitle}</span>
                        <span class="breadcrumb-separator">›</span>
                        <span class="breadcrumb-item breadcrumb-current">${pageName}</span>
                    `;
                    
                    playSound('passive');
                });
            });

            // Handle submenu item clicks
            const allSubmenuItems = document.querySelectorAll('.submenu-item');
            allSubmenuItems.forEach(subitem => {
                subitem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    const submenuId = subitem.getAttribute('data-submenu');
                    
                    // Handle special admin items
                    if (submenuId === 'admin-restart') {
                        document.getElementById('restart-prompt').classList.add('visible');
                        playSound('active');
                        return;
                    }
                    
                    if (submenuId === 'admin-theme') {
                        initThemeSelector();
                        document.getElementById('theme-prompt').classList.add('visible');
                        playSound('active');
                        return;
                    }
                    
                    const parentItem = subitem.closest('.menu-item');
                    const page = parentItem.getAttribute('data-page');
                    const isLeftMenu = subitem.closest('#left-menu');
                    const breadcrumb = isLeftMenu ? leftBreadcrumb : rightBreadcrumb;
                    const menuTitle = isLeftMenu ? 'Admin & System' : 'Navigation';
                    const pageName = parentItem.querySelector('.menu-item-header span').textContent;
                    
                    // Update breadcrumb with submenu
                    breadcrumb.innerHTML = `
                        <span class="breadcrumb-item" data-level="root">${menuTitle}</span>
                        <span class="breadcrumb-separator">›</span>
                        <span class="breadcrumb-item" data-level="page">${pageName}</span>
                        <span class="breadcrumb-separator">›</span>
                        <span class="breadcrumb-item breadcrumb-current">${subitem.textContent}</span>
                    `;
                    
                    playSound('active');
                    
                    console.log('Submenu clicked:', submenuId, 'Parent:', page);
                    // You can add navigation logic here
                });
            });

            // Breadcrumb navigation
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('breadcrumb-item') && e.target.getAttribute('data-level')) {
                    const level = e.target.getAttribute('data-level');
                    const isLeftMenu = e.target.closest('#left-menu');
                    const breadcrumb = isLeftMenu ? leftBreadcrumb : rightBreadcrumb;
                    const menuTitle = isLeftMenu ? 'Admin & System' : 'Navigation';
                    
                    if (level === 'root') {
                        breadcrumb.innerHTML = `
                            <span class="breadcrumb-item breadcrumb-current">${menuTitle}</span>
                        `;
                        // Collapse all submenus
                        const menu = isLeftMenu ? leftMenu : rightMenu;
                        menu.querySelectorAll('.menu-item').forEach(item => {
                            item.classList.remove('expanded');
                        });
                    } else if (level === 'page') {
                        const pageName = e.target.textContent;
                        breadcrumb.innerHTML = `
                            <span class="breadcrumb-item" data-level="root">${menuTitle}</span>
                            <span class="breadcrumb-separator">›</span>
                            <span class="breadcrumb-item breadcrumb-current">${pageName}</span>
                        `;
                    }
                    playSound('passive');
                }
            });

            // Close menus when clicking outside
            document.addEventListener('click', (e) => {
                if (!leftMenu.contains(e.target) && !leftHamburger.contains(e.target)) {
                    leftMenu.classList.remove('open');
                    leftHamburger.classList.remove('menu-open');
                }
                if (!rightMenu.contains(e.target) && !rightHamburger.contains(e.target)) {
                    rightMenu.classList.remove('open');
                    rightHamburger.classList.remove('menu-open');
                }
            });
        }

        function setupDockDragDrop() {
            const dockItems = document.querySelectorAll('.dock-item');
            const docks = document.querySelectorAll('.dock');
            let draggedItem = null;

            dockItems.forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    draggedItem = item;
                    item.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    playSound('hover');
                });

                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                    draggedItem = null;
                });
            });

            docks.forEach(dock => {
                dock.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    dock.classList.add('drag-over');
                });

                dock.addEventListener('dragleave', () => {
                    dock.classList.remove('drag-over');
                });

                dock.addEventListener('drop', (e) => {
                    e.preventDefault();
                    dock.classList.remove('drag-over');
                    
                    if (draggedItem && draggedItem.parentElement !== dock) {
                        // Remove from old dock
                        draggedItem.parentElement.removeChild(draggedItem);
                        
                        // Add to new dock
                        dock.appendChild(draggedItem);
                        
                        playSound('active');
                    }
                });
            });
        }

        function setupTimer() {
            const timerElement = document.getElementById('session-timer');
            
            function updateTimer() {
                const elapsed = Date.now() - sessionStartTime;
                const hours = Math.floor(elapsed / 3600000);
                const minutes = Math.floor((elapsed % 3600000) / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                
                timerElement.textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Update timer every second
            timerInterval = setInterval(updateTimer, 1000);
            updateTimer(); // Initial call
        }

        function setupSearchPanel() {
            const searchPanel = document.getElementById('search-panel');
            const searchInput = document.getElementById('search-input');
            
            searchPanel.addEventListener('click', (e) => {
                if (searchPanel.classList.contains('collapsed')) {
                    searchPanel.classList.remove('collapsed');
                    searchPanel.classList.add('expanded');
                    playSound('passive');
                    // Focus input after animation
                    setTimeout(() => searchInput.focus(), 300);
                }
            });
            
            // Click outside to collapse
            document.addEventListener('click', (e) => {
                if (!searchPanel.contains(e.target) && searchPanel.classList.contains('expanded')) {
                    searchPanel.classList.remove('expanded');
                    searchPanel.classList.add('collapsed');
                    searchInput.value = ''; // Clear on collapse
                }
            });
            
            // Search functionality
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                console.log('Search query:', query);
                // You can add actual search functionality here
            });
            
            // Prevent Enter from closing
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    console.log('Search submitted:', searchInput.value);
                    // Add search action here
                }
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            
            // Camera breathing effect
            breathTime += 0.016 * breathSpeed; // Assuming ~60fps
            const breathOffset = Math.sin(breathTime) * breathIntensity;
            
            // Apply subtle breathing to camera position (up/down)
            if (!keys.r && !keys.f) { // Only when not manually moving up/down
                const breathDelta = breathOffset - (camera.userData.lastBreathOffset || 0);
                camera.position.y += breathDelta;
                camera.userData.lastBreathOffset = breathOffset;
            } else {
                camera.userData.lastBreathOffset = 0;
            }
            
            // WASD camera movement
            if (keys.w) {
                const forward = new THREE.Vector3(0, 0, -1);
                forward.applyQuaternion(camera.quaternion);
                camera.position.add(forward.multiplyScalar(moveSpeed));
            }
            if (keys.s) {
                const backward = new THREE.Vector3(0, 0, 1);
                backward.applyQuaternion(camera.quaternion);
                camera.position.add(backward.multiplyScalar(moveSpeed));
            }
            if (keys.a) {
                const left = new THREE.Vector3(-1, 0, 0);
                left.applyQuaternion(camera.quaternion);
                camera.position.add(left.multiplyScalar(moveSpeed));
            }
            if (keys.d) {
                const right = new THREE.Vector3(1, 0, 0);
                right.applyQuaternion(camera.quaternion);
                camera.position.add(right.multiplyScalar(moveSpeed));
            }
            if (keys.r) {
                camera.position.y += moveSpeed;
            }
            if (keys.f) {
                camera.position.y -= moveSpeed;
            }
            
            renderer.render(scene, camera);
        }

        // Start
        init();

        // Make functions globally accessible for inline handlers
        window.showWisdomPrompt = showWisdomPrompt;
