// ─── AUDIO SETUP ─────────────────────────────────────────────────

const typeSound = new Audio('SFX/Type.wav');
typeSound.volume = 0.2;

const dialSound = new Audio('SFX/Type.wav');
dialSound.volume = 0.3;

const wrongSound = new Audio('SFX/Wrong.mp3');
wrongSound.volume = 0.5;

const openSound = new Audio('SFX/Open.mp3');
openSound.volume = 0.5;

const pageTurnSound = new Audio('SFX/PageTurn.mp3');
pageTurnSound.volume = 1;

const bookCloseSound = new Audio('SFX/BookClose.mp3');
bookCloseSound.volume = 1;

const swordSound = new Audio('SFX/sword.mp3');
swordSound.volume = 1;

const quackSound = new Audio('SFX/quack.mp3');
quackSound.volume = 0.8;

const bmoSound = new Audio('SFX/bmo.mp3');
bmoSound.volume = 0.8;

const introVoices = [1,2,3,4,5,6,7].map(n => {
  const a = new Audio(`SFX/intro/bmo${n}.mp3`);
  a.volume = 1.0;
  return a;
});

const bgm = new Audio('SFX/BGM.mp3');
bgm.loop   = true;
bgm.volume = 0.4;

let soundOn = true;

const soundToggle = document.getElementById('soundToggle');

const bookToggle = document.getElementById('bookToggle');
let bookVisible = true;

bookToggle.addEventListener('click', () => {
  const bookWrapper = document.querySelector('.book-wrapper');
  if (document.getElementById('pageFlipContainer').classList.contains('active')) {
    closePageFlip();
    return;
  }
  bookVisible = !bookVisible;
  bookWrapper.style.opacity = bookVisible ? '1' : '0';
  if (bookVisible) {
    bookWrapper.style.pointerEvents = 'auto';
  } else {
    setTimeout(() => { bookWrapper.style.pointerEvents = 'none'; }, 600);
  }
  bookToggle.textContent = bookVisible ? '👁️' : '🏔️';
  bookToggle.title = bookVisible ? 'Hide Book' : 'Show Book';
});

soundToggle.addEventListener('click', () => {
  soundOn                 = !soundOn;
  bgm.muted               = !soundOn;
  soundToggle.textContent = soundOn ? '🔊' : '🔇';
  soundToggle.title       = soundOn ? 'Mute' : 'Unmute';
});

function playTypeSound() {
  if (!soundOn) return;
  typeSound.currentTime = 0;
  typeSound.play().catch(() => {});
}

function playDialSound() {
  if (!soundOn) return;
  dialSound.currentTime = 0;
  dialSound.play().catch(() => {});
}

function playPageTurnSound() {
  if (!soundOn) return;
  pageTurnSound.currentTime = 0;
  pageTurnSound.play().catch(() => {});
}

function playBookCloseSound() {
  if (!soundOn) return;
  bookCloseSound.currentTime = 0;
  bookCloseSound.play().catch(() => {});
}

// ─── PAGE LOADER ─────────────────────────────────────────────────

const TOTAL_PAGES = 10;
let pagesLoaded = false;

async function loadPages() {
  if (pagesLoaded) return;
  const pageFlipEl = document.getElementById('pageFlip');
  const fetches = [];

  for (let i = 1; i <= TOTAL_PAGES; i++) {
    fetches.push(
      fetch(`pages/page${i}.html`)
        .then(r => r.text())
        .then(html => ({ index: i, html }))
    );
  }

  const results = await Promise.all(fetches);
  results.sort((a, b) => a.index - b.index);

  pageFlipEl.innerHTML = '';
  results.forEach(({ html }) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'page';
    wrapper.innerHTML = html;
    pageFlipEl.appendChild(wrapper);
  });

  pagesLoaded = true;
}

// ─── PAGE FLIP SETUP ─────────────────────────────────────────────

let pageFlipInitialized = false;
let bookUnlocked = false;
let currentPageIndex = 0;

function isSinglePageMode() {
  return window.innerWidth <= 1024;
}

function initializePageFlip() {
  currentPageIndex = 0;
  updatePageDisplay();
  pageFlipInitialized = true;
}

function updatePageLabel() {
  const label = document.getElementById('pageLabel');
  if (!label) return;
  const singlePageMode = isSinglePageMode();
  if (singlePageMode) {
    label.textContent = `Page ${currentPageIndex + 1}`;
  } else {
    const totalPages = document.querySelectorAll('.page').length;
    const right = currentPageIndex + 2 <= totalPages ? ` — Page ${currentPageIndex + 2}` : '';
    label.textContent = `Page ${currentPageIndex + 1}${right}`;
  }
}

function updatePageDisplay() {
  const pages = document.querySelectorAll('.page');
  pages.forEach((page) => { page.style.display = 'none'; });
  
  const singlePageMode = isSinglePageMode();
  const pagesPerSpread = singlePageMode ? 1 : 2;
  
  const pageCount = pages.length;
  for (let i = 0; i < pagesPerSpread; i++) {
    if (currentPageIndex + i < pageCount) {
      pages[currentPageIndex + i].style.display = 'flex';
    }
  }
  
  const pageNumbers = [];
  for (let i = 0; i < pagesPerSpread; i++) {
    if (currentPageIndex + i < pageCount) {
      pageNumbers.push(currentPageIndex + i + 1);
    }
  }
  console.log(`Displaying page${pageNumbers.length > 1 ? 's' : ''} ${pageNumbers.join('-')}`);
  updatePageLabel();
}

