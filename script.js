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

const bgm = new Audio('SFX/BGM.mp3');
bgm.loop   = true;
bgm.volume = 0.4;

let soundOn = true;

const soundToggle = document.getElementById('soundToggle');

const bookToggle = document.getElementById('bookToggle');
let bookVisible = true;

bookToggle.addEventListener('click', () => {
  const bookWrapper = document.querySelector('.book-wrapper');
  // If book is open, act as close button
  if (document.getElementById('pageFlipContainer').classList.contains('active')) {
    closePageFlip();
    return;
  }
  bookVisible = !bookVisible;
  bookWrapper.style.opacity = bookVisible ? '1' : '0';
  // Delay pointer-events so book can't be clicked mid-fade
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
let currentPageIndex = 0; // Track current page for simple page turning

function isSinglePageMode() {
  return window.innerWidth <= 1024;
}

function initializePageFlip() {
  // Simple initialization - just reset page to 0
  currentPageIndex = 0;
  updatePageDisplay();
  pageFlipInitialized = true; // Mark as initialized
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
  // Hide all pages first
  const pages = document.querySelectorAll('.page');
  pages.forEach((page, index) => {
    page.style.display = 'none';
  });
  
  const singlePageMode = isSinglePageMode();
  const pagesPerSpread = singlePageMode ? 1 : 2;
  
  // Show current spread
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

  // Load pages from individual files if not already done
  await loadPages();

  // Initialize page flip if not already done
  if (!pageFlipInitialized) {
    initializePageFlip();
  }
  
  // Hide book cover completely
  bookWrapper.style.display = 'none';
  bookWrapper.style.visibility = 'hidden';
  bookWrapper.style.pointerEvents = 'none';
  bookWrapper.style.zIndex = '-1';

  // Stop charCanvas intercepting clicks while book is open
  const cc = document.getElementById('charCanvas');
  if (cc) cc.style.pointerEvents = 'none';

  // Repurpose book toggle as a close button
  bookToggle.textContent = '✕';
  bookToggle.title = 'Close Book';

  // Hide replay button while book is open
  const replayBtn = document.getElementById('replayBtn');
  if (replayBtn) replayBtn.style.display = 'none';

  // Show page flip container
  container.classList.add('active');
}

function closePageFlip() {
  const container = document.getElementById('pageFlipContainer');
  const bookWrapper = document.querySelector('.book-wrapper');
  
  // Play close sound
  playBookCloseSound();
  
  // Remove active class to hide
  container.classList.remove('active');
  
  // Show book cover again with proper z-index
  bookWrapper.style.display = 'block';
  bookWrapper.style.visibility = 'visible';
  bookWrapper.style.pointerEvents = 'auto';
  bookWrapper.style.zIndex = '10';

  // Restore charCanvas pointer events
  const cc = document.getElementById('charCanvas');
  if (cc) cc.style.pointerEvents = 'all';

  // Restore book toggle
  bookToggle.textContent = bookVisible ? '👁️' : '🏔️';
  bookToggle.title = bookVisible ? 'Hide Book' : 'Show Book';

  // Restore replay button
  const rb = document.getElementById('replayBtn');
  if (rb) rb.style.display = 'flex';
}

// Close book button
const closeBookBtn = document.getElementById('closeBookBtn');
if (closeBookBtn) {
  closeBookBtn.addEventListener('click', closePageFlip);
}

// Page flip arrows
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageFlipElement = document.getElementById('pageFlip');

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentPageIndex === 0) {
      // Close the book when on first page
      closePageFlip();
    } else if (currentPageIndex > 0) {
      const pageIncrement = isSinglePageMode() ? 1 : 2;
      currentPageIndex -= pageIncrement;
      updatePageDisplay();
      playPageTurnSound();
      console.log('Previous page clicked');
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
      console.log('Next page clicked');
    }
  });
}

