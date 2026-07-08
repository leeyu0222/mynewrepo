/* ==========================================================================
   YOUTUBE MUKBANG CREATOR SIMULATOR - SYSTEM ENGINE
   ========================================================================== */

// --- GAME STATE ---
const state = {
    subscribers: 98200,
    goalSubscribers: 100000,
    revenue: 0,
    calories: 0,
    fullness: 0,
    maxFullness: 100,
    spiciness: 0,
    viewerCount: 8400,
    likeCount: 5200,
    streamTime: 0,
    isChewing: false,
    soundEnabled: true,
    silverAwardAchieved: false,
    missionsCompleted: 0, // Track how many missions done for food unlock
    
    // Combo Tracking
    lastEatenFood: null,
    tteokbokkiCount: 0,
    tanghuluCount: 0,
    sweetSaltyComboCount: 0,
    crunchDuration: 0, // seconds maintained above 80% decibel
    
    // Active Mission State
    activeMission: null,
    
    // Upgrades
    upgrades: {
        mic: { level: 1, maxLevel: 5, baseCost: 50000, costMultiplier: 1.8 },
        water: { level: 1, maxLevel: 5, baseCost: 70000, costMultiplier: 2.0 },
        stomach: { level: 1, maxLevel: 5, baseCost: 90000, costMultiplier: 2.2 }
    }
};

// --- FOOD SPECS ---
const FOODS = {
    maratang: {
        name: "🔥 마라탕",
        calorie: 650,
        fullness: 20,
        spice: 50,
        chewDuration: 2000,
        chewSound: "slurpy",
        locked: false,
        comments: [
            "마라 국물 소리 진짜 침샘 자극 ㄷㄷ",
            "얼얼한 거 리액션 보소 ㅋㅋ",
            "치비 마라 중독됐다 저거ㅋㅋ",
            "마라탕 땡기게 하지 마ㅠㅠ",
            "스코빌 얼마야 저거??"
        ]
    },
    tanghulu: {
        name: "🍓 반짝 탕후루",
        calorie: 200,
        fullness: 8,
        spice: 0,
        chewDuration: 1500,
        chewSound: "glassy",
        locked: false,
        comments: [
            "와그작 소리 미쳤다 ㄷㄷ",
            "탕후루 설탕 코팅 ASMR 종결자네",
            "치비 오늘 당 충전 제대로 하네!",
            "설탕막 얇은 거 보소 개존맛이겠다",
            "단짠단짠 가나요? ㅋㅋㅋ"
        ]
    },
    icecream: {
        name: "🍦 여름 아이스크림",
        calorie: 280,
        fullness: 12,
        spice: -20,
        chewDuration: 1200,
        chewSound: "creamy",
        locked: false,
        comments: [
            "매운 거 먹고 아이스크림 조합 ㄹㅇ 천재",
            "녹기 전에 빨리 먹어야지 ㅋㅋ",
            "아이스크림 먹는 소리도 ASMR이냐??",
            "저 상큼함이 화면 통해서도 느껴짐",
            "다이어트는 내일부터..."
        ]
    },
    bingsu: {
        name: "🍧 설빙 과일 빙수",
        calorie: 420,
        fullness: 25,
        spice: -30,
        chewDuration: 1800,
        chewSound: "icy",
        locked: true, // Unlocked after mission 1
        missionRequired: 1,
        comments: [
            "설빙 빙수 ㄷㄷ 시원해보여",
            "과일 빙수 조합 완벽하다",
            "빙수 먹방 보면서 더위 씻어내는 중 ㅋ",
            "저거 얼마나 달어?? 입에 침고임",
            "미션 클리어 보상 빙수ㄷㄷ 레전드"
        ]
    },
    slush: {
        name: "🥤 과일 슬러쉬",
        calorie: 310,
        fullness: 15,
        spice: -15,
        chewDuration: 1300,
        chewSound: "slurpy",
        locked: true, // Unlocked after mission 2
        missionRequired: 2,
        comments: [
            "슬러쉬 마시는 소리 ㄷㄷ ASMR",
            "딸기 슬러쉬 갈증 자극하지 마라!!",
            "오렌지x딸기 조합 신박하다",
            "저거 마시면 뇌가 얼어붙겠다ㅋㅋ",
            "미션 보상 슬러쉬 실화냐 ㄷㄷ"
        ]
    },
    yeobgi: {
        name: "💀 엽기떡볶이",
        calorie: 780,
        fullness: 30,
        spice: 90,
        chewDuration: 2400,
        chewSound: "chewy",
        locked: true, // Unlocked after mission 3
        missionRequired: 3,
        comments: [
            "엽떡 ㄷㄷ 눈물 콧물 각이다",
            "저 빨간색 보소 스코빌 10만 넘겠다",
            "용감해 진짜... 나는 못 먹음",
            "엽기 먹으면 반드시 아이스크림 필요",
            "미션3 클리어자만 볼 수 있는 음식ㄷㄷ"
        ]
    },
    takis: {
        name: "🌀 TAKIS FUEGO",
        calorie: 450,
        fullness: 18,
        spice: 100,
        chewDuration: 2000,
        chewSound: "crunchy",
        locked: true, // Unlocked after all missions
        missionRequired: 4, // All missions done
        comments: [
            "TAKIS ㄷㄷ 전 세계 먹방 유튜버 떨게 만드는 그 스낵",
            "멕시코 스낵 맞음?? 정말 그렇게 매운 거야??",
            "치비가 TAKIS 먹방 하면 구독 바로 누름",
            "FUEGO 레전드 컬러 ㄷㄷ",
            "최종 보스 음식 클리어!! 슈퍼챗 500K 발사!!"
        ]
    }
};

