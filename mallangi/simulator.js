// simulator.js - Squishy Physics Simulator
const MallangSimulator = (() => {
  let activeSquishy = null;
  let isInteracting = false;
  let isDragging = false;

  let dragStartX = 0;
  let dragStartY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  // Spring physics variables
  let scaleX = 1.0;
  let scaleY = 1.0;
  let velX = 0.0;
  let velY = 0.0;

  const K = 300.0; // Spring constant
  const DAMPING = 8.0; // Damping constant
  let lastTime = 0;
  let animationId = null;

  function initSimulator(squishy) {
    activeSquishy = squishy || App.getOwnedMallangs()[0];
    isInteracting = false;
    isDragging = false;
    scaleX = 1.0;
    scaleY = 1.0;
    velX = 0.0;
    velY = 0.0;

    // Ensure crackStage is initialized for wackpu
    if (activeSquishy && activeSquishy.material === 'wackpu' && activeSquishy.crackStage === undefined) {
      activeSquishy.crackStage = 0;
    }

    renderSimulatorUI();
    setupListeners();

    // Start physics loop
    lastTime = performance.now();
    if (animationId) cancelAnimationFrame(animationId);
    physicsLoop(lastTime);
  }

  function renderSimulatorUI() {
    const selector = document.getElementById('sim-selector');
    if (selector) {
      const owned = App.getOwnedMallangs();
      selector.innerHTML = owned.map(m => `
        <option value="${m.id}" ${m.id === activeSquishy.id ? 'selected' : ''}>
          ${m.name} (${m.rarity})
        </option>
      `).join('');
    }

    // Add re-wax coating button for Wack-pu-ball
    const reWaxContainer = document.getElementById('sim-rewax-container');
    if (reWaxContainer) {
      if (activeSquishy && activeSquishy.material === 'wackpu') {
        reWaxContainer.style.display = 'block';
        reWaxContainer.innerHTML = `
          <button id="sim-rewax-btn" class="submit-btn" style="margin-top: 10px; width: 100%; padding: 10px; font-size: 0.9rem;">
            왁스 코팅 새로 입히기 🔄
          </button>
        `;
        document.getElementById('sim-rewax-btn').onclick = () => {
          Sound.playSuccess();
          activeSquishy.crackStage = 0;
          
          const owned = App.getOwnedMallangs();
          const idx = owned.findIndex(m => m.id === activeSquishy.id);
          if (idx !== -1) {
            owned[idx].crackStage = 0;
            App.saveOwnedMallangs(owned);
          }
          updateMallangDisplay();
        };
      } else {
        reWaxContainer.style.display = 'none';
      }
    }

    updateMallangDisplay('smile');
  }

  function updateMallangDisplay(exprOverride) {
    const container = document.getElementById('sim-canvas-container');
    if (!container || !activeSquishy) return;

    // Render the SVG
    container.innerHTML = MallangRenderer.createSVG(activeSquishy, {
      expression: exprOverride || (isInteracting ? 'squeezed' : activeSquishy.face),
      stretchX: scaleX,
      stretchY: scaleY,
      width: 250,
      height: 250
    });
  }

  function setupListeners() {
    const container = document.getElementById('sim-canvas-container');
    if (!container) return;

    // Selector Change
    const selector = document.getElementById('sim-selector');
    if (selector) {
      selector.onchange = (e) => {
        Sound.playClick();
        const id = e.target.value;
        const owned = App.getOwnedMallangs();
        const found = owned.find(m => m.id === id);
        if (found) {
          activeSquishy = found;
          initSimulator(activeSquishy);
        }
      };
    }

    // Mouse & Touch events
    container.onmousedown = (e) => startInteraction(e.clientX, e.clientY);
    window.onmousemove = (e) => moveInteraction(e.clientX, e.clientY);
    window.onmouseup = () => endInteraction();

    container.ontouchstart = (e) => {
      if (e.touches.length > 0) {
        startInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    window.ontouchmove = (e) => {
      if (e.touches.length > 0) {
        moveInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    window.ontouchend = () => endInteraction();
  }

  function startInteraction(clientX, clientY) {
    isInteracting = true;
    isDragging = true;
    dragStartX = clientX;
    dragStartY = clientY;
    currentMouseX = clientX;
    currentMouseY = clientY;

    // Handle Wax Cracking ASMR mechanics
    if (activeSquishy && activeSquishy.material === 'wackpu') {
      if (activeSquishy.crackStage === undefined) {
        activeSquishy.crackStage = 0;
      }
      
      if (activeSquishy.crackStage < 3) {
        activeSquishy.crackStage += 1;
        
        // Save crack stage
        const owned = App.getOwnedMallangs();
        const idx = owned.findIndex(m => m.id === activeSquishy.id);
        if (idx !== -1) {
          owned[idx].crackStage = activeSquishy.crackStage;
          App.saveOwnedMallangs(owned);
        }

        if (activeSquishy.crackStage === 3) {
          Sound.playPop();
        } else {
          Sound.playWaxCrack();
        }
        triggerWaxCrackParticles(clientX, clientY);
      } else {
        Sound.playForMallang(activeSquishy);
      }
    } else {
      Sound.playForMallang(activeSquishy);
    }

    // Squeeze animation (squash in Y, stretch in X)
    velX = 0;
    velY = 0;
    scaleX = 1.3;
    scaleY = 0.75;

    // Trigger visual updates
    updateMallangDisplay('squeezed');
  }

  function triggerWaxCrackParticles(x, y) {
    // Generate little white particles simulating cracking wax pieces
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      p.style.left = x + (Math.random() * 40 - 20) + 'px';
      p.style.top = y + (Math.random() * 40 - 20) + 'px';
      p.style.backgroundColor = '#f8fafc';
      p.style.border = '1px solid #cbd5e1';
      p.style.width = '6px';
      p.style.height = '6px';
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(p);

      const anim = p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${(Math.random() - 0.5) * 80}px, ${(Math.random() - 0.5) * 80 + 30}px) scale(0)`, opacity: 0 }
      ], {
        duration: Math.random() * 400 + 300,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });
      anim.onfinish = () => p.remove();
    }
  }

  function moveInteraction(clientX, clientY) {
    if (!isInteracting || !isDragging) return;
    currentMouseX = clientX;
    currentMouseY = clientY;

    // Wax balls can't be stretched if they are not yet broken!
    if (activeSquishy && activeSquishy.material === 'wackpu' && activeSquishy.crackStage < 3) {
      return;
    }

    const dx = currentMouseX - dragStartX;
    const dy = currentMouseY - dragStartY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 15) {
      // Calculate angle and scale stretching based on drag distance
      const maxStretch = activeSquishy.material === 'needoh' ? 1.8 : 1.6; // NeeDoh stretches more!
      const stretchAmount = Math.min(1.0 + distance / 200.0, maxStretch);
      const compressAmount = 1.0 / Math.sqrt(stretchAmount); // Conserve volume/area!

      // Stretch along the vector. Let's simplify: stretch Y if dragging vertical, X if horizontal
      if (Math.abs(dx) > Math.abs(dy)) {
        scaleX = stretchAmount;
        scaleY = compressAmount;
      } else {
        scaleX = compressAmount;
        scaleY = stretchAmount;
      }
    }
  }

  function endInteraction() {
    if (!isInteracting) return;
    isInteracting = false;
    isDragging = false;

    // Only play release sound if wax ball was already broken or not a wax ball
    if (!(activeSquishy && activeSquishy.material === 'wackpu' && activeSquishy.crackStage < 3)) {
      Sound.playPop();
    }

    // Bounce effect: initialize velocities for recovery
    const dx = currentMouseX - dragStartX;
    const dy = currentMouseY - dragStartY;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 15) {
      // Release from drag stretch
      velX = (1.0 - scaleX) * 20;
      velY = (1.0 - scaleY) * 20;
    } else {
      // Release from squeeze click
      velX = -30.0;
      velY = 30.0;
    }
  }

  function physicsLoop(timestamp) {
    if (!activeSquishy) return;

    const dt = Math.min((timestamp - lastTime) / 1000.0, 0.1); // cap dt at 100ms
    lastTime = timestamp;

    if (!isInteracting) {
      // Custom physics parameters for materials
      let currentK = K;
      let currentDamping = DAMPING;

      if (activeSquishy.material === 'needoh') {
        // Slow-release elastic recovery
        currentK = 18.0;
        currentDamping = 12.0;
      }

      // Spring physics (f = -k*x - c*v)
      const forceX = -currentK * (scaleX - 1.0) - currentDamping * velX;
      velX += forceX * dt;
      scaleX += velX * dt;

      const forceY = -currentK * (scaleY - 1.0) - currentDamping * velY;
      velY += forceY * dt;
      scaleY += velY * dt;

      // Snap to 1.0 if oscillation is tiny
      if (Math.abs(scaleX - 1.0) < 0.005 && Math.abs(velX) < 0.05) {
        scaleX = 1.0;
        velX = 0;
      }
      if (Math.abs(scaleY - 1.0) < 0.005 && Math.abs(velY) < 0.05) {
        scaleY = 1.0;
        velY = 0;
      }

      updateMallangDisplay(activeSquishy.face);
    } else {
      // While dragging, just keep updating screen display
      updateMallangDisplay('squeezed');
    }

    animationId = requestAnimationFrame(physicsLoop);
  }

  function stop() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    // Clean global listeners
    window.onmousemove = null;
    window.onmouseup = null;
    window.ontouchmove = null;
    window.ontouchend = null;
  }

  return {
    init: initSimulator,
    stop: stop
  };
})();

// Export if module system exists
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MallangSimulator;
} else {
  window.MallangSimulator = MallangSimulator;
}