// Handle window resize to adapt between single and double page mode
window.addEventListener('resize', () => {
  if (pageFlipInitialized) {
    updatePageDisplay();
  }
});

// ─── DIALOGUE INTRO ───────────────────────────────────────────────

const LINES = [
  "Hi Audrey! It's Josh",
  "I wanted to make something to celebrate the time we have spent together",
  "You'll be able to see ALLLL our good times, bad times, loving times and even the embarrassing times",
  "I know you really like things that are personalised and takes time and effort to make, so I made this!",
  "Just so you know, everything was handmade (Excluding the music and sounds cos idk how to do that...)",
  "BUT I MADE ALL THE ARTWORK!!!",
  "Anyway, I thought a website would be cool cos this way, you can always carry a little part of our relationship wherever you are in the world",
  "And you don't even need to carry a big ahh clunky book!",
  "And so, without further ado, press 'open' to see what I've been working on..."
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
  dialogueText.classList.remove('done');
  fullText  = LINES[index];
  charIndex = 0;
  isTyping  = true;
  dialogueText.textContent = '';
  typeCharacter();
}

function revealMain() {
  introScreen.style.transition = 'opacity 0.8s ease';
  introScreen.style.opacity    = '0';
  setTimeout(() => {
    introScreen.style.display = 'none';
    mainContent.classList.add('visible');
    bgm.play().catch(() => {});
    initGrass();
    initCharacters();
    initBookCover();
    requestAnimationFrame(mainLoop);
  }, 800);
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
  revealMain();
});

// Kick off first line
showLine(0);


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
const BOOK_FPS         = 18; // frames per second for the unlock animation

let bookCoverCanvas = null;
let bookCoverCtx    = null;
let bookSheet       = null;
let bookSheetLoaded = false;
let bookAnimFrame   = 0;
let bookAnimating   = false;
let bookAnimLastTime = 0;