async function showPageFlip() {
  const container = document.getElementById('pageFlipContainer');
  const bookWrapper = document.querySelector('.book-wrapper');

  await loadPages();

  if (!pageFlipInitialized) {
    initializePageFlip();
  }
  
  bookWrapper.style.display = 'none';
  bookWrapper.style.visibility = 'hidden';
  bookWrapper.style.pointerEvents = 'none';
  bookWrapper.style.zIndex = '-1';

  const cc = document.getElementById('charCanvas');
  if (cc) cc.style.pointerEvents = 'none';

  bookToggle.textContent = '✕';
  bookToggle.title = 'Close Book';

  const replayBtn = document.getElementById('replayBtn');
  if (replayBtn) replayBtn.style.display = 'none';

  container.classList.add('active');
}

function closePageFlip() {
  const container = document.getElementById('pageFlipContainer');
  const bookWrapper = document.querySelector('.book-wrapper');
  
  playBookCloseSound();
  
  container.classList.remove('active');
  
  bookWrapper.style.display = 'block';
  bookWrapper.style.visibility = 'visible';
  bookWrapper.style.pointerEvents = 'auto';
  bookWrapper.style.zIndex = '10';

  const cc = document.getElementById('charCanvas');
  if (cc) cc.style.pointerEvents = 'all';

  bookToggle.textContent = bookVisible ? '👁️' : '🏔️';
  bookToggle.title = bookVisible ? 'Hide Book' : 'Show Book';

  const rb = document.getElementById('replayBtn');
  if (rb) rb.style.display = 'flex';
}

const closeBookBtn = document.getElementById('closeBookBtn');
if (closeBookBtn) {
  closeBookBtn.addEventListener('click', closePageFlip);
}

const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageFlipElement = document.getElementById('pageFlip');

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentPageIndex === 0) {
      closePageFlip();
    } else if (currentPageIndex > 0) {
      const pageIncrement = isSinglePageMode() ? 1 : 2;
      currentPageIndex -= pageIncrement;
      updatePageDisplay();
      playPageTurnSound();
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const totalPages = document.querySelectorAll('.page').length;
    const pageIncrement = isSinglePageMode() ? 1 : 2;
    if (currentPageIndex + pageIncrement < totalPages) {
      currentPageIndex += pageIncrement;
      updatePageDisplay();
      playPageTurnSound();
    }
  });
}

window.addEventListener('resize', () => {
  if (pageFlipInitialized) {
    updatePageDisplay();
  }
});

// ─── DIALOGUE INTRO ───────────────────────────────────────────────

const LINES = [
  "Hey Audrey, It's BMO! Josh made you a really cool thing to celebrate the time you have spent together.",
  "You'll be able to see ALL of your good times, bad times, loving times and even the embarrassing times together",
  "Josh knows you really like things that are personalised and takes time and effort to make, so he made this for you!",
  "Just so you know, everything was completely handmade! Not the music though, BMO saw him downloading it from the internet...",
  "Anyway, he thought a website would be a great idea, because you can carry a little part of your relationship wherever you are in the world",
  "It even works on your phone too! So make sure to bookmark the page, so you can come back to it, whenever Josh updates the website!",
  "Josh and BMO love you Audrey! Click 'open' to see what Josh has been working on..."
];

const introScreen  = document.getElementById('introScreen');
const mainContent  = document.getElementById('mainContent');
const dialogueText = document.getElementById('dialogueText');
const nextBtn      = document.getElementById('nextBtn');
const skipBtn      = document.getElementById('skipBtn');

let currentLine = 0;
let isTyping    = false;
let typeTimeout = null;
let fullText    = '';
let charIndex   = 0;

const TYPING_SPEED = 20;

function typeCharacter() {
  if (charIndex < fullText.length) {
    dialogueText.textContent = fullText.slice(0, charIndex + 1);
    if (charIndex % 3 === 0) playTypeSound();
    charIndex++;
    typeTimeout = setTimeout(typeCharacter, TYPING_SPEED);
  } else {
    isTyping = false;
    dialogueText.classList.add('done');
    if (currentLine === LINES.length - 1) {
      nextBtn.textContent = 'OPEN ▶';
    }
  }
}

function showLine(index) {
  clearTimeout(typeTimeout);
  // Stop any currently playing intro voice
  introVoices.forEach(v => { v.pause(); v.currentTime = 0; });
  // Play the voice line for this index
  if (soundOn && introVoices[index]) {
    introVoices[index].play().catch(() => {});
  }
  dialogueText.classList.remove('done');
  fullText  = LINES[index];
  charIndex = 0;
  isTyping  = true;
  dialogueText.textContent = '';
  typeCharacter();
}

