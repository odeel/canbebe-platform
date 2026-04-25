/**
 * stickers.js — Floating Can Bébé character stickers
 * Fixed to window corners — never overlaps content or UI.
 * Stickers near the hero section on the landing page are hidden.
 */
(function () {

  const STICKERS = [
    { src: 'beely.svg',  w: 66,  h: 83  },
    { src: 'coxino.svg', w: 83,  h: 121 },
    { src: 'pinou.svg',  w: 122, h: 158 },
    { src: 'gloof.svg',  w: 104, h: 181 },
  ];

  const CORNERS = [
    { id: 'bl', bottom: 24, left:  12 },
    { id: 'br', bottom: 24, right: 12 },
    { id: 'tl', top:    80, left:  12 },
    { id: 'tr', top:    80, right: 12 },
  ];

  const CSS = `
    @keyframes stk-float-a {
      0%,100% { transform: translateY(0px)   rotate(var(--r)); }
      50%      { transform: translateY(-12px) rotate(var(--r)); }
    }
    @keyframes stk-float-b {
      0%,100% { transform: translateY(0px)   rotate(var(--r)); }
      40%      { transform: translateY(-8px)  rotate(calc(var(--r) + 2deg)); }
      80%      { transform: translateY(-14px) rotate(calc(var(--r) - 2deg)); }
    }
    @keyframes stk-float-c {
      0%,100% { transform: translateY(0px)   rotate(var(--r)); }
      50%      { transform: translateY(-10px) rotate(var(--r)); }
    }
    .canbebe-sticker {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transition: opacity 0.9s ease;
      will-change: transform;
    }
    .canbebe-sticker.visible { opacity: 1; }
    .canbebe-sticker.hidden-by-hero { opacity: 0 !important; transition: none; }
  `;

  const ANIMS = ['stk-float-a', 'stk-float-b', 'stk-float-c'];

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr)      { return arr[Math.floor(Math.random() * arr.length)]; }

  // Returns true if the sticker's fixed position overlaps the hero element
  function overlapsHero(corner, w, h) {
    const hero = document.querySelector('.hero, #home, [class*="hero"]');
    if (!hero) return false;
    const hRect = hero.getBoundingClientRect();

    // Compute sticker rect from corner offsets
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let sx, sy;
    if (corner.left   !== undefined) sx = corner.left;
    if (corner.right  !== undefined) sx = vw - corner.right - w;
    if (corner.top    !== undefined) sy = corner.top;
    if (corner.bottom !== undefined) sy = vh - corner.bottom - h;

    // Check overlap
    return !(sx + w < hRect.left || sx > hRect.right ||
             sy + h < hRect.top  || sy > hRect.bottom);
  }

  function init() {
    if (window.innerWidth < 1100) return;

    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const shuffledStickers = [...STICKERS].sort(() => Math.random() - 0.5);
    const shuffledCorners  = [...CORNERS].sort(() => Math.random() - 0.5);

    shuffledCorners.forEach((corner, i) => {
      const sticker = shuffledStickers[i % shuffledStickers.length];

      const maxW  = 70;
      const scale = Math.min(maxW / sticker.w, 1);
      const w     = Math.round(sticker.w * scale);
      const h     = Math.round(sticker.h * scale);

      const leanOut = corner.id.includes('l') ? -1 : 1;
      const rot     = leanOut * rand(8, 22);
      const dur     = rand(3.5, 5.5);
      const delay   = rand(0, 1.2) + i * 0.3;
      const anim    = pick(ANIMS);

      const el = document.createElement('img');
      el.className = 'canbebe-sticker';
      el.src = sticker.src;
      el.alt = '';
      el.width  = w;
      el.height = h;

      const pos = [];
      if (corner.top    !== undefined) pos.push(`top:${corner.top}px`);
      if (corner.bottom !== undefined) pos.push(`bottom:${corner.bottom}px`);
      if (corner.left   !== undefined) pos.push(`left:${corner.left}px`);
      if (corner.right  !== undefined) pos.push(`right:${corner.right}px`);

      el.style.cssText = [
        ...pos,
        `--r:${rot}deg`,
        `transform:translateY(0px) rotate(${rot}deg)`,
        `animation:${anim} ${dur}s ease-in-out ${delay}s infinite`,
      ].join(';');

      document.body.appendChild(el);

      // Hide stickers that overlap the hero section
      if (overlapsHero(corner, w, h)) {
        el.classList.add('hidden-by-hero');
        // Re-check on scroll — show when hero scrolled out of view
        window.addEventListener('scroll', function () {
          if (overlapsHero(corner, w, h)) {
            el.classList.add('hidden-by-hero');
            el.classList.remove('visible');
          } else {
            el.classList.remove('hidden-by-hero');
            el.classList.add('visible');
          }
        }, { passive: true });
      } else {
        setTimeout(() => el.classList.add('visible'), 700 + i * 250);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();