// --- REALISTIC CHAT DIALECTS ---
const RANDOM_USERNAMES = [
    "쩝쩝단_팀장", "먹방요정치비", "ASMR소리성애자", "야식딜리버리", "하꼬탈출기원",
    "실버버튼가자", "탕후루중독자", "치킨은살안쪄요", "엽떡최고존엄", "슈퍼챗발사기",
    "구독과좋아요", "침샘폭발러", "방구석미식가", "탄수화물이좋아", "프로소통러"
];

const GENERAL_CHATS = [
    "하꼬 탈출하고 대기업 가자!!",
    "리액션 찰지네 ㅋㅋㅋ",
    "구독 누르고 갑니다~",
    "이 방 소통 잘해서 너무 편함",
    "오늘 10만 찍고 실버버튼 언박싱 가자!",
    "소리 퀄리티 왜케 좋음? ㄷㄷ",
    "다이어트 포기하게 만드는 채널이네",
    "치비 넘 귀엽다 진짜 ㅋㅋㅋ"
];

const IDLE_CHATS = [
    "스트리머 멍때림? ㅋㅋㅋ",
    "다음 음식 먹여줘라!!",
    "물 한잔 마셔 치비야",
    "배부른가? 숟가락 속도 느려짐",
    "미션 언제 나옴? 슈퍼챗 쏠 장전 완료",
    "먹방 끊기면 안 됨! 현기증 난단 말이에요"
];

const MISSION_FAILED_CHATS = [
    "아 미션 실패 개꿀ㅋㅋㅋ",
    "컨트롤 실화냐? 까비",
    "슈퍼챗 날아갔네 ㅠㅠ 아쉽",
    "다음 미션 가자 다음꺼!",
    "치비 배불러서 실패한 듯 ㅋㅋㅋ"
];

const MEMBERSHIP_NAMES = ["쩝쩝단 우등회원", "대위장 크루", "실버벨 패밀리", "치비수호대"];

// --- MISSION SYSTEM DATABASE ---
const MISSION_TEMPLATES = [
    {
        type: "spicy_rush",
        desc: "15초 안에 마라탕/엽떡 3번 먹이기! (매운맛 돌격)",
        duration: 15,
        target: 3,
        reward: 80000,
        check: (state, action) => {
            if (action === 'feed' && (state.lastEatenFood === 'maratang' || state.lastEatenFood === 'yeobgi')) {
                return 1;
            }
            return 0;
        }
    },
    {
        type: "sweet_salty",
        desc: "20초 안에 매운맛(마라탕/엽떡)과 단맛(탕후루/아이스크림) 번갈아 3번 먹이기!",
        duration: 20,
        target: 3,
        reward: 120000,
        check: (state, action) => {
            if (action === 'combo_sweet_salty') {
                return 1;
            }
            return 0;
        }
    },
    {
        type: "asmr_volume",
        desc: "12초 동안 탕후루 혹은 Takis 2번 먹여 ASMR 와그작 소리 유지하기!",
        duration: 12,
        target: 2,
        reward: 70000,
        check: (state, action) => {
            if (action === 'feed' && (state.lastEatenFood === 'tanghulu' || state.lastEatenFood === 'takis')) {
                return 1;
            }
            return 0;
        }
    },
    {
        type: "fullness_lock",
        desc: "15초 동안 포만감 게이지를 60% 이상으로 유지하기!",
        duration: 15,
        target: 1,
        reward: 90000,
        check: (state, action) => {
            const fullnessPercent = (state.fullness / state.maxFullness) * 100;
            if (fullnessPercent >= 60) {
                return 'continuous';
            }
            return 'broken';
        }
    }
];

// --- WEB AUDIO ENGINE ---
let audioCtx = null;
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playCrunch(type) {
    if (!state.soundEnabled) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const bufferSize = audioCtx.sampleRate * 0.12;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    if (type === 'crunchy') {
        filter.type = 'bandpass';
        filter.frequency.value = 2400;
        filter.Q.value = 2.0;
    } else if (type === 'glassy') {
        filter.type = 'highpass';
        filter.frequency.value = 3500;
    } else {
        filter.type = 'lowpass';
        filter.frequency.value = 900;
    }

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noise.start();
}

function playGulp() {
    if (!state.soundEnabled) return;
    initAudio();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.22);
    
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.35, audioCtx.currentTime + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.23);
}

function playDonationChime() {
    if (!state.soundEnabled) return;
    initAudio();
    const notes = [293.66, 369.99, 440.00, 587.33, 739.99, 880.00]; // D Major Chord
    notes.forEach((freq, idx) => {
        const time = audioCtx.currentTime + idx * 0.07;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.12, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(time);
        osc.stop(time + 0.36);
    });
}

function playSpicyBreath() {
    if (!state.soundEnabled) return;
    initAudio();
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    filter.Q.value = 1.8;

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 0.12);
    gainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noise.start();
}

function playToiletFlushSound() {
    if (!state.soundEnabled) return;
    initAudio();
    
    // Create a 2.5 second noise buffer
    const bufferSize = audioCtx.sampleRate * 2.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
    // sweep the lowpass filter frequency down like a flush
    filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 2.5);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 1.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.5);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    noise.start();
}


// --- CONFETTI GRAPHICS ENGINE ---
const canvas = document.getElementById('confetti-canvas');
const ctx = canvas.getContext('2d');
let confettiParticles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Confetti {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -100 - 20;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 6 + 4;
        this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        if (this.y > canvas.height) {
            this.y = -20;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
    }
}

