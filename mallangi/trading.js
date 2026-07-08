// trading.js - Mallang Trading Game
const MallangTrading = (() => {
  let userOffers = []; // User's placed squishies
  let aiOffers = [];   // AI's placed squishies
  let aiPool = [];     // AI's inventory for this session

  let aiState = 'idle'; // 'idle' | 'happy' | 'nervous' | 'angry' | 'accepted'
  let aiAccepted = false;
  let userAccepted = false;

  // AI inventory items generator
  const AI_MALLANGS = [
    { id: 'ai-1', name: '초코쿠키냥', shape: 'cat', color: '#8b5a2b', color2: '#d2b48c', gradient: true, face: 'sleepy', accessory: 'none', rarity: 'Rare' },
    { id: 'ai-2', name: '체리체리', shape: 'heart', color: '#ff4d6d', color2: '#ffb3c1', gradient: true, face: 'smile', accessory: 'bow', rarity: 'Rare' },
    { id: 'ai-3', name: '골든크라운', shape: 'circle', color: '#ffd700', color2: '#ffa500', gradient: true, face: 'blush', accessory: 'crown', rarity: 'Legendary' },
    { id: 'ai-4', name: '민트블루별', shape: 'star', color: '#a8dadc', color2: '#457b9d', gradient: true, face: 'wink', accessory: 'hairpin', rarity: 'Epic' },
    { id: 'ai-5', name: '우주구름이', shape: 'cloud', color: '#7209b7', color2: '#f72585', gradient: true, face: 'shocked', accessory: 'hat', rarity: 'Legendary' },
    { id: 'ai-6', name: '딸기모찌', shape: 'circle', color: '#ffb6c1', color2: '#ffffff', gradient: true, face: 'smile', accessory: 'none', rarity: 'Common' },
    { id: 'ai-7', name: '도토리람쥐', shape: 'bear', color: '#cd853f', color2: '#8b4513', gradient: true, face: 'smile', accessory: 'none', rarity: 'Common' }
  ];

  const RARITY_VALUES = {
    Common: 10,
    Rare: 20,
    Epic: 45,
    Legendary: 90
  };

  function initTrading() {
    userOffers = [];
    aiOffers = [];
    aiAccepted = false;
    userAccepted = false;
    aiState = 'idle';

    // Populate AI pool with random items
    aiPool = [...AI_MALLANGS].sort(() => 0.5 - Math.random()).slice(0, 4);
    
    // AI starts by offering 1 random item
    aiOffers.push(aiPool.pop());

    renderBoard();
    setupListeners();
  }

  function getSideValue(offers) {
    return offers.reduce((sum, item) => sum + (RARITY_VALUES[item.rarity] || 10), 0);
  }

  function renderBoard() {
    const userVal = getSideValue(userOffers);
    const aiVal = getSideValue(aiOffers);

    // Update value displays
    const userValEl = document.getElementById('trade-user-value');
    if (userValEl) userValEl.innerText = `${userVal} P`;
    const aiValEl = document.getElementById('trade-ai-value');
    if (aiValEl) aiValEl.innerText = `${aiVal} P`;

    // Render User slots
    const userGrid = document.getElementById('trade-user-grid');
    if (userGrid) {
      if (userOffers.length === 0) {
        userGrid.innerHTML = `
          <div class="trade-empty-slot" id="add-to-trade-btn">
            <span class="plus-icon">+</span>
            <span class="slot-text">말랑이 추가</span>
          </div>
        `;
      } else {
        userGrid.innerHTML = userOffers.map((item, idx) => `
          <div class="trade-item-card" data-idx="${idx}">
            <div class="card-svg-container">${MallangRenderer.createSVG(item, { width: 80, height: 80 })}</div>
            <div class="card-name">${item.name}</div>
            <button class="remove-trade-item" data-idx="${idx}">×</button>
          </div>
        `).join('') + `
          ${userOffers.length < 3 ? `
            <div class="trade-empty-slot mini" id="add-to-trade-btn">
              <span class="plus-icon">+</span>
            </div>
          ` : ''}
        `;
      }
    }

    // Render AI slots
    const aiGrid = document.getElementById('trade-ai-grid');
    if (aiGrid) {
      if (aiOffers.length === 0) {
        aiGrid.innerHTML = '<div class="trade-empty-message">상인이 고민하는 중...</div>';
      } else {
        aiGrid.innerHTML = aiOffers.map(item => `
          <div class="trade-item-card ai">
            <div class="card-svg-container">${MallangRenderer.createSVG(item, { width: 80, height: 80 })}</div>
            <div class="card-name">${item.name}</div>
          </div>
        `).join('');
      }
    }

    // Update Balance Scale
    updateScale(userVal, aiVal);

    // Update AI State and Character bubble
    updateAIState(userVal, aiVal);

    // Update Status Indicators
    updateButtons();
  }

  function updateScale(userVal, aiVal) {
    const scaleBar = document.getElementById('scale-bar');
    if (!scaleBar) return;

    let tilt = 0;
    if (userVal !== 0 || aiVal !== 0) {
      const maxVal = Math.max(userVal, aiVal);
      // Tilt ranges from -30deg (too low user offer) to 30deg (very high user offer)
      tilt = ((userVal - aiVal) / maxVal) * 20;
    }
    
    scaleBar.style.transform = `rotate(${tilt}deg)`;
  }

  function updateAIState(userVal, aiVal) {
    const bubbleText = document.getElementById('ai-bubble-text');
    const aiOverlay = document.getElementById('ai-character-face');
    const aiTraderImg = document.getElementById('ai-trader-img');

    function setAIState(state) {
      if (aiOverlay) aiOverlay.className = `ai-state-overlay`;
      if (aiTraderImg) aiTraderImg.className = `ai-trader-img state-${state}`;
    }

    if (userVal === 0) {
      aiState = 'idle';
      aiAccepted = false;
      if (bubbleText) bubbleText.innerText = '안녕! 네 말랑이를 거래판에 올려줘! ✌️';
      setAIState('idle');
      return;
    }

    // AI accepts if userVal is close or superior to aiVal
    if (userVal >= aiVal * 0.9) {
      aiState = 'happy';
      aiAccepted = true;
      if (bubbleText) bubbleText.innerText = '오, 좋은 거래인데?! 수락할게! ✔️ 역시 센스 있어~';
      setAIState('happy');
    } else if (userVal >= aiVal * 0.6) {
      aiState = 'nervous';
      aiAccepted = false;
      if (bubbleText) bubbleText.innerText = '음... 조금 모자란 것 같아. 더 올려줘! 😓';
      setAIState('nervous');
    } else {
      aiState = 'angry';
      aiAccepted = false;
      if (bubbleText) bubbleText.innerText = '이게 뭐야! 완전 손해잖아! 다시 가져와! 😡';
      setAIState('angry');
    }

    // If AI previously accepted, force indicator
    if (aiAccepted) {
      const aiStatus = document.getElementById('ai-status-indicator');
      if (aiStatus) aiStatus.classList.add('accepted');
    } else {
      const aiStatus = document.getElementById('ai-status-indicator');
      if (aiStatus) aiStatus.classList.remove('accepted');
    }
  }

  function updateButtons() {
    const userStatus = document.getElementById('user-status-indicator');
    if (userStatus) {
      if (userAccepted) userStatus.classList.add('accepted');
      else userStatus.classList.remove('accepted');
    }

    const acceptBtn = document.getElementById('trade-accept-btn');
    if (acceptBtn) {
      if (userAccepted) {
        acceptBtn.innerText = '승인됨 (대기 중...)';
        acceptBtn.classList.add('active');
      } else {
        acceptBtn.innerText = '거래 승인 ✔️';
        acceptBtn.classList.remove('active');
      }
    }
  }

  function setupListeners() {
    // Add Item Dialog Trigger
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('#add-to-trade-btn');
      if (addBtn) {
        Sound.playClick();
        openInventoryModal();
      }

      // Remove item
      const removeBtn = e.target.closest('.remove-trade-item');
      if (removeBtn) {
        Sound.playClick();
        const idx = parseInt(removeBtn.getAttribute('data-idx'));
        userOffers.splice(idx, 1);
        userAccepted = false; // Reset accept
        renderBoard();
      }
    });

    // Accept button
    const acceptBtn = document.getElementById('trade-accept-btn');
    if (acceptBtn) {
      acceptBtn.onclick = () => {
        if (userOffers.length === 0) {
          alert('거래판에 먼저 말랑이를 올려주세요!');
          return;
        }
        Sound.playClick();
        userAccepted = !userAccepted;
        renderBoard();

        if (userAccepted && aiAccepted) {
          executeTrade();
        }
      };
    }

    // Decline button
    const declineBtn = document.getElementById('trade-decline-btn');
    if (declineBtn) {
      declineBtn.onclick = () => {
        Sound.playFail();
        alert('거래가 무산되었습니다! 판을 리셋합니다.');
        initTrading();
      };
    }

    // Ask for more button (+)
    const askMoreBtn = document.getElementById('trade-ask-more-btn');
    if (askMoreBtn) {
      askMoreBtn.onclick = () => {
        Sound.playClick();
        requestAIAddMore();
      };
    }
  }

  function requestAIAddMore() {
    const userVal = getSideValue(userOffers);
    const aiVal = getSideValue(aiOffers);
    const bubbleText = document.getElementById('ai-bubble-text');
    const aiImg = document.getElementById('ai-character-face');

    if (userVal > aiVal + 5) {
      // AI check if it has inventory left
      if (aiPool.length > 0) {
        const item = aiPool.pop();
        aiOffers.push(item);
        if (bubbleText) bubbleText.innerText = '좋아, 네 제안이 마음에 드니 하나 더 올릴게!';
        if (aiImg) aiImg.className = 'ai-face state-happy';
        aiAccepted = false;
        userAccepted = false;
        setTimeout(() => {
          renderBoard();
        }, 800);
      } else {
        if (bubbleText) bubbleText.innerText = '더 이상 줄 수 있는 말랑이가 없어!';
        if (aiImg) aiImg.className = 'ai-face state-nervous';
      }
    } else {
      // AI refuses to give more because trade is already unfair for AI
      if (bubbleText) bubbleText.innerText = '내가 이미 손해라 더 올릴 순 없어! 오히려 네가 더 줘야 해!';
      if (aiImg) aiImg.className = 'ai-face state-angry';
      // Shake character animation
      const avatar = document.querySelector('.ai-avatar');
      if (avatar) {
        avatar.classList.add('shake-anim');
        setTimeout(() => avatar.classList.remove('shake-anim'), 500);
      }
    }
  }

  function openInventoryModal() {
    // Show inventory selector
    const owned = App.getOwnedMallangs();
    // Filter out items already offered
    const available = owned.filter(m => !userOffers.some(o => o.id === m.id));

    if (available.length === 0) {
      alert('올릴 수 있는 여분의 말랑이가 없습니다! DIY 메이커에서 더 만들어보세요!');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'trade-modal';
    modal.innerHTML = `
      <div class="trade-modal-content">
        <h3>도감에서 말랑이 올리기</h3>
        <div class="trade-modal-grid">
          ${available.map(item => `
            <div class="modal-item-card" data-id="${item.id}">
              <div class="modal-card-svg">${MallangRenderer.createSVG(item, { width: 60, height: 60 })}</div>
              <div class="modal-card-name">${item.name}</div>
              <div class="modal-card-rarity">${item.rarity}</div>
            </div>
          `).join('')}
        </div>
        <button class="modal-close-btn">닫기</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Modal Events
    modal.querySelectorAll('.modal-item-card').forEach(card => {
      card.onclick = () => {
        const id = card.getAttribute('data-id');
        const squishy = owned.find(m => m.id === id);
        if (squishy && userOffers.length < 3) {
          userOffers.push(squishy);
          userAccepted = false; // Reset accept
          renderBoard();
        }
        modal.remove();
      };
    });

    modal.querySelector('.modal-close-btn').onclick = () => modal.remove();
  }

  function executeTrade() {
    Sound.playSuccess();
    triggerConfetti();

    // Update owned inventory
    let owned = App.getOwnedMallangs();

    // 1. Remove offered items from user inventory
    owned = owned.filter(m => !userOffers.some(o => o.id === m.id));

    // 2. Add AI offered items to user inventory (change their IDs to be unique)
    aiOffers.forEach(item => {
      owned.push({
        ...item,
        id: 'traded-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
      });
    });

    App.saveOwnedMallangs(owned);

    // Show success overlay
    const overlay = document.createElement('div');
    overlay.className = 'trade-success-overlay';
    overlay.innerHTML = `
      <div class="success-banner">
        <h2>🎉 거래 성사! 🎉</h2>
        <p>상인의 말랑이를 내 보관함에 획득했습니다!</p>
        <button class="success-ok-btn">대박!</button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.success-ok-btn').onclick = () => {
      overlay.remove();
      initTrading();
    };
  }

  function triggerConfetti() {
    const duration = 1500;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);

      const div = document.createElement('div');
      div.className = 'confetti-particle';
      div.style.left = Math.random() * 100 + 'vw';
      div.style.top = '-10px';
      div.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
      document.body.appendChild(div);

      const anim = div.animate([
        { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
        { transform: `translateY(105vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 1200 + 800,
        easing: 'ease-out'
      });

      anim.onfinish = () => div.remove();
    }, 30);
  }

  return {
    init: initTrading
  };
})();

// Export if module system exists
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MallangTrading;
} else {
  window.MallangTrading = MallangTrading;
}