function initBookCover() {
  // Replace the <img> with a <canvas>
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
    drawBookFrame(0); // show first frame (locked)
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
      // Animation done — stay on last frame, unlock book
      bookAnimating = false;
      bookUnlocked = true;
      document.querySelector('.book-wrapper').style.cursor = 'pointer';
      // Show replay button now that animation has played once
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

// Replay button — replays animation without needing the passcode
const replayBtn = document.getElementById('replayBtn');
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    if (bookAnimating) return;
    // Make sure book is visible before replaying
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
    // Play the spritesheet unlock animation
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

// Add click handler to book wrapper
document.querySelector('.book-wrapper').addEventListener('click', (e) => {
  // Don't trigger page flip if clicking the padlock
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

// ─── AUDREY WALK CHARACTER ────────────────────────────────────────

const AUDREY_SHEET_SRC = 'images/characters/audrey_spritesheet.png';
const AUDREY_FRAME_COUNT = 6;
const AUDREY_FRAME_W = 41;   // px per frame in spritesheet
const AUDREY_FRAME_H = 100;  // px height of spritesheet

const JOSH_SHEET_SRC = 'images/characters/josh_spritesheet.png';
const JOSH_FRAME_COUNT = 6;
const JOSH_FRAME_W = 41;
const JOSH_FRAME_H = 100;

// ─── DUCK CONSTANTS ───────────────────────────────────────────────
const DUCK_SHEET_SRC   = 'images/characters/duck_spritesheet.png';
const DUCK_FRAME_COUNT = 13;
const DUCK_FRAME_W     = 32;
const DUCK_FRAME_H     = 32;

// Each duck's rendered height as a fraction of Audrey's rendered height (100px * charScale)
// Duck 0 = quarter of Audrey, Duck 1 & 2 progressively smaller
const DUCK_SIZE_RATIOS = [0.75, 0.62, 0.50];
// How far behind Audrey each duck trails (px gap between Audrey's back edge and duck's front)
const DUCK_TRAIL_GAPS  = [15, 55, 95];

// ─── BMO CONSTANTS ────────────────────────────────────────────────
const BMO_SHEET_SRC   = 'images/characters/bmo_spritesheet.png';
const BMO_FRAME_COUNT = 5;
const BMO_FRAME_W     = 41;
const BMO_FRAME_H     = 100;
// BMO trails behind Josh at this size ratio and gap
const BMO_SIZE_RATIO  = 0.75;
const BMO_WIDTH_RATIO = 1.1;  // wider than tall to make him more visible
const BMO_TRAIL_GAP   = 20;

let charCanvas, charCtx;
let audreySheet = null;
let joshSheet   = null;
let duckSheet   = null;
let bmoSheet    = null;

// Duck state — x is maintained per-duck, direction mirrors Audrey
const ducks = DUCK_SIZE_RATIOS.map((ratio, i) => ({
  ratio,
  gap:       DUCK_TRAIL_GAPS[i],
  x:         0,
  frame:     0,
  frameTimer: 0,
  frameRate: 120 + i * 15, // slightly different waddle speeds
}));

// BMO state — 1 BMO trailing Josh
const bmo = {
  ratio:     BMO_SIZE_RATIO,
  gap:       BMO_TRAIL_GAP,
  x:         0,
  frame:     0,
  frameTimer: 0,
  frameRate: 130,
};

// Character state
let audrey = {
  x: 80,
  facingLeft: false,
  frame: 0,
  frameTimer: 0,
  frameRate: 100,
  speed: 1.2,
};

let josh = {
  x: 0,       // set in initCharacters
  facingLeft: true,
  frame: 0,
  frameTimer: 0,
  frameRate: 110,
  speed: 1.0,
};

function getCharScale() {
  // Keep her ~80-100px tall on all screens; spritesheet is already 100px
  return window.innerWidth < 480 ? 0.7 : 1.0;
}

function initCharacters() {
  charCanvas = document.getElementById('charCanvas');
  charCtx    = charCanvas.getContext('2d');
  charCanvas.width  = window.innerWidth;
  charCanvas.height = window.innerHeight;

  audreySheet = new Image();
  audreySheet.src = AUDREY_SHEET_SRC;

  joshSheet = new Image();
  joshSheet.src = JOSH_SHEET_SRC;

  duckSheet = new Image();
  duckSheet.src = DUCK_SHEET_SRC;

  bmoSheet = new Image();
  bmoSheet.src = BMO_SHEET_SRC;

  // Start Audrey left of centre, Josh right of centre, walking toward each other
  audrey.x = window.innerWidth * 0.2;
  josh.x   = window.innerWidth * 0.7;

  // Place ducks behind Audrey initially
  const scale = getCharScale();
  const audreyW = AUDREY_FRAME_W * scale;
  ducks.forEach((duck, i) => {
    const dh  = AUDREY_FRAME_H * scale * duck.ratio;
    const dw  = dh; // duck frames are square
    duck.x = audrey.x - dw - duck.gap - i * 5;
  });

  // Place BMO behind Josh initially
  const joshW = JOSH_FRAME_W * scale;
  const bmoDH = JOSH_FRAME_H * scale * bmo.ratio;
  const bmoDW = BMO_FRAME_W * scale * bmo.ratio;
  bmo.x = josh.x + joshW + bmo.gap;

  // Click detection & hover cursor
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

  // Move ducks — each trails behind Audrey at a fixed gap
  ducks.forEach((duck, i) => {
    const dh = AUDREY_FRAME_H * scale * duck.ratio;
    const dw = dh;
    // Target x: behind Audrey's back edge
    const targetX = audrey.facingLeft
      ? audrey.x + charW + duck.gap + i * 5   // Audrey moving left, ducks trail to her right
      : audrey.x - dw - duck.gap - i * 5;      // Audrey moving right, ducks trail to her left

    // Move duck toward target at Audrey's speed
    const diff = targetX - duck.x;
    const step = Math.min(Math.abs(diff), audrey.speed);
    duck.x += Math.sign(diff) * step;

    // Animate duck frames
    if (timestamp - duck.frameTimer > duck.frameRate) {
      duck.frame     = (duck.frame + 1) % DUCK_FRAME_COUNT;
      duck.frameTimer = timestamp;
    }
  });

  // Move BMO — trails behind Josh at a fixed gap
  const joshW = JOSH_FRAME_W * scale;
  const bmoDH = BMO_FRAME_H * scale * bmo.ratio;
  const bmoDW = BMO_FRAME_W * scale * bmo.ratio * BMO_WIDTH_RATIO;
  const targetBmoX = josh.facingLeft
    ? josh.x + joshW + bmo.gap       // Josh moving left, BMO trails to his right
    : josh.x - bmoDW - bmo.gap;      // Josh moving right, BMO trails to his left
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

const charOverlay      = document.createElement('div');
charOverlay.id         = 'charDialogueOverlay';
charOverlay.innerHTML  = `
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
  charFullText      = activeLines[index];
  charCharIndex     = 0;
  charIsTyping      = true;
  charDialogueText.textContent = '';
  charTypeCharacter();
}

function openCharDialogue(lines) {
  if (charDialogueActive) return;
  charDialogueActive   = true;
  activeLines          = lines;
  charCurrentLine      = 0;
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
  const scale  = getCharScale();
  const groundY = window.innerHeight - 120 + (120 - 16);

  const hitAudrey = mx >= audrey.x - 10 && mx <= audrey.x + dw + 10
                 && my >= drawY   - 10 && my <= drawY   + dh + 10;
  const hitJosh   = mx >= josh.x   - 10 && mx <= josh.x   + dw + 10
                 && my >= drawY   - 10 && my <= drawY   + dh + 10;

  // Check duck hits
  let hitDuck = false;
  ducks.forEach((duck) => {
    const ddh    = AUDREY_FRAME_H * scale * duck.ratio;
    const ddw    = ddh;
    const ddrawY = groundY - ddh * 0.75;
    if (mx >= duck.x - 6 && mx <= duck.x + ddw + 6 &&
        my >= ddrawY - 6 && my <= ddrawY + ddh + 6) {
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
        my >= ddrawY - 6 && my <= ddrawY + ddh + 6) {
      hitDuck = true;
    }
  });

  const hitAny = hitDuck
    || (mx >= audrey.x - 10 && mx <= audrey.x + dw + 10 && my >= drawY - 10 && my <= drawY + dh + 10)
    || (mx >= josh.x   - 10 && mx <= josh.x   + dw + 10 && my >= drawY - 10 && my <= drawY + dh + 10)
    || (() => {
      const bDW = BMO_FRAME_W * scale * bmo.ratio * BMO_WIDTH_RATIO;
      const bDH = BMO_FRAME_H * scale * bmo.ratio;
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

  // shadow / border
  // charCtx.fillStyle = '#000';
  // charCtx.fillRect(Math.round(bx) + 2, Math.round(by) + 2, Math.ceil(bw), Math.ceil(bh));
  // background
  charCtx.fillStyle = '#1a25306b';
  charCtx.fillRect(Math.round(bx), Math.round(by), Math.ceil(bw), Math.ceil(bh));
  // border
  charCtx.strokeStyle = '#a8bfcf6e';
  charCtx.lineWidth   = 1.5;
  charCtx.strokeRect(Math.round(bx) + 0.5, Math.round(by) + 0.5, Math.ceil(bw) - 1, Math.ceil(bh) - 1);
  // text
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

  // ── Draw Audrey (only if loaded) ──
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

  // ── Draw Josh (only if loaded) ──
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
      const dh    = AUDREY_FRAME_H * scale * duck.ratio;
      const dw    = dh;
      const dDrawY = groundY - dh * 0.75; // sit on ground
      charCtx.save();
      // Ducks face same direction as Audrey
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