function launchConfetti(count = 100) {
    confettiParticles = [];
    for (let i = 0; i < count; i++) {
        confettiParticles.push(new Confetti());
    }
}

function animateConfetti() {
    if (confettiParticles.length > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiParticles.forEach((p, idx) => {
            p.update();
            p.draw();
        });
        
        // Decay slowly
        if (Math.random() < 0.05 && confettiParticles.length > 5) {
            confettiParticles.pop();
        }
    }
    requestAnimationFrame(animateConfetti);
}
animateConfetti();

// --- DOM REGISTRY ---
const el = {
    avatarImg: document.getElementById('avatar-img'),
    avatarContainer: document.getElementById('avatar-container'),
    avatarSpeech: document.getElementById('avatar-speech'),
    
    // Header
    viewerCount: document.getElementById('viewer-count'),
    likeCount: document.getElementById('like-count'),
    subCount: document.getElementById('sub-count'),
    goalSubBar: document.getElementById('goal-sub-bar'),
    goalPercentLbl: document.getElementById('goal-percent-lbl'),
    revenueCount: document.getElementById('revenue-count'),
    
    // Sound & Visuals
    soundToggleBtn: document.getElementById('sound-toggle-btn'),
    eqBars: document.getElementById('eq-bars').children,
    
    // Status
    fullnessTxt: document.getElementById('fullness-txt'),
    fullnessBar: document.getElementById('fullness-bar'),
    spiceTxt: document.getElementById('spice-txt'),
    spiceBar: document.getElementById('spice-bar'),
    toiletBtn: document.getElementById('toilet-btn'),
    
    // Chat
    chatMessages: document.getElementById('chat-messages'),
    pinnedScArea: document.getElementById('pinned-superchats-area'),
    userChatInput: document.getElementById('user-chat-input'),
    sendChatBtn: document.getElementById('send-chat-btn'),
    
    // Upgrades
    upMicBtn: document.querySelector('#up-mic .upgrade-btn'),
    upWaterBtn: document.querySelector('#up-water .upgrade-btn'),
    upStomachBtn: document.querySelector('#up-stomach .upgrade-btn'),
    upMicLvl: document.getElementById('mic-lvl-lbl'),
    upWaterLvl: document.getElementById('water-lvl-lbl'),
    upStomachLvl: document.getElementById('stomach-lvl-lbl'),
    
    // Mission
    missionCard: document.getElementById('mission-card'),
    missionRewardTxt: document.getElementById('mission-reward-txt'),
    missionDescTxt: document.getElementById('mission-desc-txt'),
    missionProgressBar: document.getElementById('mission-progress-bar'),
    missionTimerTxt: document.getElementById('mission-timer-txt'),
    missionStatusTxt: document.getElementById('mission-status-txt'),
    
    // Superchat Popup
    superchatOverlay: document.getElementById('superchat-overlay'),
    scAlertUser: document.getElementById('sc-alert-user'),
    scAlertPrice: document.getElementById('sc-alert-price'),
    scAlertMsg: document.getElementById('sc-alert-msg')
};

// --- INITIALIZATION ---
function init() {
    setupEvents();
    updateUI();
    
    // Timers
    setInterval(tickSystem, 1000);
    setInterval(tickDigestionAndSpiceRecovery, 2000);
    setInterval(generateSimulatedChat, 3000);
    
    // Start first mission in 5s
    setTimeout(triggerRandomMission, 5000);
    
    addChatMessage("SYSTEM", "대기업 유튜버를 향한 실시간 스트리밍이 시작되었습니다!", "system");
}