function revealMain() {
  introVoices.forEach(v => { v.pause(); v.currentTime = 0; });
  introScreen.classList.remove('visible');
  setTimeout(() => {
    introScreen.style.display = 'none';
    document.getElementById('bookToggle').style.display = 'flex';

    // Apply bg image immediately
    document.body.style.backgroundImage = 'url("images/bgimg.png")';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';

    // Create a dark overlay that fades out, revealing the bg beneath
    const fadeOverlay = document.createElement('div');
    fadeOverlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9000;
      background: #44463f; pointer-events: none;
      transition: opacity 1.5s ease;
    `;
    document.body.appendChild(fadeOverlay);
    // Trigger fade on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fadeOverlay.style.opacity = '0';
        setTimeout(() => fadeOverlay.remove(), 1600);
      });
    });

    mainContent.classList.add('visible');
    bgm.play().catch(() => {});
    initGrass();
    initCharacters();
    initBookCover();
    requestAnimationFrame(mainLoop);
  }, 500);
}

nextBtn.addEventListener('click', () => {
  if (isTyping) {
    clearTimeout(typeTimeout);
    isTyping = false;
    dialogueText.textContent = fullText;
    dialogueText.classList.add('done');
    if (currentLine === LINES.length - 1) nextBtn.textContent = 'OPEN ▶';
    return;
  }
  currentLine++;
  if (currentLine < LINES.length) {
    showLine(currentLine);
  } else {
    revealMain();
  }
});

skipBtn.addEventListener('click', () => {
  clearTimeout(typeTimeout);
  introVoices.forEach(v => { v.pause(); v.currentTime = 0; });
  revealMain();
});

// ─── BMO SPLASH ──────────────────────────────────────────────────

const bmoSplash    = document.getElementById('bmoSplash');
const bmoSplashImg = document.getElementById('bmoSplashImg');

bmoSplashImg.addEventListener('click', () => {
  // Play open sound on click
  if (soundOn) {
    openSound.currentTime = 0;
    openSound.play().catch(() => {});
  }
  // Instantly hide splash and show intro — no fade gap means no flash
  bmoSplash.classList.add('hidden');
  introScreen.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      introScreen.classList.add('visible');
      // Slide BMO in shortly after screen appears
      setTimeout(() => {
        const avatar = document.getElementById('introAvatar');
        if (avatar) avatar.classList.add('slide-in');
      }, 150);
    });
  });
  showLine(0);
});


// ─── PADLOCK / DIAL LOGIC ─────────────────────────────────────────

const CORRECT = [31, 5, 25];
const MAX     = [31, 12, 26];
const values  = [0, 0, 0];

const padlockBtn   = document.getElementById('padlockBtn');
const modalOverlay = document.getElementById('modalOverlay');
const openBtn      = document.getElementById('openBtn');
const closeBtn     = document.getElementById('closeBtn');
const errorMsg     = document.getElementById('errorMsg');
const dialDisplays = [
  document.getElementById('dial0'),
  document.getElementById('dial1'),
  document.getElementById('dial2'),
];

function updateDisplay(dialIndex) {
  dialDisplays[dialIndex].textContent = values[dialIndex];
}

function changeDial(dialIndex, direction) {
  values[dialIndex] = (values[dialIndex] + direction + MAX[dialIndex] + 1) % (MAX[dialIndex] + 1);
  updateDisplay(dialIndex);
  errorMsg.textContent = '';
  playDialSound();
}

padlockBtn.addEventListener('click', () => {
  modalOverlay.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
  errorMsg.textContent = '';
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
    errorMsg.textContent = '';
  }
});

document.querySelectorAll('.dial-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dialIndex = parseInt(btn.dataset.dial);
    const direction = btn.dataset.dir === 'up' ? 1 : -1;
    changeDial(dialIndex, direction);
  });
});

dialDisplays.forEach((display, index) => {
  display.addEventListener('wheel', (e) => {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    changeDial(index, direction);
  }, { passive: false });
});

// ─── BOOK COVER SPRITESHEET ANIMATION ────────────────────────────

const BOOK_FRAME_COUNT = 20;
const BOOK_FRAME_W     = 481;
const BOOK_FRAME_H     = 560;
const BOOK_FPS         = 18;

let bookCoverCanvas = null;
let bookCoverCtx    = null;
let bookSheet       = null;
let bookSheetLoaded = false;
let bookAnimFrame   = 0;
let bookAnimating   = false;
let bookAnimLastTime = 0;

function initBookCover() {
  const img = document.querySelector('.book-cover');
  bookCoverCanvas = document.createElement('canvas');
  bookCoverCanvas.width  = BOOK_FRAME_W;
  bookCoverCanvas.height = BOOK_FRAME_H;
  bookCoverCanvas.className = 'book-cover';
  bookCoverCanvas.style.imageRendering = 'pixelated';
  img.replaceWith(bookCoverCanvas);
  bookCoverCtx = bookCoverCanvas.getContext('2d');

  bookSheet = new Image();
  bookSheet.onload = () => {
    bookSheetLoaded = true;
    drawBookFrame(0);
  };
  bookSheet.src = 'images/book/book_spritesheet.png';
}

function drawBookFrame(frameIndex) {
  if (!bookSheetLoaded) return;
  bookCoverCtx.clearRect(0, 0, BOOK_FRAME_W, BOOK_FRAME_H);
  bookCoverCtx.drawImage(
    bookSheet,
    frameIndex * BOOK_FRAME_W, 0,
    BOOK_FRAME_W, BOOK_FRAME_H,
    0, 0,
    BOOK_FRAME_W, BOOK_FRAME_H
  );
}

function animateBookOpen(timestamp) {
  if (!bookAnimating) return;

  if (!bookAnimLastTime) bookAnimLastTime = timestamp;
  const elapsed = timestamp - bookAnimLastTime;
  const frameDuration = 1000 / BOOK_FPS;

  if (elapsed >= frameDuration) {
    bookAnimLastTime = timestamp;
    bookAnimFrame++;
    drawBookFrame(bookAnimFrame);

    if (bookAnimFrame >= BOOK_FRAME_COUNT - 1) {
      bookAnimating = false;
      bookUnlocked = true;
      document.querySelector('.book-wrapper').style.cursor = 'pointer';
      const replayBtn = document.getElementById('replayBtn');
      if (replayBtn) replayBtn.style.display = 'flex';
      return;
    }
  }

  requestAnimationFrame(animateBookOpen);
}

function startBookOpenAnimation() {
  if (bookAnimating) return;
  bookAnimating    = true;
  bookAnimFrame    = 0;
  bookAnimLastTime = 0;
  if (soundOn) {
    swordSound.currentTime = 0;
    swordSound.play().catch(() => {});
  }
  requestAnimationFrame(animateBookOpen);
}

const replayBtn = document.getElementById('replayBtn');
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    if (bookAnimating) return;
    const bookWrapper = document.querySelector('.book-wrapper');
    bookWrapper.style.opacity = '1';
    bookWrapper.style.pointerEvents = 'auto';
    bookVisible = true;
    bookToggle.textContent = '👁️';
    bookToggle.title = 'Hide Book';
    startBookOpenAnimation();
  });
}

openBtn.addEventListener('click', () => {
  const isCorrect = values.every((val, i) => val === CORRECT[i]);
  if (isCorrect) {
    modalOverlay.classList.remove('active');
    if (soundOn) {
      openSound.currentTime = 0;
      openSound.play().catch(() => {});
    }
    startBookOpenAnimation();
  } else {
    errorMsg.textContent = 'WRONG CODE. TRY AGAIN.';
    if (soundOn) {
      wrongSound.currentTime = 0;
      wrongSound.play().catch(() => {});
    }
    const modal = document.querySelector('.modal');
    modal.style.animation = 'shake 0.3s ease';
    modal.addEventListener('animationend', () => {
      modal.style.animation = '';
    }, { once: true });
  }
});

document.querySelector('.book-wrapper').addEventListener('click', (e) => {
  if (e.target.id === 'padlockBtn' || e.target.closest('#padlockBtn')) {
    return;
  }
  if (bookUnlocked) {
    showPageFlip();
  }
});


// ─── PIXEL GRASS ─────────────────────────────────────────────────

const canvas = document.getElementById('grassCanvas');
const ctx    = canvas.getContext('2d');
const PX     = 4;

const COLOURS = {
  dark:     '#3a6b22',
  mid:      '#4e8a30',
  light:    '#6aaa44',
  tip:      '#88cc55',
  soil:     '#5a3a1a',
  soilDark: '#3e2810',
};

let W, H;
let blades   = [];
let windTime = 0;

function initGrass() {
  canvas.width  = window.innerWidth;
  canvas.height = 120;
  W = canvas.width;
  H = canvas.height;
  blades = [];
  const spacing = PX * 2;
  for (let x = 0; x < W; x += spacing) {
    blades.push({
      x,
      h:     3 + Math.floor(Math.random() * 5),
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    });
  }
}

function drawGrass(timestamp) {
  ctx.clearRect(0, 0, W, H);
  windTime = timestamp * 0.001;
  const soilTop = H - PX * 4;

  ctx.fillStyle = COLOURS.soil;
  ctx.fillRect(0, soilTop, W, PX * 2);
  ctx.fillStyle = COLOURS.soilDark;
  ctx.fillRect(0, soilTop + PX * 2, W, PX * 2);

  for (const blade of blades) {
    const wind = Math.sin(windTime * blade.speed + blade.phase) * 1.2
               + Math.sin(windTime * 0.7 + blade.phase * 1.3) * 0.5;
    for (let seg = 0; seg < blade.h; seg++) {
      const t     = seg / blade.h;
      const lean  = Math.round(wind * t * t * 2);
      const drawX = blade.x + lean * PX;
      const drawY = soilTop - seg * PX;
      if (t < 0.3)       ctx.fillStyle = COLOURS.dark;
      else if (t < 0.65) ctx.fillStyle = COLOURS.mid;
      else if (t < 0.85) ctx.fillStyle = COLOURS.light;
      else               ctx.fillStyle = COLOURS.tip;
      ctx.fillRect(drawX, drawY, PX, PX);
    }
  }
}

window.addEventListener('resize', () => {
  initGrass();
  repositionCharacters();
});

// ─── CHARACTERS ───────────────────────────────────────────────────

const AUDREY_SHEET_SRC   = 'images/characters/audrey_spritesheet.png';
const AUDREY_FRAME_COUNT = 6;
const AUDREY_FRAME_W     = 41;
const AUDREY_FRAME_H     = 100;

const JOSH_SHEET_SRC   = 'images/characters/josh_spritesheet.png';
const JOSH_FRAME_COUNT = 6;
const JOSH_FRAME_W     = 41;
const JOSH_FRAME_H     = 100;

// ─── DUCK CONSTANTS ───────────────────────────────────────────────
const DUCK_SHEET_SRC   = 'images/characters/duck_spritesheet.png';
const DUCK_FRAME_COUNT = 13;
const DUCK_FRAME_W     = 32;
const DUCK_FRAME_H     = 32;

const DUCK_SIZE_RATIOS = [0.75, 0.62, 0.50];
const DUCK_TRAIL_GAPS  = [15, 55, 95];

// ─── BMO CONSTANTS ────────────────────────────────────────────────
const BMO_SHEET_SRC   = 'images/characters/bmo_spritesheet.png';
const BMO_FRAME_COUNT = 5;
const BMO_FRAME_W     = 41;
const BMO_FRAME_H     = 100;
const BMO_SIZE_RATIO  = 0.75;
const BMO_WIDTH_RATIO = 1.1;
const BMO_TRAIL_GAP   = 20;

let charCanvas, charCtx;
let audreySheet = null;
let joshSheet   = null;
let duckSheet   = null;
let bmoSheet    = null;

const ducks = DUCK_SIZE_RATIOS.map((ratio, i) => ({
  ratio,
  gap:        DUCK_TRAIL_GAPS[i],
  x:          0,
  frame:      0,
  frameTimer: 0,
  frameRate:  120 + i * 15,
}));

const bmo = {
  ratio:      BMO_SIZE_RATIO,
  gap:        BMO_TRAIL_GAP,
  x:          0,
  frame:      0,
  frameTimer: 0,
  frameRate:  130,
};

let audrey = {
  x:          80,
  facingLeft: false,
  frame:      0,
  frameTimer: 0,
  frameRate:  100,
  speed:      1.2,
};

let josh = {
  x:          0,
  facingLeft: true,
  frame:      0,
  frameTimer: 0,
  frameRate:  110,
  speed:      1.0,
};

function getCharScale() {
  return window.innerWidth < 480 ? 0.7 : 1.0;
}

function initCharacters() {
  charCanvas = document.getElementById('charCanvas');
  charCtx    = charCanvas.getContext('2d');
  charCanvas.width  = window.innerWidth;
  charCanvas.height = window.innerHeight;

  audreySheet     = new Image();
  audreySheet.src = AUDREY_SHEET_SRC;

  joshSheet     = new Image();
  joshSheet.src = JOSH_SHEET_SRC;

  duckSheet     = new Image();
  duckSheet.src = DUCK_SHEET_SRC;

  bmoSheet     = new Image();
  bmoSheet.src = BMO_SHEET_SRC;

  audrey.x = window.innerWidth * 0.2;
  josh.x   = window.innerWidth * 0.7;

  const scale   = getCharScale();
  ducks.forEach((duck, i) => {
    const dh  = AUDREY_FRAME_H * scale * duck.ratio;
    const dw  = dh;
    duck.x = audrey.x - dw - duck.gap - i * 5;
  });

  const joshW = JOSH_FRAME_W * scale;
  bmo.x = josh.x + joshW + bmo.gap;

  charCanvas.addEventListener('click', handleCharClick);
  charCanvas.addEventListener('mousemove', updateCursor);
}

function repositionCharacters() {
  if (!charCanvas) return;
  charCanvas.width  = window.innerWidth;
  charCanvas.height = window.innerHeight;
  const scale = getCharScale();
  const charW = AUDREY_FRAME_W * scale;
  audrey.x = Math.max(charW, Math.min(audrey.x, window.innerWidth - charW * 2));
  josh.x   = Math.max(charW, Math.min(josh.x,   window.innerWidth - charW * 2));
}

function updateCharacters(timestamp) {
  if (!charCanvas) return;
  const scale = getCharScale();
  const charW = AUDREY_FRAME_W * scale;

  // Move Audrey
  audrey.x += audrey.facingLeft ? -audrey.speed : audrey.speed;
  if (!audrey.facingLeft && audrey.x + charW * 2 >= window.innerWidth - 8) {
    audrey.facingLeft = true;
  } else if (audrey.facingLeft && audrey.x <= 8) {
    audrey.facingLeft = false;
  }
  if (timestamp - audrey.frameTimer > audrey.frameRate) {
    audrey.frame      = (audrey.frame + 1) % AUDREY_FRAME_COUNT;
    audrey.frameTimer = timestamp;
  }

  // Move Josh
  josh.x += josh.facingLeft ? -josh.speed : josh.speed;
  if (!josh.facingLeft && josh.x + charW * 2 >= window.innerWidth - 8) {
    josh.facingLeft = true;
  } else if (josh.facingLeft && josh.x <= 8) {
    josh.facingLeft = false;
  }
  if (timestamp - josh.frameTimer > josh.frameRate) {
    josh.frame      = (josh.frame + 1) % JOSH_FRAME_COUNT;
    josh.frameTimer = timestamp;
  }

  // Move ducks
  ducks.forEach((duck, i) => {
    const dh = AUDREY_FRAME_H * scale * duck.ratio;
    const dw = dh;
    const targetX = audrey.facingLeft
      ? audrey.x + charW + duck.gap + i * 5
      : audrey.x - dw - duck.gap - i * 5;
    const diff = targetX - duck.x;
    const step = Math.min(Math.abs(diff), audrey.speed);
    duck.x += Math.sign(diff) * step;
    if (timestamp - duck.frameTimer > duck.frameRate) {
      duck.frame      = (duck.frame + 1) % DUCK_FRAME_COUNT;
      duck.frameTimer = timestamp;
    }
  });

  // Move BMO
  const joshW  = JOSH_FRAME_W * scale;
  const bmoDW  = BMO_FRAME_W * scale * bmo.ratio * BMO_WIDTH_RATIO;
  const targetBmoX = josh.facingLeft
    ? josh.x + joshW + bmo.gap
    : josh.x - bmoDW - bmo.gap;
  const bmoDiff = targetBmoX - bmo.x;
  const bmoStep = Math.min(Math.abs(bmoDiff), josh.speed);
  bmo.x += Math.sign(bmoDiff) * bmoStep;
  if (timestamp - bmo.frameTimer > bmo.frameRate) {
    bmo.frame      = (bmo.frame + 1) % BMO_FRAME_COUNT;
    bmo.frameTimer = timestamp;
  }
}

// ─── CHARACTER DIALOGUE ───────────────────────────────────────────

const AUDREY_LINES = ["naurrr"];
const JOSH_LINES   = ["tyshi"];

let charDialogueActive = false;
let activeLines        = [];
let charCurrentLine    = 0;
let charIsTyping       = false;
let charTypeTimeout    = null;
let charFullText       = '';
let charCharIndex      = 0;

const charOverlay     = document.createElement('div');
charOverlay.id        = 'charDialogueOverlay';
charOverlay.innerHTML = `
  <div id="charDialogueBox">
    <div id="charDialogueText"></div>
    <div id="charDialogueButtons">
      <button id="charNextBtn">NEXT ▶</button>
    </div>
  </div>
`;
document.body.appendChild(charOverlay);

const charDialogueText = document.getElementById('charDialogueText');
const charNextBtn      = document.getElementById('charNextBtn');

function charTypeCharacter() {
  if (charCharIndex < charFullText.length) {
    charDialogueText.textContent = charFullText.slice(0, charCharIndex + 1);
    if (charCharIndex % 3 === 0) playTypeSound();
    charCharIndex++;
    charTypeTimeout = setTimeout(charTypeCharacter, TYPING_SPEED);
  } else {
    charIsTyping = false;
    charDialogueText.classList.add('done');
    if (charCurrentLine === activeLines.length - 1) {
      charNextBtn.textContent = 'CLOSE ✕';
    }
  }
}

function charShowLine(index) {
  clearTimeout(charTypeTimeout);
  charDialogueText.classList.remove('done');
  charFullText  = activeLines[index];
  charCharIndex = 0;
  charIsTyping  = true;
  charDialogueText.textContent = '';
  charTypeCharacter();
}

function openCharDialogue(lines) {
  if (charDialogueActive) return;
  charDialogueActive      = true;
  activeLines             = lines;
  charCurrentLine         = 0;
  charNextBtn.textContent = 'NEXT ▶';
  charOverlay.classList.add('active');
  charShowLine(0);
}

function closeCharDialogue() {
  charDialogueActive = false;
  charOverlay.classList.remove('active');
  clearTimeout(charTypeTimeout);
}

charNextBtn.addEventListener('click', () => {
  if (charIsTyping) {
    clearTimeout(charTypeTimeout);
    charIsTyping = false;
    charDialogueText.textContent = charFullText;
    charDialogueText.classList.add('done');
    if (charCurrentLine === activeLines.length - 1) charNextBtn.textContent = 'CLOSE ✕';
    return;
  }
  charCurrentLine++;
  if (charCurrentLine < activeLines.length) {
    charShowLine(charCurrentLine);
  } else {
    closeCharDialogue();
  }
});

charOverlay.addEventListener('click', (e) => {
  if (e.target === charOverlay) closeCharDialogue();
});

// ─── CHARACTER CLICK DETECTION ───────────────────────────────────

function getCharHitInfo() {
  const scale   = getCharScale();
  const dw      = AUDREY_FRAME_W * scale;
  const dh      = AUDREY_FRAME_H * scale;
  const groundY = window.innerHeight - 120 + (120 - 16);
  const drawY   = groundY - dh;
  return { dw, dh, drawY };
}

function handleCharClick(e) {
  if (!charCanvas) return;
  const rect   = charCanvas.getBoundingClientRect();
  const scaleX = charCanvas.width  / rect.width;
  const scaleY = charCanvas.height / rect.height;
  const mx     = (e.clientX - rect.left) * scaleX;
  const my     = (e.clientY - rect.top)  * scaleY;
  const { dw, dh, drawY } = getCharHitInfo();
  const scale   = getCharScale();
  const groundY = window.innerHeight - 120 + (120 - 16);

  const hitAudrey = mx >= audrey.x - 10 && mx <= audrey.x + dw + 10
                 && my >= drawY    - 10 && my <= drawY    + dh + 10;
  const hitJosh   = mx >= josh.x   - 10 && mx <= josh.x   + dw + 10
                 && my >= drawY    - 10 && my <= drawY    + dh + 10;

  // Check duck hits
  let hitDuck = false;
  ducks.forEach((duck) => {
    const ddh    = AUDREY_FRAME_H * scale * duck.ratio;
    const ddw    = ddh;
    const ddrawY = groundY - ddh * 0.75;
    if (mx >= duck.x - 6 && mx <= duck.x + ddw + 6 &&
        my >= ddrawY  - 6 && my <= ddrawY  + ddh + 6) {
      hitDuck = true;
    }
  });

  // Check BMO hit
  const bDW    = BMO_FRAME_W * scale * bmo.ratio * BMO_WIDTH_RATIO;
  const bDH    = BMO_FRAME_H * scale * bmo.ratio;
  const bDrawY = groundY - bDH;
  const hitBmo = mx >= bmo.x - 6 && mx <= bmo.x + bDW + 6 &&
                 my >= bDrawY - 6 && my <= bDrawY + bDH + 6;

  if (hitBmo) {
    if (soundOn) {
      bmoSound.currentTime = 0;
      bmoSound.play().catch(() => {});
    }
  } else if (hitDuck) {
    if (soundOn) {
      quackSound.currentTime = 0;
      quackSound.play().catch(() => {});
    }
  } else if (hitAudrey) {
    openCharDialogue(AUDREY_LINES);
  } else if (hitJosh) {
    openCharDialogue(JOSH_LINES);
  }
}

function updateCursor(e) {
  if (!charCanvas) return;
  const rect   = charCanvas.getBoundingClientRect();
  const scaleX = charCanvas.width  / rect.width;
  const scaleY = charCanvas.height / rect.height;
  const mx     = (e.clientX - rect.left) * scaleX;
  const my     = (e.clientY - rect.top)  * scaleY;
  const { dw, dh, drawY } = getCharHitInfo();
  const scale   = getCharScale();
  const groundY = window.innerHeight - 120 + (120 - 16);

  let hitDuck = false;
  ducks.forEach((duck) => {
    const ddh    = AUDREY_FRAME_H * scale * duck.ratio;
    const ddw    = ddh;
    const ddrawY = groundY - ddh * 0.75;
    if (mx >= duck.x - 6 && mx <= duck.x + ddw + 6 &&
        my >= ddrawY  - 6 && my <= ddrawY  + ddh + 6) {
      hitDuck = true;
    }
  });

  const hitAny = hitDuck
    || (mx >= audrey.x - 10 && mx <= audrey.x + dw + 10 && my >= drawY - 10 && my <= drawY + dh + 10)
    || (mx >= josh.x   - 10 && mx <= josh.x   + dw + 10 && my >= drawY - 10 && my <= drawY + dh + 10)
    || (() => {
      const bDW    = BMO_FRAME_W * scale * bmo.ratio * BMO_WIDTH_RATIO;
      const bDH    = BMO_FRAME_H * scale * bmo.ratio;
      const bDrawY = groundY - bDH;
      return mx >= bmo.x - 6 && mx <= bmo.x + bDW + 6 && my >= bDrawY - 6 && my <= bDrawY + bDH + 6;
    })();
  charCanvas.style.cursor = hitAny ? 'pointer' : 'default';
}

// ─── NAMETAG DRAWING ─────────────────────────────────────────────

function drawNametag(cx, topY, label) {
  const fontSize = 7;
  const pad      = 4;
  charCtx.font   = `${fontSize}px "Press Start 2P", monospace`;
  const tw       = charCtx.measureText(label).width;
  const bw       = tw + pad * 2;
  const bh       = fontSize + pad * 2;
  const bx       = cx - bw / 2;
  const by       = topY - bh - 6;

  charCtx.fillStyle = '#1a25306b';
  charCtx.fillRect(Math.round(bx), Math.round(by), Math.ceil(bw), Math.ceil(bh));
  charCtx.strokeStyle = '#a8bfcf6e';
  charCtx.lineWidth   = 1.5;
  charCtx.strokeRect(Math.round(bx) + 0.5, Math.round(by) + 0.5, Math.ceil(bw) - 1, Math.ceil(bh) - 1);
  charCtx.fillStyle    = '#f0e8d0';
  charCtx.textBaseline = 'top';
  charCtx.fillText(label, Math.round(bx + pad), Math.round(by + pad));
}

function drawCharacters() {
  if (!charCanvas) return;
  charCtx.clearRect(0, 0, charCanvas.width, charCanvas.height);

  const scale   = getCharScale();
  const dw      = AUDREY_FRAME_W * scale;
  const dh      = AUDREY_FRAME_H * scale;
  const groundY = window.innerHeight - 120 + (120 - 16);
  const drawY   = groundY - dh;

  // ── Draw Audrey ──
  if (audreySheet && audreySheet.complete && audreySheet.naturalWidth > 0) {
    charCtx.save();
    if (audrey.facingLeft) {
      charCtx.translate(Math.round(audrey.x) + dw, 0);
      charCtx.scale(-1, 1);
      charCtx.drawImage(audreySheet, audrey.frame * AUDREY_FRAME_W, 0, AUDREY_FRAME_W, AUDREY_FRAME_H, 0, Math.round(drawY), dw, dh);
    } else {
      charCtx.drawImage(audreySheet, audrey.frame * AUDREY_FRAME_W, 0, AUDREY_FRAME_W, AUDREY_FRAME_H, Math.round(audrey.x), Math.round(drawY), dw, dh);
    }
    charCtx.restore();
    drawNametag(Math.round(audrey.x + dw / 2), Math.round(drawY), 'rxyn');
  }

  // ── Draw Josh ──
  if (joshSheet && joshSheet.complete && joshSheet.naturalWidth > 0) {
    const jdw    = JOSH_FRAME_W * scale;
    const jdh    = JOSH_FRAME_H * scale;
    const jDrawY = groundY - jdh;
    charCtx.save();
    if (josh.facingLeft) {
      charCtx.translate(Math.round(josh.x) + jdw, 0);
      charCtx.scale(-1, 1);
      charCtx.drawImage(joshSheet, josh.frame * JOSH_FRAME_W, 0, JOSH_FRAME_W, JOSH_FRAME_H, 0, Math.round(jDrawY), jdw, jdh);
    } else {
      charCtx.drawImage(joshSheet, josh.frame * JOSH_FRAME_W, 0, JOSH_FRAME_W, JOSH_FRAME_H, Math.round(josh.x), Math.round(jDrawY), jdw, jdh);
    }
    charCtx.restore();
    drawNametag(Math.round(josh.x + jdw / 2), Math.round(jDrawY), 'kimjongtoes');
  }

  // ── Draw ducks ──
  if (duckSheet && duckSheet.complete && duckSheet.naturalWidth > 0) {
    charCtx.imageSmoothingEnabled = false;
    ducks.forEach((duck) => {
      const dh     = AUDREY_FRAME_H * scale * duck.ratio;
      const dw     = dh;
      const dDrawY = groundY - dh * 0.75;
      charCtx.save();
      if (audrey.facingLeft) {
        charCtx.translate(Math.round(duck.x) + dw, 0);
        charCtx.scale(-1, 1);
        charCtx.drawImage(duckSheet, duck.frame * DUCK_FRAME_W, 0, DUCK_FRAME_W, DUCK_FRAME_H, 0, Math.round(dDrawY), dw, dh);
      } else {
        charCtx.drawImage(duckSheet, duck.frame * DUCK_FRAME_W, 0, DUCK_FRAME_W, DUCK_FRAME_H, Math.round(duck.x), Math.round(dDrawY), dw, dh);
      }
      charCtx.restore();
    });
    charCtx.imageSmoothingEnabled = true;
  }

  // ── Draw BMO (follows Josh) ──
  if (bmoSheet && bmoSheet.complete && bmoSheet.naturalWidth > 0) {
    const bDW    = BMO_FRAME_W * scale * bmo.ratio * BMO_WIDTH_RATIO;
    const bDH    = BMO_FRAME_H * scale * bmo.ratio;
    const bDrawY = groundY - bDH;
    charCtx.imageSmoothingEnabled = false;
    charCtx.save();
    if (!josh.facingLeft) {
      charCtx.translate(Math.round(bmo.x) + bDW, 0);
      charCtx.scale(-1, 1);
      charCtx.drawImage(bmoSheet, bmo.frame * BMO_FRAME_W, 0, BMO_FRAME_W, BMO_FRAME_H, 0, Math.round(bDrawY), bDW, bDH);
    } else {
      charCtx.drawImage(bmoSheet, bmo.frame * BMO_FRAME_W, 0, BMO_FRAME_W, BMO_FRAME_H, Math.round(bmo.x), Math.round(bDrawY), bDW, bDH);
    }
    charCtx.restore();
    charCtx.imageSmoothingEnabled = true;
  }
}

// ─── MAIN ANIMATION LOOP ──────────────────────────────────────────

function mainLoop(timestamp) {
  drawGrass(timestamp);
  updateCharacters(timestamp);
  drawCharacters();
  requestAnimationFrame(mainLoop);
}

// ─── PAGE IMAGE ZOOM ──────────────────────────────────────────────

const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImg     = document.getElementById('zoomImg');

document.getElementById('pageFlip').addEventListener('click', (e) => {
  const img = e.target.closest('.scrap-photo');
  if (!img) return;
  zoomImg.src = img.src;
  zoomOverlay.classList.add('active');
});

zoomOverlay.addEventListener('click', () => {
  zoomOverlay.classList.remove('active');
  zoomImg.src = '';
});