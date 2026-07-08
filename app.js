/* ==========================================================================
   MUKBANG SIMULATOR - GAME ENGINE & SIMULATION LOGIC
   ========================================================================== */

// --- GAME STATE ---
const state = {
    gold: 0,
    calories: 0,
    fullness: 0,
    maxFullness: 100,
    spiciness: 0,
    viewerCount: 150,
    likeCount: 0,
    streamTime: 0, // in seconds
    isChewing: false,
    soundEnabled: true,
    
    // Upgrades
    upgrades: {
        speed: { level: 1, maxLevel: 5, costMultiplier: 1.8, baseCost: 50 },
        stomach: { level: 1, maxLevel: 5, costMultiplier: 2.0, baseCost: 80 },
        spice: { level: 1, maxLevel: 5, costMultiplier: 2.2, baseCost: 100 }
    }
};

// --- FOOD DATABASE ---
const FOODS = {
    tteokbokki: {
        name: "🔥 불타는 매운 떡볶이",
        calorie: 350,
        fullness: 15,
        spice: 35,
        chatReactivity: 0.8,
        reaction: "spicy",
        chewSound: "chewy",
        chewDuration: 1800, // ms
        messages: [
            "맵부심 폭발!! 🌶️🌶️",
            "치비 얼굴 벌개지는 거 넘 졸귀ㅋㅋㅋ",
            "와 나도 떡볶이 시켰다",
            "보는 내가 다 땀나네;;",
            "습-하 소리 침샘자극 지대루다 ㄷㄷ"
        ]
    },
    fried_chicken: {
        name: "🍗 황금 바삭 후라이드 치킨",
        calorie: 600,
        fullness: 35,
        spice: 0,
        chatReactivity: 0.6,
        reaction: "eating",
        chewSound: "crunchy",
        chewDuration: 2200, // ms
        messages: [
            "와 바삭 소리 미쳤다 🔊🔊",
            "소리만 들어도 겉바속촉임",
            "치킨 ASMR 레전드 갱신ㅋㅋㅋㅋ",
            "침 질질 흐르는 중...🤤",
            "1인 1닭 조지시네요 화이팅!"
        ]
    },
    tanghulu: {
        name: "🍓 반짝 설탕막 딸기 탕후루",
        calorie: 200,
        fullness: 8,
        spice: 0,
        chatReactivity: 0.7,
        reaction: "eating",
        chewSound: "glassy",
        chewDuration: 1500, // ms
        messages: [
            "달콤함 한도초과! 🍭✨",
            "와지끈 씹는 소리 실화냐",
            "탕후루는 못참지!!",
            "도파민 터지는 ASMR이네 ㄷㄷ",
            "설탕막 바삭함 미쳤다 진짜"
        ]
    }
};

// --- CHAT GENERATOR DATA ---
const RANDOM_USERNAMES = [
    "밀가루요정", "치킨사냥꾼", "야식마니아", "먹방러버", "별풍요정", 
    "프로침샘자극러", "다이어트는내일부터", "맛있으면0kcal", "배고픈대학생", 
    "탄수화물중독", "코리안푸디", "쩝쩝박사", "배달의요정", "꿀꿀이"
];

const GENERAL_CHAT_MESSAGES = [
    "스트리머님 안녕하세요!",
    "소통 넘 잘해주시네요",
    "오늘 텐션 무엇ㅋㅋㅋ",
    "방금 구독 박았습니다!",
    "맛깔나게 잘 드시네",
    "리액션 짱이다",
    "브금 정보 좀요",
    "화질 개깔끔하네",
    "인생 먹방 채널 찾음"
];

const IDLE_CHAT_MESSAGES = [
    "스트리머 뭐함? ㅋㅋㅋ",
    "얼른 다음 음식 가자!",
    "배부르신가요??",
    "물 한잔 드세요!",
    "메뉴 추가요~",
    "냠냠치비 배 터지는 거 아님?"
];