function setupEvents() {
    // Sound On/Off
    el.soundToggleBtn.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        el.soundToggleBtn.textContent = state.soundEnabled ? "🔊 Sound On" : "🔇 Muted";
        el.soundToggleBtn.style.background = state.soundEnabled ? "rgba(0,0,0,0.6)" : "rgba(255,0,0,0.4)";
    });

    // Feeding cards click
    document.querySelectorAll('.food-item-card').forEach(card => {
        const feedBtn = card.querySelector('.feed-btn');
        feedBtn.addEventListener('click', () => {
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

    // User Chat Input
    el.sendChatBtn.addEventListener('click', sendUserChat);
    el.userChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserChat();
    });

    // Toilet action
    el.toiletBtn.addEventListener('click', goToToilet);
}

// --- CORE SYSTEM TICK (1s) ---
function tickSystem() {
    state.streamTime++;
    
    // Slowly tick up subscribers
    let subTick = Math.floor(Math.random() * 4) + 1;
    if (state.viewerCount > 10000) subTick += 2;
    state.subscribers = Math.min(110000, state.subscribers + subTick);
    
    // Viewers logic
    if (state.isChewing) {
        if (Math.random() < 0.2) state.viewerCount += Math.floor(Math.random() * 40) + 10;
    } else {
        if (Math.random() < 0.15) state.viewerCount = Math.max(2000, state.viewerCount - Math.floor(Math.random() * 20));
    }
    
    // Manage active mission timer
    if (state.activeMission) {
        state.activeMission.timeLeft -= 1.0;
        
        // Check continuous conditions like fullness locks
        if (state.activeMission.type === 'fullness_lock') {
            const checkVal = state.activeMission.check(state);
            if (checkVal === 'continuous') {
                state.activeMission.progress = 1; // Completed condition for now
            } else {
                state.activeMission.progress = 0; // Broken
            }
        }

        // Update Mission UI
        const percent = (state.activeMission.timeLeft / state.activeMission.duration) * 100;
        el.missionProgressBar.style.width = `${percent}%`;
        el.missionTimerTxt.textContent = `${state.activeMission.timeLeft.toFixed(0)}초 남음`;
        
        if (state.activeMission.type === 'sweet_salty') {
            el.missionStatusTxt.textContent = `진행도: ${state.sweetSaltyComboCount} / ${state.activeMission.target}`;
        } else if (state.activeMission.type === 'spicy_rush') {
            el.missionStatusTxt.textContent = `진행도: ${state.tteokbokkiCount} / ${state.activeMission.target}`;
        } else if (state.activeMission.type === 'asmr_volume') {
            el.missionStatusTxt.textContent = `진행도: ${state.crunchDuration} / ${state.activeMission.target}`;
        } else {
            el.missionStatusTxt.textContent = state.activeMission.progress >= 1 ? "유지 중! 🟢" : "조건 미달! 🔴";
        }
        
        // Time over check
        if (state.activeMission.timeLeft <= 0) {
            evalMissionEnd();
        }
    }
    
    // Animate visualizer idle frequencies
    if (!state.isChewing) {
        for (let i = 0; i < el.eqBars.length; i++) {
            el.eqBars[i].style.height = `${Math.floor(Math.random() * 12) + 5}%`;
        }
    }

    checkMilestones();
    updateUI();
}

// --- FEED FOOD LOOP ---
function feedFood(type, cardEl) {
    if (state.isChewing) {
        showSpeechBalloon("아직 입안에 음식이 가득해요! 냠냠...");
        return;
    }
    const food = FOODS[type];
    if (!food) return;
    
    // Guard: don't allow eating locked foods
    if (food.locked && (food.missionRequired > state.missionsCompleted)) {
        showSpeechBalloon(`🔒 아직 잠긴 음식이에요! 미션 ${food.missionRequired}을 클리어하세요!`);
        return;
    }

    if (state.fullness + food.fullness > state.maxFullness) {
        showSpeechBalloon("더 이상 못 먹겠어요! ㅠㅠ 소화제가 급해!");
        playGulp();
        return;
    }

    state.isChewing = true;
    animateFlyingFood(cardEl, type);
    
    // Setup character state
    el.avatarContainer.className = "character-wrapper state-eating";
    
    // Setup last eaten & update combo patterns
    const prevEaten = state.lastEatenFood;
    state.lastEatenFood = type;
    
    // Track missions criteria
    if (state.activeMission) {
        if (state.activeMission.type === 'spicy_rush' && (type === 'maratang' || type === 'yeobgi')) {
            state.tteokbokkiCount++;
            if (state.tteokbokkiCount >= state.activeMission.target) {
                state.activeMission.progress = state.activeMission.target;
            }
        }
        
        if (state.activeMission.type === 'sweet_salty') {
            // Alternate sweet/salty check
            if ((prevEaten === 'maratang' && type === 'tanghulu') || 
                (prevEaten === 'tanghulu' && type === 'maratang') ||
                (prevEaten === 'yeobgi' && type === 'icecream') ||
                (prevEaten === 'icecream' && type === 'maratang')) {
                state.sweetSaltyComboCount++;
                spawnHeartParticles(10);
                if (state.sweetSaltyComboCount >= state.activeMission.target) {
                    state.activeMission.progress = state.activeMission.target;
                }
            }
        }

        if (state.activeMission.type === 'asmr_volume' && (type === 'tanghulu' || type === 'takis')) {
            state.crunchDuration++;
            if (state.crunchDuration >= state.activeMission.target) {
                state.activeMission.progress = state.activeMission.target;
            }
        }
    }

    // Speed enhancement modifier
    const chewDuration = food.chewDuration * Math.pow(0.82, state.upgrades.mic.level - 1);
    
    // Equalizer jump frequency & crunch loop
    let ticks = 0;
    const chewInterval = setInterval(() => {
        playCrunch(food.chewSound);
        // Elevate visualizer heights to high values (ASMR volume feedback)
        for (let i = 0; i < el.eqBars.length; i++) {
            el.eqBars[i].style.height = `${Math.floor(Math.random() * 55) + 40}%`;
        }
        spawnCrumbsParticles();
        ticks++;
    }, 280);

    setTimeout(() => {
        clearInterval(chewInterval);
        state.isChewing = false;
        
        // Digest states
        state.calories += food.calorie;
        state.fullness += food.fullness;
        
        // Spicy damage modifier
        if (food.spice > 0) {
            state.spiciness = Math.min(100, state.spiciness + food.spice);
        } else if (food.spice < 0) {
            // Cooling effect from icecream, bingsu, slush
            state.spiciness = Math.max(0, state.spiciness + food.spice);
        }

        playGulp();
        updateCharacterState();
        updateUI();
        
        // Chat reactions
        reactChatOnFeed(food);
        
        // Random likes boost
        triggerLikesShower(5);
    }, chewDuration);
}

let toiletCooldownActive = false;

function goToToilet() {
    if (state.isChewing) {
        showSpeechBalloon("아직 음식을 씹고 있어서 화장실에 갈 수 없어요! 😅");
        return;
    }
    if (toiletCooldownActive) {
        showSpeechBalloon("화장실은 자주 갈 수 없어요! 쿨다운 대기 중... 🚽");
        return;
    }
    if (state.fullness === 0) {
        showSpeechBalloon("위장이 이미 비어있어요! 먹방 먼저 합시다! 😋");
        return;
    }

    // Start toilet sequence
    toiletCooldownActive = true;
    el.toiletBtn.disabled = true;
    
    // Play toilet sound
    playToiletFlushSound();

    // Hide character image during bathroom visit
    el.avatarImg.style.opacity = '0';
    showSpeechBalloon("🚽 화장실에서 소화 중... 잠시만요!");
    addChatMessage("SYSTEM", "🚨 크리에이터가 급속 소화를 위해 화장실에 갔습니다. (3초)", "system");
    
    // Add funny viewer chat comments during toilet break
    const toiletChats = [
        "🚽 물소리 콸콸콸 머임 ㅋㅋㅋㅋㅋㅋㅋㅋ",
        "치비 쾌변 기원 ㅋㅋㅋㅋㅋㅋ",
        "자리를 비운 채널 ㅋㅋㅋㅋㅋ 방송사고냐고",
        "ASMR 마이크 성능 화장실까지 가네 ㅋㅋㅋ",
        "소화 다 하고 다시 폭풍 먹방 가자!!"
    ];
    toiletChats.forEach((msg, idx) => {
        setTimeout(() => {
            const randUser = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
            addChatMessage(randUser, msg, "viewer");
        }, (idx + 1) * 500);
    });

    // Make avatar reappear after 3 seconds, set fullness to 0
    setTimeout(() => {
        state.fullness = 0;
        el.avatarImg.style.opacity = '1';
        showSpeechBalloon("위장 비우기 완료! 다시 먹방 시작해볼까요? 😋");
        addChatMessage("SYSTEM", "🟢 크리에이터 복귀! 위장 포만감이 0%로 초기화되었습니다.", "system");
        updateUI();
    }, 3000);

    // Cooldown logic (20 seconds)
    let cooldownTimer = 20;
    const cooldownInterval = setInterval(() => {
        cooldownTimer--;
        el.toiletBtn.textContent = `🚽 화장실 쿨다운: ${cooldownTimer}초`;
        if (cooldownTimer <= 0) {
            clearInterval(cooldownInterval);
            toiletCooldownActive = false;
            el.toiletBtn.disabled = false;
            el.toiletBtn.textContent = "🚽 급속 소화! 화장실 다녀오기 (쿨다운: 20초)";
        }
    }, 1000);
}

// Animate food elements
function animateFlyingFood(cardEl, type) {
    const thumb = cardEl.querySelector('.food-thumb img');
    const thumbRect = thumb.getBoundingClientRect();
    const screenRect = document.getElementById('stream-screen').getBoundingClientRect();
    
    const flyer = document.createElement('img');
    flyer.src = thumb.src;
    flyer.className = 'flying-food';
    
    const startX = thumbRect.left - screenRect.left + (thumbRect.width / 2) - 25;
    const startY = thumbRect.top - screenRect.top + (thumbRect.height / 2) - 25;
    const endX = screenRect.width / 2 - 25;
    const endY = screenRect.height * 0.55;
    
    flyer.style.setProperty('--start-x', `${startX}px`);
    flyer.style.setProperty('--start-y', `${startY}px`);
    flyer.style.setProperty('--end-x', `${endX}px`);
    flyer.style.setProperty('--end-y', `${endY}px`);
    
    document.getElementById('stream-screen').appendChild(flyer);
    flyer.addEventListener('animationend', () => flyer.remove());
}

// Character state visual update
function updateCharacterState() {
    if (state.spiciness > 50) {
        el.avatarContainer.className = "character-wrapper state-spicy";
        showSpeechBalloon("습-하!!! 너무 매워서 기절할 것 같아요!! 🥛🔥");
        playSpicyBreath();
        spawnSteamParticles(10);
    } else {
        el.avatarContainer.className = "character-wrapper state-idle";
    }
}

// Tick recovery
function tickDigestionAndSpiceRecovery() {
    // DIGESTION: digestion pills upgrade boost
    const digestionRate = 3 + (state.upgrades.stomach.level - 1) * 3;
    if (state.fullness > 0) {
        state.fullness = Math.max(0, state.fullness - digestionRate);
    }
    
    // SPICINESS RECOVERY: milk setup boost
    const recoveryRate = 5 + (state.upgrades.water.level - 1) * 4;
    if (state.spiciness > 0) {
        state.spiciness = Math.max(0, state.spiciness - recoveryRate);
        if (state.spiciness <= 50 && el.avatarContainer.classList.contains('state-spicy')) {
            updateCharacterState();
        }
    }
    updateUI();
}

// --- MISSION ENGINE ---
function triggerRandomMission() {
    if (state.activeMission) return;
    
    const randTemplate = MISSION_TEMPLATES[Math.floor(Math.random() * MISSION_TEMPLATES.length)];
    
    // Deep copy
    state.activeMission = {
        ...randTemplate,
        timeLeft: randTemplate.duration,
        progress: 0
    };
    
    // Reset combo counters
    state.tteokbokkiCount = 0;
    state.tanghuluCount = 0;
    state.sweetSaltyComboCount = 0;
    state.crunchDuration = 0;
    
    el.missionRewardTxt.textContent = `₩${state.activeMission.reward.toLocaleString()} 후원 예정`;
    el.missionDescTxt.textContent = state.activeMission.desc;
    el.missionProgressBar.style.width = '100%';
    el.missionCard.classList.add('active');
    
    addChatMessage("SYSTEM", `🚨 새로운 실시간 방송 미션이 발생했습니다! [${state.activeMission.desc}]`, "system");
}

// --- FOOD UNLOCK BY MISSION ---
function unlockFoodByMission(missionsCompleted) {
    const unlockMap = {
        1: 'food-bingsu',
        2: 'food-slush',
        3: 'food-yeobgi',
        4: 'food-takis'
    };
    
    const foodId = unlockMap[missionsCompleted];
    if (!foodId) return;
    
    const foodCard = document.getElementById(foodId);
    if (!foodCard) return;
    
    // Unlock the card
    foodCard.classList.add('unlocked');
    
    // Enable the button
    const btn = foodCard.querySelector('.locked-btn');
    if (btn) {
        btn.disabled = false;
        btn.classList.remove('locked-btn');
        btn.textContent = '한 입 먹이기';
    }
    
    // Show unlock notification in chat
    const foodNames = {
        'food-bingsu': '🍧 설빙 과일 빙수',
        'food-slush': '🥤 과일 슬러쉬',
        'food-yeobgi': '💀 엽기떡볶이',
        'food-takis': '🌀 TAKIS FUEGO'
    };
    
    addChatMessage("SYSTEM", `🔓 새 음식 해금!! [${foodNames[foodId]}] 이제 먹을 수 있어요!`, "system");
    showSpeechBalloon(`새 음식 해금!! ${foodNames[foodId]} 🔓`);
}

function evalMissionEnd() {
    const mission = state.activeMission;
    if (!mission) return;
    
    let isSuccess = false;
    
    if (mission.type === 'fullness_lock') {
        isSuccess = mission.progress >= 1;
    } else {
        isSuccess = mission.progress >= mission.target;
    }
    
    if (isSuccess) {
        // SUCCESS
        // Apply reward bonus from Mic upgrade
        const bonusMultiplier = 1.0 + (state.upgrades.mic.level - 1) * 0.20;
        const finalReward = Math.floor(mission.reward * bonusMultiplier);
        
        state.revenue += finalReward;
        state.missionsCompleted++;
        
        // Subscriber boost
        const subBoost = Math.floor(Math.random() * 800) + 500;
        state.subscribers = Math.min(110000, state.subscribers + subBoost);
        
        // FOOD UNLOCK: unlock locked foods based on mission count
        unlockFoodByMission(state.missionsCompleted);
        
        // Launch Super Chat Popup
        triggerSuperchatAlert(finalReward);
        
        // Launch celebration confetti
        launchConfetti(80);
        
        addChatMessage("SYSTEM", `🎉 미션 성공!! ₩${finalReward.toLocaleString()} 후원을 획득했습니다! (+구독자 ${subBoost}명)`, "system");
    } else {
        // FAILURE
        // Trigger negative chat comments
        const mockCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < mockCount; i++) {
            setTimeout(() => {
                const randUser = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
                const randMsg = MISSION_FAILED_CHATS[Math.floor(Math.random() * MISSION_FAILED_CHATS.length)];
                addChatMessage(randUser, randMsg, "viewer");
            }, i * 300);
        }
        
        // Viewers drop
        state.viewerCount = Math.max(1000, state.viewerCount - 800);
        addChatMessage("SYSTEM", `✗ 미션 시간 초과로 실패했습니다. 시청자들이 실망했습니다.`, "system");
    }
    
    // Clear active mission
    el.missionCard.classList.remove('active');
    state.activeMission = null;
    
    // Trigger next mission in 20-30s
    setTimeout(triggerRandomMission, Math.floor(Math.random() * 10000) + 20000);
}

