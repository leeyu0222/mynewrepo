// renderer.js - Realistic 3D SVG Renderer for Mallang World
const MallangRenderer = (() => {

  const SHAPES = {
    circle: `<ellipse cx="50" cy="54" rx="40" ry="38"/>`,
    cloud: `<path d="M 24,66 C 13,66 8,55 17,44 C 10,30 27,18 40,27 C 48,13 72,16 77,31 C 91,29 95,46 86,56 C 94,67 81,77 70,74 C 59,80 34,80 24,66 Z"/>`,
    bear: `<circle cx="24" cy="27" r="14"/><circle cx="76" cy="27" r="14"/><ellipse cx="50" cy="58" rx="40" ry="34"/>`,
    heart: `<path d="M 50,32 C 30,12 6,30 6,54 C 6,76 40,94 50,98 C 60,94 94,76 94,54 C 94,30 70,12 50,32 Z"/>`,
    star: `<path d="M 50,8 L 62,37 L 94,37 L 70,56 L 79,86 L 50,67 L 21,86 L 30,56 L 6,37 L 38,37 Z"/>`,
    cat: `<polygon points="17,37 30,18 36,39"/><polygon points="83,37 70,18 64,39"/><path d="M 17,37 Q 8,37 8,46 L 8,72 Q 8,88 50,88 Q 92,88 92,72 L 92,46 Q 92,37 83,37 Z"/>`,
    needoh_cube: '__SPECIAL__',
    butter_block: '__SPECIAL__'
  };

  const EXPRESSIONS = {
    smile: `
      <circle cx="36" cy="52" r="4" fill="#1a0a20"/>
      <circle cx="64" cy="52" r="4" fill="#1a0a20"/>
      <circle cx="37" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
      <circle cx="65" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
      <path d="M 43,61 Q 50,68 57,61" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
    `,
    wink: `
      <path d="M 30,52 Q 36,46 42,52" stroke="#1a0a20" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <circle cx="64" cy="52" r="4" fill="#1a0a20"/>
      <circle cx="65" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
      <path d="M 43,61 Q 50,68 57,61" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
    `,
    blush: `
      <ellipse cx="26" cy="59" rx="8" ry="5" fill="#ff4d6d" opacity="0.45"/>
      <ellipse cx="74" cy="59" rx="8" ry="5" fill="#ff4d6d" opacity="0.45"/>
      <circle cx="36" cy="52" r="4" fill="#1a0a20"/>
      <circle cx="64" cy="52" r="4" fill="#1a0a20"/>
      <circle cx="37" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
      <circle cx="65" cy="50" r="1.5" fill="#fff" opacity="0.7"/>
      <path d="M 43,61 Q 50,68 57,61" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
    `,
    sleepy: `
      <path d="M 29,52 Q 36,58 43,52" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 57,52 Q 64,58 71,52" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="50" cy="64" r="3.5" fill="#1a0a20"/>
      <text x="74" y="38" font-size="11" font-weight="900" fill="#1a0a20" opacity="0.6" font-family="Arial">z</text>
      <text x="80" y="26" font-size="15" font-weight="900" fill="#1a0a20" opacity="0.6" font-family="Arial">Z</text>
    `,
    shocked: `
      <circle cx="36" cy="50" r="5.5" fill="#1a0a20"/>
      <circle cx="64" cy="50" r="5.5" fill="#1a0a20"/>
      <circle cx="34" cy="48" r="2" fill="#fff"/>
      <circle cx="62" cy="48" r="2" fill="#fff"/>
      <ellipse cx="50" cy="65" rx="5" ry="7" fill="#1a0a20"/>
    `,
    crying: `
      <path d="M 31,54 Q 36,48 41,54" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 59,54 Q 64,48 69,54" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M 33,56 C 33,56 30,67 33,71 C 36,67 33,56 33,56" fill="#60a5fa"/>
      <path d="M 67,56 C 67,56 64,67 67,71 C 70,67 67,56 67,56" fill="#60a5fa"/>
      <path d="M 43,64 Q 50,59 57,64" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
    `,
    squeezed: `
      <path d="M 29,48 L 41,56 M 29,56 L 41,48" stroke="#1a0a20" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 59,48 L 71,56 M 59,56 L 71,48" stroke="#1a0a20" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 43,63 Q 47,58 50,63 Q 53,68 57,63" stroke="#1a0a20" stroke-width="3" stroke-linecap="round" fill="none"/>
    `
  };

  const ACCESSORIES = {
    none: ``,
    crown: `
      <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffe566"/><stop offset="100%" stop-color="#ff9500"/></linearGradient></defs>
      <path d="M 32,22 L 37,7 L 50,14 L 63,7 L 68,22 Z" fill="url(#cg)" stroke="#c8820a" stroke-width="1.5"/>
      <circle cx="32" cy="22" r="2.5" fill="#ff6b6b"/><circle cx="37" cy="7" r="3" fill="#74c0fc"/>
      <circle cx="50" cy="14" r="3" fill="#ff4d6d"/><circle cx="63" cy="7" r="3" fill="#74c0fc"/>
      <circle cx="68" cy="22" r="2.5" fill="#ff6b6b"/>
    `,
    bow: `
      <path d="M 38,22 C 33,13 28,27 38,23 C 48,27 43,13 38,22 Z" fill="#ff4d6d" stroke="#c9184a" stroke-width="1.5"/>
      <circle cx="38" cy="22" r="4" fill="#ff85a1"/>
    `,
    glasses: `
      <ellipse cx="36" cy="51" rx="10" ry="8" fill="#1a1a2e" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      <ellipse cx="64" cy="51" rx="10" ry="8" fill="#1a1a2e" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
      <path d="M 46,51 Q 50,48 54,51" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M 30,50 L 35,46" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M 58,50 L 63,46" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" stroke-linecap="round"/>
    `,
    hat: `
      <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9b59b6"/><stop offset="100%" stop-color="#3498db"/></linearGradient></defs>
      <polygon points="34,22 50,0 66,22" fill="url(#hg)" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
      <circle cx="44" cy="15" r="1.8" fill="#ffd700"/><circle cx="55" cy="11" r="1.8" fill="#ff69b4"/>
      <circle cx="50" cy="19" r="1.8" fill="#00ffff"/><circle cx="50" cy="0" r="4.5" fill="#ffd700"/>
    `,
    hairpin: `
      <path d="M 22,35 L 27,42 L 34,42 L 29,48 L 31,55 L 26,51 L 21,55 L 23,48 L 18,42 L 25,42 Z" fill="#ffd700" stroke="#ff9500" stroke-width="1"/>
    `
  };

  // 3D lighting gradient defs
  function gen3DDefs(uid, color, material) {
    const isGel = material === 'needoh';
    const isHard = material === 'wackpu';
    const hiOp = isGel ? 0.75 : isHard ? 0.92 : 0.58;
    const shOp = isHard ? 0.5 : 0.35;
    const hiR = isHard ? 36 : 46;

    return `
      <radialGradient id="hi-${uid}" cx="30" cy="22" r="${hiR}" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#fff" stop-opacity="${hiOp}"/>
        <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="sh-${uid}" cx="74" cy="82" r="56" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#000" stop-opacity="${shOp}"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="rim-${uid}" cx="50" cy="54" r="52" gradientUnits="userSpaceOnUse">
        <stop offset="62%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="${shOp * 0.75}"/>
      </radialGradient>
      <filter id="glow-${uid}" x="-35%" y="-35%" width="170%" height="170%">
        <feDropShadow dx="0" dy="9" stdDeviation="9" flood-color="${color}" flood-opacity="0.65"/>
      </filter>
    `;
  }

  function render3DBody(bodyShape, fillColor, uid) {
    return `
      <g fill="${fillColor}" filter="url(#glow-${uid})">${bodyShape}</g>
      <g fill="url(#rim-${uid})">${bodyShape}</g>
      <g fill="url(#sh-${uid})">${bodyShape}</g>
      <g fill="url(#hi-${uid})">${bodyShape}</g>
    `;
  }

  function createSVG(squishy, options = {}) {
    const expr    = options.expression || squishy.face || 'smile';
    const sx      = options.stretchX || 1.0;
    const sy      = options.stretchY || 1.0;
    const width   = options.width  || 120;
    const height  = options.height || 120;
    const mat     = squishy.material || 'normal';
    const color   = squishy.color  || '#ff85a1';
    const color2  = squishy.color2 || color;
    const shape   = squishy.shape  || 'circle';
    const uid     = `m-${squishy.id || 'x'}-${Math.floor(Date.now() / 100)}`;
    const rarCls  = `mallang-rarity-${(squishy.rarity || 'Common').toLowerCase()}`;

    // Special shapes
    if (shape === 'needoh_cube')  return renderNeeDoh(squishy, options, uid, rarCls);
    if (shape === 'butter_block') return renderButter(squishy, options, uid, rarCls);

    const bodyShape = SHAPES[shape] || SHAPES.circle;
    const facePath  = EXPRESSIONS[expr] || EXPRESSIONS.smile;
    const accPath   = ACCESSORIES[squishy.accessory] || ACCESSORIES.none;

    // Base fill: gradient or solid
    let bodyFill = color;
    let extraDef = '';
    if (squishy.gradient && color2 && color2 !== color) {
      const gid = `bg-${uid}`;
      extraDef = `<linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>`;
      bodyFill = `url(#${gid})`;
    }

    // Wax shell
    let waxHTML = '';
    const cStage = options.crackStage !== undefined ? options.crackStage : (squishy.crackStage || 0);
    if (mat === 'wackpu' && cStage < 3) {
      let cracks = '';
      if (cStage === 1) {
        cracks = `
          <path d="M 35,45 L 47,56 L 41,72" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" fill="none"/>
          <path d="M 66,40 L 57,54 L 63,68" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" fill="none"/>`;
      } else if (cStage === 2) {
        cracks = `
          <path d="M 35,45 L 47,56 L 41,72" stroke="#475569" stroke-width="4" stroke-linecap="round" fill="none"/>
          <path d="M 66,40 L 57,54 L 63,68" stroke="#475569" stroke-width="4" stroke-linecap="round" fill="none"/>
          <path d="M 47,56 L 57,54" stroke="#475569" stroke-width="3.5" stroke-linecap="round" fill="none"/>
          <path d="M 18,64 L 35,45" stroke="#475569" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M 82,62 L 66,40" stroke="#475569" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M 50,20 L 44,35" stroke="#475569" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
      }
      waxHTML = `
        <g fill="#fff" opacity="0.9" stroke="#cdd5df" stroke-width="1.5">${bodyShape}</g>
        <g fill="url(#hi-${uid})" opacity="0.55">${bodyShape}</g>
        <g class="wax-cracks">${cracks}</g>`;
    }

    return `
      <svg viewBox="0 0 100 100" width="${width}" height="${height}"
           class="mallang-svg ${rarCls}"
           style="transform:scale(${sx},${sy});transform-origin:50% 70%;overflow:visible;"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          ${extraDef}
          ${gen3DDefs(uid, color, mat)}
        </defs>
        ${render3DBody(bodyShape, bodyFill, uid)}
        <g class="mallang-face">${facePath}</g>
        <g class="mallang-accessory">${accPath}</g>
        ${waxHTML}
      </svg>`;
  }

  function renderNeeDoh(squishy, options, uid, rarCls) {
    const sx = options.stretchX || 1.0;
    const sy = options.stretchY || 1.0;
    const w  = options.width  || 120;
    const h  = options.height || 120;
    const c1 = squishy.color  || '#a855f7';
    const c2 = squishy.color2 || '#e9d5ff';
    return `
      <svg viewBox="0 0 100 100" width="${w}" height="${h}"
           class="mallang-svg ${rarCls}"
           style="transform:scale(${sx},${sy});transform-origin:50% 70%;overflow:visible;"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="nb-${uid}" cx="34" cy="29" r="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>
            <stop offset="40%" stop-color="${c2}" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="${c1}" stop-opacity="0.95"/>
          </radialGradient>
          <radialGradient id="ni-${uid}" cx="64" cy="70" r="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="${c1}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${c2}" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="nh-${uid}" cx="29" cy="21" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.85"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
          </radialGradient>
          <filter id="ng-${uid}">
            <feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="${c1}" flood-opacity="0.7"/>
          </filter>
        </defs>
        <ellipse cx="52" cy="95" rx="36" ry="5" fill="${c1}" opacity="0.2"/>
        <rect x="11" y="11" width="78" height="78" rx="23" fill="${c1}" opacity="0.12" filter="url(#ng-${uid})"/>
        <rect x="11" y="11" width="78" height="78" rx="23" fill="url(#nb-${uid})" stroke="${c1}" stroke-width="1" stroke-opacity="0.3"/>
        <rect x="17" y="17" width="66" height="66" rx="18" fill="url(#ni-${uid})"/>
        <path d="M 19,32 Q 36,21 47,36" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.42"/>
        <path d="M 57,17 Q 70,28 65,45" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.22"/>
        <rect x="21" y="58" width="58" height="25" rx="7" fill="none" stroke="${c1}" stroke-width="1.3" stroke-opacity="0.55"/>
        <text x="50" y="67" text-anchor="middle" dominant-baseline="middle"
              font-family="'Arial Black',Impact,sans-serif" font-size="8" font-weight="900"
              letter-spacing="2" fill="${c1}" opacity="0.6">NEE</text>
        <text x="50" y="77" text-anchor="middle" dominant-baseline="middle"
              font-family="'Arial Black',Impact,sans-serif" font-size="8" font-weight="900"
              letter-spacing="2" fill="${c1}" opacity="0.6">DOH!</text>
        <ellipse cx="30" cy="25" rx="15" ry="8.5" fill="#fff" opacity="0.52" transform="rotate(-30 30 25)"/>
        <ellipse cx="73" cy="20" rx="7" ry="4" fill="#fff" opacity="0.32" transform="rotate(-20 73 20)"/>
        <rect x="11" y="74" width="78" height="15" rx="0 0 23 23" fill="${c1}" opacity="0.22"/>
      </svg>`;
  }

  function renderButter(squishy, options, uid, rarCls) {
    const sx = options.stretchX || 1.0;
    const sy = options.stretchY || 1.0;
    const w  = options.width  || 120;
    const h  = options.height || 120;
    return `
      <svg viewBox="0 0 100 100" width="${w}" height="${h}"
           class="mallang-svg ${rarCls}"
           style="transform:scale(${sx},${sy});transform-origin:50% 70%;overflow:visible;"
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bf-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fde84e"/><stop offset="100%" stop-color="#b87c00"/>
          </linearGradient>
          <linearGradient id="bt-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fff9a0"/><stop offset="100%" stop-color="#f0c800"/>
          </linearGradient>
          <linearGradient id="bs-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#9e6600"/><stop offset="100%" stop-color="#d4930a"/>
          </linearGradient>
          <filter id="bsh-${uid}">
            <feDropShadow dx="2" dy="9" stdDeviation="8" flood-color="#5c3a00" flood-opacity="0.5"/>
          </filter>
        </defs>
        <ellipse cx="52" cy="93" rx="38" ry="6" fill="#5c3a00" opacity="0.18"/>
        <polygon points="72,25 91,17 91,80 72,88" fill="url(#bs-${uid})"/>
        <rect x="9" y="25" width="63" height="63" rx="3" fill="url(#bf-${uid})" filter="url(#bsh-${uid})"/>
        <polygon points="9,25 72,25 91,17 28,17" fill="url(#bt-${uid})"/>
        <rect x="11" y="35" width="59" height="40" rx="2" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)" stroke-width="0.8"/>
        <text x="40" y="49" text-anchor="middle" dominant-baseline="middle"
              font-family="Arial,sans-serif" font-size="5.5" font-weight="700"
              fill="#0f2a7a" letter-spacing="1.8">SALTED</text>
        <text x="40" y="62" text-anchor="middle" dominant-baseline="middle"
              font-family="'Arial Black',Impact,sans-serif" font-size="12" font-weight="900"
              fill="#0f35b0" letter-spacing="0.3">BUTTER</text>
        <text x="22" y="74" text-anchor="middle" dominant-baseline="middle"
              font-family="Arial,sans-serif" font-size="6.5" font-weight="700" fill="#0f2a7a">4oz.</text>
        <polygon points="28,18 70,18 76,20 34,20" fill="#fff" opacity="0.42"/>
        <rect x="10" y="26" width="62" height="6" rx="2" fill="#fff" opacity="0.2"/>
        <polygon points="73,24 89,17 89,22 73,29" fill="#fff" opacity="0.14"/>
      </svg>`;
  }

  return { createSVG };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MallangRenderer;
} else {
  window.MallangRenderer = MallangRenderer;
}