const DONATION_COMMENTS = [
    "맛있게 먹는 모습 보기 좋아요! 화이팅!",
    "오늘 야식 메뉴 치킨으로 정했습니다. 고마워요!",
    "너무 귀엽다 ㅠㅠ 소소하게 후원하고 갑니다!",
    "ASMR 사운드 최고네요! 고막 녹을 뻔ㅋㅋㅋ",
    "더 맛있는 음식 많이 드시라고 쏩니다!",
    "한 입만 권법 시전해주세요ㅋㅋㅋ"
];

// --- WEB AUDIO API PROCEDURAL SOUND SYNTHESIZER ---
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Generate filtered white noise for crunchy sounds
function playProceduralCrunch(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const bufferSize = audioCtx.sampleRate * 0.15; // 150ms buffer
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    // Filter creation
    const filter = audioCtx.createBiquadFilter();
    
    // Configure based on chew type
    if (type === 'crunchy') {
        // High crisp crunch (e.g. fried chicken)
        filter.type = 'bandpass';
        filter.frequency.value = 2500;
        filter.Q.value = 1.5;
    } else if (type === 'glassy') {
        // Glassy crackle (e.g. sugar shell tanghulu)
        filter.type = 'highpass';
        filter.frequency.value = 4000;
    } else {
        // Chewy soft squish (e.g. tteokbokki)
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
    }

    const gainNode = audioCtx.createGain();
    
    // Quick biting envelope
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    // Connections
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noiseNode.start();
    noiseNode.stop(audioCtx.currentTime + 0.15);
}

// Gulp sound sweep
function playProceduralGulp() {
    if (!state.soundEnabled) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    // Smooth frequency sweep upwards
    osc.frequency.setValueAtTime(80, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(190, audioCtx.currentTime + 0.25);
    
    // Envelope for gulping sound
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// Donation sound arpeggio
function playDonationChime() {
    if (!state.soundEnabled) return;
    initAudio();
    
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major chord arpeggio
    notes.forEach((freq, index) => {
        const time = audioCtx.currentTime + index * 0.08;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gainNode.gain.setValueAtTime(0.12, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(time);
        osc.stop(time + 0.4);
    });
}

// Spicy breathing ("hoo-ha") sound
function playSpicyBreath() {
    if (!state.soundEnabled) return;
    initAudio();
    
    // Noise buffer
    const bufferSize = audioCtx.sampleRate * 0.4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 2.0;
    
    const gainNode = audioCtx.createGain();
    
    // Slow breath envelope
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.15);
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start();
    noise.stop(audioCtx.currentTime + 0.45);
}

// --- DOM ELEMENTS ---
const el = {
    avatarImg: document.getElementById('avatar-img'),
    avatarContainer: document.getElementById('avatar-container'),
    chewingIndicator: document.getElementById('chewing-indicator'),
    reactionBubble: document.getElementById('reaction-bubble'),
    
    // Header Info
    viewerCount: document.getElementById('viewer-count'),
    likeCount: document.getElementById('like-count'),
    streamTimer: document.getElementById('stream-timer'),
    
    // Stats Panel
    fullnessVal: document.getElementById('fullness-val'),
    fullnessBar: document.getElementById('fullness-bar'),
    spiceVal: document.getElementById('spice-val'),
    spiceBar: document.getElementById('spice-bar'),
    caloriesVal: document.getElementById('calories-val'),
    goldVal: document.getElementById('gold-val'),
    
    // Control Buttons
    simulateDonationBtn: document.getElementById('simulate-donation-btn'),
    streamLikeBtn: document.getElementById('stream-like-btn'),
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    
    // Food Cards
    foodMenu: document.getElementById('food-menu-list'),
    
    // Chat Section
    chatMessages: document.getElementById('chat-messages'),
    userChatInput: document.getElementById('user-chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn'),
    
    // Donation Overlay
    donationOverlay: document.getElementById('donation-overlay'),
    donationAlertText: document.getElementById('donation-alert-text'),
    donationAlertMessage: document.getElementById('donation-alert-message'),
    
    // Upgrade buttons
    upSpeedBtn: document.querySelector('#up-eat-speed .upgrade-btn'),
    upStomachBtn: document.querySelector('#up-stomach .upgrade-btn'),
    upSpiceBtn: document.querySelector('#up-spice-res .upgrade-btn'),
    
    // Levels
    upSpeedLvl: document.getElementById('eat-speed-lvl'),
    upStomachLvl: document.getElementById('stomach-lvl'),
    upSpiceLvl: document.getElementById('spice-lvl')
};

// --- INITIALIZATION & EVENTS ---
function init() {
    setupEventListeners();
    updateUI();
    
    // Start timers
    setInterval(updateStreamTimer, 1000);
    setInterval(tickDigestionAndSpiceRecovery, 2000);
    setInterval(generateSimulatedChat, 3000);
    setInterval(randomDonationTrigger, 20000); // Donation chance every 20s
    
    // Initial hello chat
    addChatMessage("SYSTEM", "스트리밍이 성공적으로 시작되었습니다!", "system");
    addChatMessage("밀가루요정", "와 오늘 치비 먹방 개꿀띠~", "viewer");
}

function setupEventListeners() {
    // Sound Toggle
    el.soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        el.soundToggleBtn.textContent = state.soundEnabled ? "🔊 소리 ON" : "🔇 소리 MUTE";
        el.soundToggleBtn.classList.toggle('muted', !state.soundEnabled);
    });

    // Feeding buttons
    const feedButtons = document.querySelectorAll('.feed-btn');
    feedButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.food-card');
            const foodType = card.dataset.food;
            feedFood(foodType, card);
        });
    });

    // Upgrades
    document.querySelectorAll('.upgrade-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const upgradeType = e.target.dataset.upgrade;
            buyUpgrade(upgradeType);
        });
    });

    // User Chat Send
    el.sendChatBtn.addEventListener('click', sendUserChat);
    el.userChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserChat();
    });

    // Simulator Actions
    el.simulateDonationBtn.addEventListener('click', () => triggerDonation());
    el.streamLikeBtn.addEventListener('click', () => triggerLike(true));
}