// --- SUPER CHAT POPUP ---
function triggerSuperchatAlert(amount) {
    const user = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    const comment = DONATION_COMMENTS_PREMIUM(amount);
    
    el.scAlertUser.textContent = user;
    el.scAlertPrice.textContent = `₩${amount.toLocaleString()}`;
    el.scAlertMsg.textContent = `"${comment}"`;
    
    playDonationChime();
    el.superchatOverlay.classList.add('active');
    
    // Add Super Chat to chat feed
    addSuperChatBubble(user, amount, comment);
    
    // Add Pinned Banner
    addPinnedSuperchat(user, amount);
    
    // Spawn gold particles
    spawnCurrencyParticles(30);

    setTimeout(() => {
        el.superchatOverlay.classList.remove('active');
    }, 4500);
}

function DONATION_COMMENTS_PREMIUM(amount) {
    if (amount >= 100000) {
        return "미션 클리어 대박이다ㅋㅋㅋ 구독 박았어요! 치비 먹방 채널 영원해라!";
    }
    return "미션 성공 축하드려요! 리얼 ASMR 대박이네요! 화이팅!";
}

// Pinned Banner at the top of chat
function addPinnedSuperchat(user, amount) {
    const banner = document.createElement('div');
    banner.className = `pinned-sc-banner sc-${getSCTierClass(amount)}`;
    banner.innerHTML = `
        <div class="pinned-sc-avatar">${user[0]}</div>
        <div class="pinned-sc-details">
            <span>${user}</span>
            <span>₩${amount.toLocaleString()}</span>
        </div>
    `;
    
    el.pinnedScArea.appendChild(banner);
    
    // Animate banner progress bar decay (pins for 10s)
    let timeLeft = 100;
    const decayInterval = setInterval(() => {
        timeLeft -= 1;
        banner.style.setProperty('--progress', `${timeLeft}%`);
        if (timeLeft <= 0) {
            clearInterval(decayInterval);
            banner.remove();
        }
    }, 100);
}

