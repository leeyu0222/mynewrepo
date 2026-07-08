// app.js - Main Application Controller & Router
const App = (() => {
  
  // Default collection items
  const DEFAULT_MALLANGS = [
    {
      id: 'default-1',
      name: '도미 🐰',
      shape: 'circle',
      color: '#ffb6c1',
      color2: '#ffe5ec',
      gradient: true,
      face: 'smile',
      accessory: 'bow',
      rarity: 'Epic',
      material: 'normal',
      custom: false
    },
    {
      id: 'default-2',
      name: '몽글이 ☁️',
      shape: 'cloud',
      color: '#a8dadc',
      color2: '#f1faee',
      gradient: true,
      face: 'blush',
      accessory: 'none',
      rarity: 'Rare',
      material: 'normal',
      custom: false
    },
    {
      id: 'default-3',
      name: '곰탱이 🐻',
      shape: 'bear',
      color: '#b5838d',
      color2: '#e5989b',
      gradient: true,
      face: 'sleepy',
      accessory: 'none',
      rarity: 'Common',
      material: 'normal',
      custom: false
    },
    {
      id: 'default-4',
      name: '뾰리 ⭐',
      shape: 'star',
      color: '#ffb703',
      color2: '#ffd166',
      gradient: true,
      face: 'wink',
      accessory: 'crown',
      rarity: 'Legendary',
      material: 'normal',
      custom: false
    },
    {
      id: 'default-5',
      name: '니도 슬라임볼 🔵',
      shape: 'circle',
      color: '#1d4ed8',
      color2: '#38bdf8',
      gradient: true,
      face: 'shocked',
      accessory: 'none',
      rarity: 'Legendary',
      material: 'needoh',
      custom: false
    },
    {
      id: 'default-6',
      name: 'ASMR 왁뿌볼 🥚',
      shape: 'circle',
      color: '#ff007f',
      color2: '#fecdd3',
      gradient: true,
      face: 'smile',
      accessory: 'none',
      rarity: 'Epic',
      material: 'wackpu',
      crackStage: 0,
      custom: false
    },
    {
      id: 'default-7',
      name: '보라 니도 🟣',
      shape: 'needoh_cube',
      color: '#a855f7',
      color2: '#e9d5ff',
      gradient: false,
      face: 'smile',
      accessory: 'none',
      rarity: 'Legendary',
      material: 'needoh',
      custom: false
    },
    {
      id: 'default-8',
      name: '핑크 니도 🩷',
      shape: 'needoh_cube',
      color: '#ec4899',
      color2: '#fbcfe8',
      gradient: false,
      face: 'blush',
      accessory: 'none',
      rarity: 'Epic',
      material: 'needoh',
      custom: false
    },
    {
      id: 'default-9',
      name: '민트 니도 🟢',
      shape: 'needoh_cube',
      color: '#10b981',
      color2: '#d1fae5',
      gradient: false,
      face: 'wink',
      accessory: 'none',
      rarity: 'Rare',
      material: 'needoh',
      custom: false
    },
    {
      id: 'default-10',
      name: '버터 블록 🧈',
      shape: 'butter_block',
      color: '#fde047',
      color2: '#fef9c3',
      gradient: false,
      face: 'smile',
      accessory: 'none',
      rarity: 'Common',
      material: 'normal',
      custom: false
    }
  ];

  function getOwnedMallangs() {
    const data = localStorage.getItem('eunii-mallang-collection');
    if (!data) {
      saveOwnedMallangs(DEFAULT_MALLANGS);
      return DEFAULT_MALLANGS;
    }
    try {
      const saved = JSON.parse(data);
      const savedIds = new Set(saved.map(m => m.id));
      // Merge any new default items not yet in saved collection
      const merged = [...saved];
      DEFAULT_MALLANGS.forEach(def => {
        if (!savedIds.has(def.id)) merged.push(def);
      });
      if (merged.length !== saved.length) saveOwnedMallangs(merged);
      return merged;
    } catch (e) {
      return DEFAULT_MALLANGS;
    }
  }

  function saveOwnedMallangs(list) {
    localStorage.setItem('eunii-mallang-collection', JSON.stringify(list));
  }

  function init() {
    setupNavigation();
    renderLobbyCollection();

    // Click sound listener for all standard buttons
    document.querySelectorAll('button, .mode-card').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.playClick();
      });
    });
  }

  function setupNavigation() {
    // Navigate from lobby to simulator
    const goSim = document.getElementById('go-simulator-btn');
    if (goSim) {
      goSim.onclick = () => {
        switchPage('simulator');
        MallangSimulator.init();
      };
    }

    // Navigate from lobby to trading
    const goTrade = document.getElementById('go-trading-btn');
    if (goTrade) {
      goTrade.onclick = () => {
        switchPage('trading');
        MallangTrading.init();
      };
    }

    // Navigate from lobby to creator
    const goCreate = document.getElementById('go-creator-btn');
    if (goCreate) {
      goCreate.onclick = () => {
        switchPage('creator');
        MallangCreator.init();
      };
    }

    // Handle all back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-target') || 'lobby';
        switchPage(target);
      };
    });

    // Reset Data Button
    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('도감을 초기화하고 기본 말랑이들을 불러오시겠습니까?')) {
          Sound.playFail();
          localStorage.removeItem('eunii-mallang-collection');
          renderLobbyCollection();
        }
      };
    }
  }

  function switchPage(pageId) {
    // If leaving simulator, stop physics loop
    if (pageId !== 'simulator') {
      MallangSimulator.stop();
    }

    // Switch active state class
    document.querySelectorAll('.page').forEach(page => {
      if (page.id === `${pageId}-page`) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    // If returning to lobby, refresh collection display
    if (pageId === 'lobby') {
      renderLobbyCollection();
    }
  }

  function renderLobbyCollection() {
    const owned = getOwnedMallangs();
    const countEl = document.getElementById('collection-count');
    if (countEl) countEl.innerText = owned.length;

    const grid = document.getElementById('lobby-collection-grid');
    if (grid) {
      if (owned.length === 0) {
        grid.innerHTML = '<div class="trade-empty-message">보관함이 비어있습니다. 말랑이를 만들어 보세요!</div>';
        return;
      }

      grid.innerHTML = owned.map(item => `
        <div class="mallang-item-card" data-id="${item.id}">
          <div class="card-svg-box">${MallangRenderer.createSVG(item, { width: 90, height: 90 })}</div>
          <h4>${item.name}</h4>
          <span class="rarity-tag ${item.rarity.toLowerCase()}">${item.rarity}</span>
        </div>
      `).join('');

      // Add click behavior: clicking an item in lobby launches simulator with it pre-selected
      grid.querySelectorAll('.mallang-item-card').forEach(card => {
        card.onclick = () => {
          const id = card.getAttribute('data-id');
          const found = owned.find(m => m.id === id);
          if (found) {
            Sound.playClick();
            switchPage('simulator');
            MallangSimulator.init(found);
          }
        };
      });
    }
  }

  return {
    init,
    getOwnedMallangs,
    saveOwnedMallangs,
    switchPage
  };
})();

// Initialize when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