// --- STREAM TIMER ---
function updateStreamTimer() {
    state.streamTime++;
    const hrs = Math.floor(state.streamTime / 3600).toString().padStart(2, '0');
    const mins = Math.floor((state.streamTime % 3600) / 60).toString().padStart(2, '0');
    const secs = (state.streamTime % 60).toString().padStart(2, '0');
    el.streamTimer.textContent = `${hrs}:${mins}:${secs}`;
    
    // Slowly decay viewers if idle
    if (!state.isChewing && Math.random() < 0.15) {
        adjustViewers(-2);
    }
}

// --- GAME LOGIC ---

// Feed food
function feedFood(type, cardElement) {
    if (state.isChewing) {
        showBubble("아직 씹고 있어요! 냠냠...");
        return;
    }
    
    const food = FOODS[type];
    if (!food) return;

    // Check if character is too full
    if (state.fullness + food.fullness > state.maxFullness) {
        showBubble("너무 배불러요! ㅠㅠ 소화가 필요해요!");
        playProceduralGulp(); // play gulp sound to remind
        return;
    }

    state.isChewing = true;
    
    // Animate flying food element from button to mouth
    animateFlyingFood(cardElement, type);

    // Speed upgrade modifier
    const chewDuration = food.chewDuration * Math.pow(0.8, state.upgrades.speed.level - 1);

    // Start chewing visuals
    el.avatarContainer.classList.add('chewing');
    el.avatarImg.src = 'assets/avatar_eating.jpg';
    
    // Sound loop during chewing
    const chewInterval = setInterval(() => {
        playProceduralCrunch(food.chewSound);
    }, 280);

    setTimeout(() => {
        clearInterval(chewInterval);
        el.avatarContainer.classList.remove('chewing');
        state.isChewing = false;

        // Apply stats
        state.calories += food.calorie;
        state.fullness += food.fullness;
        
        // Spice resistance upgrade modifier
        const spiceModifier = Math.pow(0.75, state.upgrades.spice.level - 1);
        state.spiciness = Math.min(100, state.spiciness + (food.spice * spiceModifier));

        // Play swallow sound
        playProceduralGulp();
        
        // React and update visuals
        updateAvatarExpression();
        updateUI();
        
        // React chat
        reactChatOnFood(food);

        // Viewer increase on feeding
        adjustViewers(Math.floor(Math.random() * 20) + 10);
        triggerLike(false);

    }, chewDuration);
}