function getSCTierClass(amount) {
    if (amount >= 120000) return 'red';
    if (amount >= 90000) return 'orange';
    if (amount >= 70000) return 'yellow';
    if (amount >= 50000) return 'teal';
    return 'blue';
}

// Add Super Chat bubble to feed
function addSuperChatBubble(user, amount, message) {
    const bubble = document.createElement('div');
    bubble.className = `sc-bubble-wrapper sc-${getSCTierClass(amount)}`;
    bubble.innerHTML = `
        <div class="sc-bubble-header">
            <span>⭐ ${user}</span>
            <span>₩${amount.toLocaleString()}</span>
        </div>
        <div class="sc-bubble-body">
            ${message}
        </div>
    `;
    el.chatMessages.appendChild(bubble);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

// --- REALTIME CHAT STREAM ---
function generateSimulatedChat() {
    if (state.activeMission && Math.random() < 0.4) {
        // Chat focuses on the mission
        const missionChats = [
            "미션 가즈아!! 🔥🔥",
            "가볍게 성공각? ㅋㅋㅋ",
            "유튜브 대기업 되려면 미션 성공해야 됨 ㄷㄷ",
            "치비 미션 파이팅!!",
            "이거 깨면 10만원임? 지리네 ㅋㅋㅋ"
        ];
        const user = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
        const msg = missionChats[Math.floor(Math.random() * missionChats.length)];
        addChatMessage(user, msg);
        return;
    }
    
    let pool = GENERAL_CHATS;
    if (!state.isChewing) {
        pool = [...GENERAL_CHATS, ...IDLE_CHATS];
    }
    
    // Random membership alert
    if (Math.random() < 0.1) {
        const user = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
        const tier = MEMBERSHIP_NAMES[Math.floor(Math.random() * MEMBERSHIP_NAMES.length)];
        const alertEl = document.createElement('div');
        alertEl.className = 'chat-system-alert';
        alertEl.textContent = `🎉 [${user}]님이 [${tier}] 채널 멤버십에 가입했습니다! 환영합니다! 🎉`;
        el.chatMessages.appendChild(alertEl);
        el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
        
        // Sub boost
        state.subscribers += 1;
        updateUI();
        return;
    }
    
    const user = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    const msg = pool[Math.floor(Math.random() * pool.length)];
    addChatMessage(user, msg);
}

function reactChatOnFeed(food) {
    const size = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < size; i++) {
        setTimeout(() => {
            const user = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
            const msg = food.comments[Math.floor(Math.random() * food.comments.length)];
            addChatMessage(user, msg);
        }, i * 300);
    }
}

