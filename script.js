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

const quackSound = new Audio('SFX/quack.mp3');
quackSound.volume = 0.8;

const bgm = new Audio('SFX/BGM.mp3');
bgm.loop   = true;
bgm.volume = 0.2;

let soundOn = true;

const soundToggle = document.getElementById('soundToggle');

soundToggle.addEventListener('click', () => {
  soundOn                 = !soundOn;
  bgm.muted               = !soundOn;
  soundToggle.textContent = soundOn ? '🔊' : '🔇';
  soundToggle.title       = soundOn ? 'Mute' : 'Unmute';
});

// ─── BOOK TOGGLE ─────────────────────────────────────────────────

const bookToggle = document.getElementById('bookToggle');
let bookVisible = true;

bookToggle.addEventListener('click', () => {
  const bookWrapper = document.querySelector('.book-wrapper');
  bookVisible = !bookVisible;
  bookWrapper.style.display = bookVisible ? 'block' : 'none';
  bookToggle.textContent = bookVisible ? '📖' : '📕';
  bookToggle.title       = bookVisible ? 'Hide Book' : 'Show Book';
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

  // Hide toggle while book is open
  bookToggle.style.display = 'none';

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
  
  // Show book cover again (only if it was visible before)
  if (bookVisible) {
    bookWrapper.style.display = 'block';
    bookWrapper.style.visibility = 'visible';
    bookWrapper.style.pointerEvents = 'auto';
    bookWrapper.style.zIndex = '10';
  }

  // Show toggle again
  bookToggle.style.display = 'flex';
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
  "BUT ALL THE ARTWORK (except the background) WAS MADE BY ME!!!!",
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

openBtn.addEventListener('click', () => {
  const isCorrect = values.every((val, i) => val === CORRECT[i]);
  if (isCorrect) {
    modalOverlay.classList.remove('active');
    if (soundOn) {
      openSound.currentTime = 0;
      openSound.play().catch(() => {});
    }
    // Change book cover to opened state
    document.querySelector('.book-cover').src = 'images/BookOpened.png';
    bookUnlocked = true;
    // Make book clickable after unlock
    document.querySelector('.book-wrapper').style.cursor = 'pointer';
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

// ─── DUCK ─────────────────────────────────────────────────────────
const DUCK_SHEET_SRC   = 'images/characters/duck_spritesheet.png';
const DUCK_FRAME_COUNT = 13;
const DUCK_FRAME_W     = 32;
const DUCK_FRAME_H     = 32;

let duckSheet = null;

let duck = {
  x: 0,
  facingLeft: false,
  speed: 1.8,
  scale: 2.5,
  frame: 0,
  frameTimer: 0,
  frameRate: 60,
};

let duck2 = {
  x: 0,
  facingLeft: false,
  frame: 0,
  frameTimer: 0,
  frameRate: 65,
  scale: 1.9,
};

let duck3 = {
  x: 0,
  facingLeft: false,
  frame: 0,
  frameTimer: 0,
  frameRate: 70,
  scale: 1.9,
};

let charCanvas, charCtx;
let audreySheet = null;
let joshSheet   = null;

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

  // Start Audrey left of centre, Josh right of centre, walking toward each other
  audrey.x = window.innerWidth * 0.2;
  josh.x   = window.innerWidth * 0.7;
  duck.x   = window.innerWidth * 0.5;

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
  if (!audrey.facingLeft && audrey.x + charW >= window.innerWidth - 8) {
    audrey.facingLeft = true;
    audrey.x = window.innerWidth - 8 - charW;
  } else if (audrey.facingLeft && audrey.x <= 8) {
    audrey.facingLeft = false;
    audrey.x = 8;
  }
  if (timestamp - audrey.frameTimer > audrey.frameRate) {
    audrey.frame      = (audrey.frame + 1) % AUDREY_FRAME_COUNT;
    audrey.frameTimer = timestamp;
  }

  // Move Josh
  josh.x += josh.facingLeft ? -josh.speed : josh.speed;
  if (!josh.facingLeft && josh.x + charW >= window.innerWidth - 8) {
    josh.facingLeft = true;
    josh.x = window.innerWidth - 8 - charW;
  } else if (josh.facingLeft && josh.x <= 8) {
    josh.facingLeft = false;
    josh.x = 8;
  }
  if (timestamp - josh.frameTimer > josh.frameRate) {
    josh.frame      = (josh.frame + 1) % JOSH_FRAME_COUNT;
    josh.frameTimer = timestamp;
  }

  // Move Duck — follow right behind Audrey
  const duckW = DUCK_FRAME_W * duck.scale;
  const followOffset = 30;
  duck.facingLeft = audrey.facingLeft;
  if (audrey.facingLeft) {
    duck.x = audrey.x + charW + followOffset;
  } else {
    duck.x = audrey.x - duckW - followOffset;
  }
  if (timestamp - duck.frameTimer > duck.frameRate) {
    duck.frame      = (duck.frame + 1) % DUCK_FRAME_COUNT;
    duck.frameTimer = timestamp;
  }

  // Move Duck2 — follow behind Duck1
  const duck2W = DUCK_FRAME_W * duck2.scale;
  const gap2 = -10;
  duck2.facingLeft = audrey.facingLeft;
  if (audrey.facingLeft) {
    duck2.x = duck.x + duckW + gap2;
  } else {
    duck2.x = duck.x - duck2W - gap2;
  }
  if (timestamp - duck2.frameTimer > duck2.frameRate) {
    duck2.frame      = (duck2.frame + 1) % DUCK_FRAME_COUNT;
    duck2.frameTimer = timestamp;
  }

  // Move Duck3 — follow behind Duck2
  const duck3W = DUCK_FRAME_W * duck3.scale;
  const gap3 = -10;
  duck3.facingLeft = audrey.facingLeft;
  if (audrey.facingLeft) {
    duck3.x = duck2.x + duck2W + gap3;
  } else {
    duck3.x = duck2.x - duck3W - gap3;
  }
  if (timestamp - duck3.frameTimer > duck3.frameRate) {
    duck3.frame      = (duck3.frame + 1) % DUCK_FRAME_COUNT;
    duck3.frameTimer = timestamp;
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

  const hitAudrey = mx >= audrey.x - 10 && mx <= audrey.x + dw + 10
                 && my >= drawY   - 10 && my <= drawY   + dh + 10;
  const hitJosh   = mx >= josh.x   - 10 && mx <= josh.x   + dw + 10
                 && my >= drawY   - 10 && my <= drawY   + dh + 10;

  if (hitAudrey) openCharDialogue(AUDREY_LINES);
  else if (hitJosh) openCharDialogue(JOSH_LINES);

  // Duck hit detection
  const ddw     = DUCK_FRAME_W * duck.scale;
  const ddh     = DUCK_FRAME_H * duck.scale;
  const groundY2 = window.innerHeight - 120 + (120 - 16);
  const dDrawY  = groundY2 - ddh + 20;
  const d2w = DUCK_FRAME_W * duck2.scale;
  const d2h = DUCK_FRAME_H * duck2.scale;
  const d2DrawY = groundY2 - d2h + 20;
  const d3w = DUCK_FRAME_W * duck3.scale;
  const d3h = DUCK_FRAME_H * duck3.scale;
  const d3DrawY = groundY2 - d3h + 20;

  const hitDuck  = mx >= duck.x  - 10 && mx <= duck.x  + ddw + 10 && my >= dDrawY  - 10 && my <= dDrawY  + ddh + 10;
  const hitDuck2 = mx >= duck2.x - 10 && mx <= duck2.x + d2w + 10 && my >= d2DrawY - 10 && my <= d2DrawY + d2h + 10;
  const hitDuck3 = mx >= duck3.x - 10 && mx <= duck3.x + d3w + 10 && my >= d3DrawY - 10 && my <= d3DrawY + d3h + 10;

  if (hitDuck || hitDuck2 || hitDuck3) {
    if (soundOn) {
      quackSound.currentTime = 0;
      quackSound.play().catch(() => {});
    }
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

  const hitAny = (mx >= audrey.x - 10 && mx <= audrey.x + dw + 10 && my >= drawY - 10 && my <= drawY + dh + 10)
              || (mx >= josh.x   - 10 && mx <= josh.x   + dw + 10 && my >= drawY - 10 && my <= drawY + dh + 10)
              || (() => {
                   const ddw2 = DUCK_FRAME_W * duck.scale;
                   const ddh2 = DUCK_FRAME_H * duck.scale;
                   const gy   = window.innerHeight - 120 + (120 - 16);
                   const dy   = gy - ddh2 + 20;
                   const d2w2 = DUCK_FRAME_W * duck2.scale;
                   const d2h2 = DUCK_FRAME_H * duck2.scale;
                   const d2y  = gy - d2h2 + 20;
                   const d3w2 = DUCK_FRAME_W * duck3.scale;
                   const d3h2 = DUCK_FRAME_H * duck3.scale;
                   const d3y  = gy - d3h2 + 20;
                   return (mx >= duck.x  - 10 && mx <= duck.x  + ddw2 + 10 && my >= dy  - 10 && my <= dy  + ddh2 + 10)
                       || (mx >= duck2.x - 10 && mx <= duck2.x + d2w2 + 10 && my >= d2y - 10 && my <= d2y + d2h2 + 10)
                       || (mx >= duck3.x - 10 && mx <= duck3.x + d3w2 + 10 && my >= d3y - 10 && my <= d3y + d3h2 + 10);
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

  // ── Draw Ducks ──
  if (duckSheet && duckSheet.complete && duckSheet.naturalWidth > 0) {
    const ducks = [duck, duck2, duck3];
    for (const d of ducks) {
      const ddw    = DUCK_FRAME_W * d.scale;
      const ddh    = DUCK_FRAME_H * d.scale;
      const dDrawY = groundY - ddh + 20;
      charCtx.save();
      charCtx.imageSmoothingEnabled = false;
      if (d.facingLeft) {
        charCtx.translate(Math.round(d.x) + ddw, 0);
        charCtx.scale(-1, 1);
        charCtx.drawImage(duckSheet, d.frame * DUCK_FRAME_W, 0, DUCK_FRAME_W, DUCK_FRAME_H, 0, Math.round(dDrawY), ddw, ddh);
      } else {
        charCtx.drawImage(duckSheet, d.frame * DUCK_FRAME_W, 0, DUCK_FRAME_W, DUCK_FRAME_H, Math.round(d.x), Math.round(dDrawY), ddw, ddh);
      }
      charCtx.restore();
    }
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