// Animate food flying into mouth
function animateFlyingFood(cardElement, type) {
    const imgEl = cardElement.querySelector('.food-image-wrapper img');
    const rect = imgEl.getBoundingClientRect();
    const screenRect = document.getElementById('stream-screen').getBoundingClientRect();
    
    const flyer = document.createElement('img');
    flyer.src = imgEl.src;
    flyer.className = 'flying-food';
    
    // Calculate relative coordinates
    const startX = rect.left - screenRect.left + (rect.width / 2) - 30;
    const startY = rect.top - screenRect.top + (rect.height / 2) - 30;
    
    // End coordinate (mouth of avatar)
    const endX = screenRect.width / 2 - 30;
    const endY = screenRect.height * 0.65;
    
    flyer.style.setProperty('--start-x', `${startX}px`);
    flyer.style.setProperty('--start-y', `${startY}px`);
    flyer.style.setProperty('--end-x', `${endX}px`);
    flyer.style.setProperty('--end-y', `${endY}px`);
    
    document.getElementById('stream-screen').appendChild(flyer);
    
    // Remove element after animation ends
    flyer.addEventListener('animationend', () => {
        flyer.remove();
    });
}

// Update avatar expression based on stats
function updateAvatarExpression() {
    if (state.spiciness > 50) {
        el.avatarImg.src = 'assets/avatar_spicy.jpg';
        showBubble("습-하! 너무 매워요!! 살려줘! 🥛💦");
        // Play spicy breathing sounds
        playSpicyBreath();
    } else {
        el.avatarImg.src = 'assets/avatar_normal.jpg';
    }
}

// Digestion over time
function tickDigestionAndSpiceRecovery() {
    // Digestion speed is affected by stomach size
    const digestionRate = 2 + Math.floor(state.upgrades.stomach.level / 2);
    if (state.fullness > 0) {
        state.fullness = Math.max(0, state.fullness - digestionRate);
    }
    
    // Spice recovery
    if (state.spiciness > 0) {
        state.spiciness = Math.max(0, state.spiciness - 5);
        if (state.spiciness <= 50 && el.avatarImg.src.includes('avatar_spicy')) {
            updateAvatarExpression();
        }
    }
    
    updateUI();
}

// Upgrades shop
function buyUpgrade(type) {
    const upgrade = state.upgrades[type];
    if (!upgrade) return;
    
    if (upgrade.level >= upgrade.maxLevel) {
        showBubble("이미 최고 레벨입니다!");
        return;
    }
    
    const cost = getUpgradeCost(upgrade);
    if (state.gold < cost) {
        showBubble("별풍선(후원금)이 부족합니다! ㅠㅠ");
        return;
    }
    
    state.gold -= cost;
    upgrade.level++;
    
    // Apply stats upgrades immediately if needed
    if (type === 'stomach') {
        state.maxFullness = 100 + (upgrade.level - 1) * 35;
    }
    
    playProceduralGulp(); // sound chime
    updateUI();
    addChatMessage("SYSTEM", `업그레이드 성공! 레벨이 상승했습니다.`, "system");
}

function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level - 1));
}

// --- CHAT SYSTEM ---

// Add chat message
function addChatMessage(username, text, type = "viewer") {
    const chatItem = document.createElement('div');
    chatItem.className = `chat-item ${type === 'user' ? 'user-message' : type === 'donation' ? 'donation-message' : ''}`;
    
    if (type === 'system') {
        chatItem.innerHTML = `<span class="chat-text" style="color: var(--accent-green); font-weight: 600;">[알림] ${text}</span>`;
    } else if (type === 'donation') {
        chatItem.innerHTML = `
            <span class="chat-username">⭐ ${username}</span>
            <span class="chat-text" style="font-weight: 700;">${text}</span>
        `;
    } else {
        chatItem.innerHTML = `
            <span class="chat-username">${username}</span>
            <span class="chat-text">${text}</span>
        `;
    }
    
    el.chatMessages.appendChild(chatItem);
    
    // Scroll to bottom
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
    
    // Keep max 50 chat messages for performance
    if (el.chatMessages.children.length > 50) {
        el.chatMessages.removeChild(el.chatMessages.firstChild);
    }
}