function addChatMessage(username, text, type = "viewer") {
    const item = document.createElement('div');
    item.className = `regular-chat ${type === 'user' ? 'user-message' : ''}`;
    
    if (type === 'system') {
        item.innerHTML = `<div class="chat-body-text" style="color: var(--green-lime); font-weight: 700;">[방송 관제] ${text}</div>`;
    } else {
        item.innerHTML = `
            <div class="chat-avatar">${username[0]}</div>
            <div class="chat-body-text">
                <span class="chat-sender-name">${username}</span>
                <p>${text}</p>
            </div>
        `;
    }
    el.chatMessages.appendChild(item);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
    
    if (el.chatMessages.children.length > 50) {
        el.chatMessages.removeChild(el.chatMessages.firstChild);
    }
}

function sendUserChat() {
    const txt = el.userChatInput.value.trim();
    if (!txt) return;
    
    addChatMessage("Me (크리에이터)", txt, "user");
    el.userChatInput.value = "";
    
    setTimeout(() => {
        const answers = [
            "오늘 미션 꼭 깨보겠습니다! 감사합니다 ㅎㅎ",
            "와주셔서 환영해요! 쩝쩝단 화이팅!",
            "치킨 너무 맛있어요 ㅠㅠ 최고네요",
            "구독 꼭 부탁드려요!! 실버버튼 고지가 바로 앞!"
        ];
        showSpeechBalloon(answers[Math.floor(Math.random() * answers.length)]);
    }, 900);
}

// --- EQUIPMENT UPGRADE SHOP ---
function buyUpgrade(type) {
    const upgrade = state.upgrades[type];
    if (!upgrade) return;
    
    if (upgrade.level >= upgrade.maxLevel) return;
    
    const cost = getUpgradeCost(upgrade);
    if (state.revenue < cost) {
        showSpeechBalloon("돈(수익)이 부족해요! ㅠㅠ 미션을 깨서 슈퍼챗을 유도해주세요!");
        return;
    }
    
    state.revenue -= cost;
    upgrade.level++;
    
    // Apply changes immediately
    if (type === 'stomach') {
        state.maxFullness = 100 + (upgrade.level - 1) * 30;
    }
    
    playGulp();
    updateUI();
    addChatMessage("SYSTEM", `${type === 'mic' ? 'ASMR 마이크' : type === 'water' ? '우유 해소수' : '위장 소화제'}가 레벨업 되었습니다! (Lv.${upgrade.level})`, "system");
}

function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level - 1));
}

// --- PARTICLES ENGINE ---

function spawnCrumbsParticles() {
    const screen = document.getElementById('stream-screen');
    const crumbs = ['🥖', '🥖', '✨', '🔸', '🟡'];
    
    for (let i = 0; i < 3; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.textContent = crumbs[Math.floor(Math.random() * crumbs.length)];
        
        // Spawn near mouth
        particle.style.left = '50%';
        particle.style.bottom = '35%';
        
        const moveX = (Math.random() - 0.5) * 120;
        const moveY = (Math.random() * 50) + 20; // spit downwards/sides
        const rotate = Math.random() * 180;
        
        particle.style.setProperty('--x', `${moveX}px`);
        particle.style.setProperty('--y', `${moveY}px`);
        particle.style.setProperty('--r', `${rotate}deg`);
        
        screen.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }
}

