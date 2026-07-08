// creator.js - DIY Mallang Creator Module
const MallangCreator = (() => {
  let config = {
    id: '',
    name: '',
    shape: 'circle',
    color: '#ffc0cb',
    color2: '#e0f7fa',
    gradient: true,
    face: 'smile',
    accessory: 'none',
    rarity: 'Epic',
    material: 'normal',
    sound: 'normal',
    custom: true
  };

  const RANDOM_NAMES = [
    '말랑단풍', '모찌모찌', '러블리곰', '핑크퐁이', 
    '구름구름', '초코퐁당', '슈크림빵', '밀키스타'
  ];

  function getRandomName() {
    return RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  }

  function initCreator() {
    config = {
      id: 'custom-' + Date.now(),
      name: getRandomName(),
      shape: 'circle',
      color: '#ffc0cb',
      color2: '#e0f7fa',
      gradient: true,
      face: 'smile',
      accessory: 'none',
      rarity: 'Epic',
      material: 'normal',
      sound: 'normal',
      custom: true
    };

    // Set initial values in form elements
    const nameInput = document.getElementById('diy-name');
    if (nameInput) nameInput.value = config.name;

    const colorInput = document.getElementById('diy-color');
    if (colorInput) colorInput.value = config.color;

    const color2Input = document.getElementById('diy-color2');
    if (color2Input) color2Input.value = config.color2;

    const gradCheckbox = document.getElementById('diy-gradient');
    if (gradCheckbox) gradCheckbox.checked = config.gradient;

    // Highlight initial selected buttons
    setSelectedButton('shape', config.shape);
    setSelectedButton('face', config.face);
    setSelectedButton('accessory', config.accessory);
    setSelectedButton('material', config.material);
    setSelectedButton('sound', config.sound);

    updatePreview();
    setupListeners();
  }

  function setupListeners() {
    // Name Input
    const nameInput = document.getElementById('diy-name');
    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        config.name = e.target.value.trim() || '무명말랑이';
      });
    }

    // Color Pickers
    const colorInput = document.getElementById('diy-color');
    if (colorInput) {
      colorInput.addEventListener('input', (e) => {
        config.color = e.target.value;
        updatePreview();
      });
    }

    const color2Input = document.getElementById('diy-color2');
    if (color2Input) {
      color2Input.addEventListener('input', (e) => {
        config.color2 = e.target.value;
        updatePreview();
      });
    }

    const gradCheckbox = document.getElementById('diy-gradient');
    if (gradCheckbox) {
      gradCheckbox.addEventListener('change', (e) => {
        config.gradient = e.target.checked;
        const color2Container = document.getElementById('diy-color2-container');
        if (color2Container) {
          color2Container.style.display = config.gradient ? 'flex' : 'none';
        }
        updatePreview();
      });
    }

    // Shape Buttons
    setupGroupListeners('shape', (val) => {
      config.shape = val;
      updatePreview();
    });

    // Face Buttons
    setupGroupListeners('face', (val) => {
      config.face = val;
      updatePreview();
    });

    // Accessory Buttons
    setupGroupListeners('accessory', (val) => {
      config.accessory = val;
      updatePreview();
    });

    // Material Buttons
    setupGroupListeners('material', (val) => {
      config.material = val;
      if (val === 'wackpu') config.crackStage = 0;
      else delete config.crackStage;
      updatePreview();
    });

    // Sound Buttons - 소리 미리보기 포함
    setupGroupListeners('sound', (val) => {
      config.sound = val;
      // 선택한 소리 미리 재생
      switch(val) {
        case 'slime':  Sound.playSlime();  break;
        case 'butter': Sound.playButter(); break;
        case 'pop':    Sound.playPop();    break;
        case 'water':  Sound.playWater();  break;
        case 'asmr':   Sound.playASMR();   break;
        default:       Sound.playSqueeze(); break;
      }
    });

    // Create Button
    const createBtn = document.getElementById('diy-create-btn');
    if (createBtn) {
      // Clean clone to avoid duplicate listeners
      const newCreateBtn = createBtn.cloneNode(true);
      createBtn.parentNode.replaceChild(newCreateBtn, createBtn);
      newCreateBtn.addEventListener('click', saveMallang);
    }
  }

  function setupGroupListeners(groupName, callback) {
    const buttons = document.querySelectorAll(`[data-${groupName}]`);
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.playClick();
        const value = btn.getAttribute(`data-${groupName}`);
        setSelectedButton(groupName, value);
        callback(value);
      });
    });
  }

  function setSelectedButton(groupName, value) {
    const buttons = document.querySelectorAll(`[data-${groupName}]`);
    buttons.forEach(btn => {
      if (btn.getAttribute(`data-${groupName}`) === value) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  function updatePreview() {
    const previewContainer = document.getElementById('diy-preview-container');
    if (previewContainer) {
      previewContainer.innerHTML = MallangRenderer.createSVG(config, { width: 220, height: 220 });
    }
  }

  function saveMallang() {
    if (!config.name) {
      config.name = '이은이 말랑';
    }

    // Save to LocalStorage
    const owned = App.getOwnedMallangs();
    owned.push(config);
    App.saveOwnedMallangs(owned);

    // Play jingle and confetti
    Sound.playSuccess();
    triggerConfetti();

    const diyBtn = document.getElementById('diy-create-btn');
    if (diyBtn) {
      diyBtn.disabled = true;
      diyBtn.innerText = '탄생하는 중... ✨';
    }

    setTimeout(() => {
      if (diyBtn) {
        diyBtn.disabled = false;
        diyBtn.innerText = '말랑이 탄생시키기 🌸';
      }
      // Switch back to Lobby
      App.switchPage('lobby');
    }, 1500);
  }

  function triggerConfetti() {
    const duration = 1000;
    const end = Date.now() + duration;

    // Create micro-animation of particles on screen
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);

      const div = document.createElement('div');
      div.className = 'confetti-particle';
      div.style.left = Math.random() * 100 + 'vw';
      div.style.top = '-10px';
      div.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
      div.style.transform = `scale(${Math.random() + 0.5})`;
      document.body.appendChild(div);

      // Simple animation
      const anim = div.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(105vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 1000 + 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      anim.onfinish = () => div.remove();
    }, 40);
  }

  return {
    init: initCreator
  };
})();

// Export if module system exists
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MallangCreator;
} else {
  window.MallangCreator = MallangCreator;
}