// User send chat
function sendUserChat() {
    const text = el.userChatInput.value.trim();
    if (!text) return;
    
    addChatMessage("Me (스트리머)", text, "user");
    el.userChatInput.value = "";
    
    // Character responds after 1s
    setTimeout(() => {
        const responses = ["감사합니다! ㅎㅎ", "넵! 맛있게 먹을게요!", "오 정말요? 고마워요!", "화이팅!"];
        const randResponse = responses[Math.floor(Math.random() * responses.length)];
        showBubble(randResponse);
        adjustViewers(1);
    }, 1000);
}

// Random chat generation
function generateSimulatedChat() {
    let messagePool = GENERAL_CHAT_MESSAGES;
    
    if (!state.isChewing) {
        if (state.fullness > 80) {
            messagePool = ["와 배 엄청 부르신 듯", "배 터지겠어요 살살 드삼", "푸드파이터 급이네ㄷㄷ"];
        } else {
            messagePool = [...GENERAL_CHAT_MESSAGES, ...IDLE_CHAT_MESSAGES];
        }
    } else {
        // Find which food they are chewing
        // Just react to current spiciness or high fullness
        if (state.spiciness > 50) {
            messagePool = ["우유 드세요! 🥛💦", "스트리머 매워 기절함ㅋㅋㅋ", "매운맛 보소", "불닭보다 매운듯"];
        }
    }
    
    const randUser = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    const randMsg = messagePool[Math.floor(Math.random() * messagePool.length)];
    
    addChatMessage(randUser, randMsg, "viewer");
}

// React chat directly to food item
function reactChatOnFood(food) {
    const size = Math.floor(Math.random() * 3) + 2; // 2 to 4 messages at once
    for (let i = 0; i < size; i++) {
        setTimeout(() => {
            const randUser = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
            const randMsg = food.messages[Math.floor(Math.random() * food.messages.length)];
            addChatMessage(randUser, randMsg, "viewer");
        }, i * 300);
    }
}

// --- DONATIONS (STAR BALLOONS) ---

function randomDonationTrigger() {
    // If stream is active, there is a chance of donation
    // Chance increases with higher viewer count or sweetness (Tanghulu)
    let donationChance = 0.3; // base 30%
    if (state.viewerCount > 500) donationChance += 0.2;
    if (state.isChewing) donationChance += 0.15;
    
    if (Math.random() < donationChance) {
        triggerDonation();
    }
}

function triggerDonation(customAmount = 0) {
    const donator = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    
    // Choose star balloon amount
    const amounts = [10, 30, 50, 100, 200, 500];
    const amount = customAmount > 0 ? customAmount : amounts[Math.floor(Math.random() * amounts.length)];
    
    const comment = DONATION_COMMENTS[Math.floor(Math.random() * DONATION_COMMENTS.length)];
    
    // Apply gold (donations)
    state.gold += amount;
    
    // Donation effect arpeggio
    playDonationChime();
    
    // Dynamic chat message
    addChatMessage(donator, `별풍선 ${amount}개 후원! "${comment}"`, "donation");
    
    // Trigger visual overlay alert
    showDonationAlert(donator, amount, comment);
    
    // Spawn floating particle elements (coins/stars)
    spawnDonationParticles(25);
    
    // Boost viewers and likes
    adjustViewers(Math.floor(amount / 2));
    state.likeCount += amount;
    
    updateUI();
}

function showDonationAlert(donator, count, message) {
    el.donationOverlay.querySelector('.donator-name').textContent = donator;
    el.donationOverlay.querySelector('.star-balloon-count').textContent = `${count}개`;
    el.donationAlertMessage.textContent = `"${message}"`;
    
    el.donationOverlay.classList.add('active');
    
    setTimeout(() => {
        el.donationOverlay.classList.remove('active');
    }, 4000); // Alert lasts for 4s
}