function spawnSteamParticles(count) {
    const screen = document.getElementById('stream-screen');
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.textContent = Math.random() < 0.5 ? '💨' : '🔥';
            
            // Spawn near head
            particle.style.left = `${Math.random() * 20 + 40}%`; // center 40% - 60%
            particle.style.bottom = '55%';
            
            const moveX = (Math.random() - 0.5) * 60;
            const moveY = -(Math.random() * 120 + 80); // float upwards
            const rotate = Math.random() * 90;
            
            particle.style.setProperty('--x', `${moveX}px`);
            particle.style.setProperty('--y', `${moveY}px`);
            particle.style.setProperty('--r', `${rotate}deg`);
            
            screen.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove());
        }, i * 100);
    }
}

function spawnHeartParticles(count) {
    const screen = document.getElementById('stream-screen');
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.textContent = '💖';
        
        // Spawn near character
        particle.style.left = `${Math.random() * 40 + 30}%`;
        particle.style.bottom = '30%';
        
        const moveX = (Math.random() - 0.5) * 160;
        const moveY = -(Math.random() * 200 + 100);
        
        particle.style.setProperty('--x', `${moveX}px`);
        particle.style.setProperty('--y', `${moveY}px`);
        particle.style.setProperty('--r', `${(Math.random() - 0.5) * 60}deg`);
        
        screen.appendChild(particle);
        particle.addEventListener('animationend', () => particle.remove());
    }
}

function spawnCurrencyParticles(count) {
    const screen = document.getElementById('stream-screen');
    const coins = ['💵', '🪙', '✨', '💖', '⭐'];
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.textContent = coins[Math.floor(Math.random() * coins.length)];
            
            particle.style.left = `${Math.random() * 80 + 10}%`;
            particle.style.bottom = '10%';
            
            const moveX = (Math.random() - 0.5) * 220;
            const moveY = -(Math.random() * 300 + 150);
            
            particle.style.setProperty('--x', `${moveX}px`);
            particle.style.setProperty('--y', `${moveY}px`);
            particle.style.setProperty('--r', `${Math.random() * 360}deg`);
            
            screen.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove());
        }, i * 60);
    }
}

function triggerLikesShower(count) {
    state.likeCount += count;
    el.likeCount.textContent = state.likeCount.toLocaleString();
    
    const screen = document.getElementById('stream-screen');
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'floating-particle';
        heart.textContent = '❤️';
        heart.style.left = `${Math.random() * 60 + 20}%`;
        heart.style.bottom = '15%';
        
        const moveX = (Math.random() - 0.5) * 120;
        const moveY = -(Math.random() * 150 + 80);
        
        heart.style.setProperty('--x', `${moveX}px`);
        heart.style.setProperty('--y', `${moveY}px`);
        heart.style.setProperty('--r', `${(Math.random() - 0.5) * 45}deg`);
        
        screen.appendChild(heart);
        heart.addEventListener('animationend', () => heart.remove());
    }
}

// --- MILESTONES (SILVER BUTTON) ---
function checkMilestones() {
    if (state.subscribers >= state.goalSubscribers && !state.silverAwardAchieved) {
        state.silverAwardAchieved = true;
        // Launch giant celebration
        launchConfetti(250);
        playDonationChime();
        
        // Show Silver play button modal
        document.getElementById('silver-modal').style.display = 'flex';
        addChatMessage("SYSTEM", "🏆 [경축] 실시간 구독자 10만 돌파!! 유튜브 코리아 실버버튼 획득! 대기업 유튜버 등극! 🏆", "system");
    }
}

// --- INTERACTION ---
function showSpeechBalloon(text) {
    el.avatarSpeech.textContent = text;
    el.avatarSpeech.classList.add('active');
    
    if (window.balloonTimeout) clearTimeout(window.balloonTimeout);
    window.balloonTimeout = setTimeout(() => {
        el.avatarSpeech.classList.remove('active');
    }, 3000);
}

// --- UI DATA SYNC ---
function updateUI() {
    // Analytics
    el.viewerCount.textContent = state.viewerCount.toLocaleString();
    el.likeCount.textContent = state.likeCount.toLocaleString();
    el.subCount.textContent = state.subscribers.toLocaleString();
    el.revenueCount.textContent = `₩${state.revenue.toLocaleString()}`;
    
    // Sub progress
    const subPercent = Math.min(100, (state.subscribers / state.goalSubscribers) * 100);
    el.goalSubBar.style.width = `${subPercent}%`;
    el.goalPercentLbl.textContent = `${subPercent.toFixed(2)}%`;
    
    // Gauges
    const fullnessPercent = Math.min(100, (state.fullness / state.maxFullness) * 100);
    el.fullnessTxt.textContent = `${Math.floor(fullnessPercent)}%`;
    el.fullnessBar.style.width = `${fullnessPercent}%`;
    
    el.spiceTxt.textContent = `${Math.floor(state.spiciness)}%`;
    el.spiceBar.style.width = `${state.spiciness}%`;
    
    // Upgrades
    updateUpgradeBtn(el.upMicBtn, el.upMicLvl, state.upgrades.mic);
    updateUpgradeBtn(el.upWaterBtn, el.upWaterLvl, state.upgrades.water);
    updateUpgradeBtn(el.upStomachBtn, el.upStomachLvl, state.upgrades.stomach);
}

function updateUpgradeBtn(btn, lvlLbl, upgrade) {
    lvlLbl.textContent = `Lv.${upgrade.level}`;
    if (upgrade.level >= upgrade.maxLevel) {
        btn.textContent = "MAX";
        btn.className = "upgrade-btn maxed";
        btn.disabled = true;
    } else {
        const cost = getUpgradeCost(upgrade);
        btn.textContent = `₩${cost.toLocaleString()}`;
        btn.disabled = state.revenue < cost;
    }
}

// Initialize system
init();