// Floating stars / coins animation
function spawnDonationParticles(count) {
    const screen = document.getElementById('stream-screen');
    const colors = ['⭐', '🪙', '✨', '💛', '💖'];
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.textContent = colors[Math.floor(Math.random() * colors.length)];
            
            // Random horizontal start, bottom vertical start
            const startX = Math.random() * 80 + 10; // 10% to 90% width
            particle.style.left = `${startX}%`;
            particle.style.bottom = '10%';
            
            // Random translation endpoints
            const moveX = (Math.random() - 0.5) * 200; // -100px to 100px
            const moveY = -(Math.random() * 250 + 150); // -150px to -400px
            const rotate = Math.random() * 360;
            
            particle.style.setProperty('--x', `${moveX}px`);
            particle.style.setProperty('--y', `${moveY}px`);
            particle.style.setProperty('--r', `${rotate}deg`);
            
            screen.appendChild(particle);
            
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }, i * 50);
    }
}

// Likes boost
function triggerLike(byUser = false) {
    state.likeCount++;
    el.likeCount.textContent = state.likeCount.toLocaleString();
    
    // Spawn floating heart
    const heart = document.createElement('div');
    heart.className = 'floating-particle';
    heart.textContent = '💖';
    
    // Start at bottom center
    heart.style.left = '50%';
    heart.style.bottom = '15%';
    
    const moveX = (Math.random() - 0.5) * 150;
    const moveY = -(Math.random() * 150 + 100);
    
    heart.style.setProperty('--x', `${moveX}px`);
    heart.style.setProperty('--y', `${moveY}px`);
    heart.style.setProperty('--r', `${(Math.random() - 0.5) * 60}deg`);
    
    document.getElementById('stream-screen').appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
    
    if (byUser) {
        adjustViewers(1);
    }
}

// --- UTILITY FUNCTIONS ---

function adjustViewers(amount) {
    state.viewerCount = Math.max(10, state.viewerCount + amount);
    el.viewerCount.textContent = state.viewerCount.toLocaleString();
}

function showBubble(text) {
    el.reactionBubble.textContent = text;
    el.reactionBubble.classList.add('active');
    
    // Hide bubble after 3 seconds
    if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);
    window.bubbleTimeout = setTimeout(() => {
        el.reactionBubble.classList.remove('active');
    }, 3000);
}

// Update DOM elements matching state
function updateUI() {
    // Fullness
    const fullnessPercent = Math.min(100, (state.fullness / state.maxFullness) * 100);
    el.fullnessVal.textContent = `${Math.floor(fullnessPercent)}%`;
    el.fullnessBar.style.width = `${fullnessPercent}%`;
    
    // Spiciness
    el.spiceVal.textContent = `${Math.floor(state.spiciness)}%`;
    el.spiceBar.style.width = `${state.spiciness}%`;
    
    // Calories & Gold
    el.caloriesVal.textContent = `${state.calories.toLocaleString()} kcal`;
    el.goldVal.textContent = `${state.gold.toLocaleString()}개`;
    
    // Viewers & Likes
    el.viewerCount.textContent = state.viewerCount.toLocaleString();
    el.likeCount.textContent = state.likeCount.toLocaleString();
    
    // Upgrades Costs and level text
    updateUpgradeButton(el.upSpeedBtn, el.upSpeedLvl, state.upgrades.speed);
    updateUpgradeButton(el.upStomachBtn, el.upStomachLvl, state.upgrades.stomach);
    updateUpgradeButton(el.upSpiceBtn, el.upSpiceLvl, state.upgrades.spice);
}

function updateUpgradeButton(btnElement, lvlElement, upgrade) {
    lvlElement.textContent = `Lv.${upgrade.level}`;
    
    if (upgrade.level >= upgrade.maxLevel) {
        btnElement.textContent = "MAX";
        btnElement.className = "upgrade-btn maxed";
        btnElement.disabled = true;
    } else {
        const cost = getUpgradeCost(upgrade);
        btnElement.textContent = `⭐ ${cost}개`;
        btnElement.disabled = state.gold < cost;
    }
}

// Start simulation
init();
