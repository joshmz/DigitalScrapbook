// ─── AUDIO SETUP ─────────────────────────────────────────────────

const typeSound = new Audio('SFX/Type.wav');
typeSound.volume = 0.2;

const dialSound = new Audio('SFX/Type.wav');
dialSound.volume = 0.3;

const wrongSound = new Audio('SFX/Wrong.mp3');
wrongSound.volume = 0.5;

const openSound = new Audio('SFX/Open.mp3');
openSound.volume = 0.5;

const bgm = new Audio('SFX/BGM.mp3');
bgm.loop   = true;
bgm.volume = 0.4;

let soundOn = true;

const soundToggle = document.getElementById('soundToggle');

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
const MAX     = [31, 31, 31];
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
    alert('open!');
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
  requestAnimationFrame(drawGrass);
}

window.addEventListener('resize', () => {
  initGrass();
  repositionCharacters();
});

// ─── AUDREY WALK CHARACTER ────────────────────────────────────────

const AUDREY_SHEET_SRC = 'data:image/png;base64,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';
const AUDREY_FRAME_COUNT = 6;
const AUDREY_FRAME_W = 41;   // px per frame in spritesheet
const AUDREY_FRAME_H = 100;  // px height of spritesheet

let charCanvas, charCtx;
let audreySheet = null;

// Character state
let audrey = {
  x: 80,
  facingLeft: false,
  frame: 0,
  frameTimer: 0,
  frameRate: 100,  // ms per frame — adjust for walk speed feel
  speed: 1.2,      // pixels per frame at 60fps
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

  // Start her just left of center, walking right
  audrey.x = window.innerWidth * 0.2;

  // Click detection & hover cursor
  charCanvas.addEventListener('click', handleCharClick);
  charCanvas.addEventListener('mousemove', updateCursor);
}

function repositionCharacters() {
  if (!charCanvas) return;
  charCanvas.width  = window.innerWidth;
  charCanvas.height = window.innerHeight;
  // Clamp to new bounds
  const scale  = getCharScale();
  const charW  = AUDREY_FRAME_W * scale;
  audrey.x = Math.max(charW, Math.min(audrey.x, window.innerWidth - charW * 2));
}

function updateCharacters(timestamp) {
  if (!charCanvas) return;
  const scale = getCharScale();
  const charW = AUDREY_FRAME_W * scale;

  // Move
  audrey.x += audrey.facingLeft ? -audrey.speed : audrey.speed;

  // Turn at edges
  if (!audrey.facingLeft && audrey.x + charW * 2 >= window.innerWidth - 8) {
    audrey.facingLeft = true;
  } else if (audrey.facingLeft && audrey.x <= 8) {
    audrey.facingLeft = false;
  }

  // Advance frame
  if (timestamp - audrey.frameTimer > audrey.frameRate) {
    audrey.frame      = (audrey.frame + 1) % AUDREY_FRAME_COUNT;
    audrey.frameTimer = timestamp;
  }
}

// ─── CHARACTER DIALOGUE ───────────────────────────────────────────

const CHAR_LINES = ["Hi I'm Audrey"];

let charDialogueActive = false;
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
    if (charCurrentLine === CHAR_LINES.length - 1) {
      charNextBtn.textContent = 'CLOSE ✕';
    }
  }
}

function charShowLine(index) {
  clearTimeout(charTypeTimeout);
  charDialogueText.classList.remove('done');
  charFullText      = CHAR_LINES[index];
  charCharIndex     = 0;
  charIsTyping      = true;
  charDialogueText.textContent = '';
  charTypeCharacter();
}

function openCharDialogue() {
  if (charDialogueActive) return;
  charDialogueActive   = true;
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
    if (charCurrentLine === CHAR_LINES.length - 1) charNextBtn.textContent = 'CLOSE ✕';
    return;
  }
  charCurrentLine++;
  if (charCurrentLine < CHAR_LINES.length) {
    charShowLine(charCurrentLine);
  } else {
    closeCharDialogue();
  }
});

charOverlay.addEventListener('click', (e) => {
  if (e.target === charOverlay) closeCharDialogue();
});

// ─── CHARACTER CLICK DETECTION ───────────────────────────────────

function handleCharClick(e) {
  if (!charCanvas) return;
  const rect  = charCanvas.getBoundingClientRect();
  // Scale mouse coords to canvas pixel space
  const scaleX = charCanvas.width  / rect.width;
  const scaleY = charCanvas.height / rect.height;
  const mx    = (e.clientX - rect.left) * scaleX;
  const my    = (e.clientY - rect.top)  * scaleY;
  const scale = getCharScale();
  const dw    = AUDREY_FRAME_W * scale;
  const dh    = AUDREY_FRAME_H * scale;
  const groundY = window.innerHeight - 120 + (120 - 16);
  const drawY   = groundY - dh;
  // Generous hit box — expand by 10px on each side
  const hit = mx >= audrey.x - 10 && mx <= audrey.x + dw + 10
           && my >= drawY   - 10 && my <= drawY   + dh + 10;
  if (hit) openCharDialogue();
}

// Update cursor when hovering over character
function updateCursor(e) {
  if (!charCanvas) return;
  const rect  = charCanvas.getBoundingClientRect();
  const scaleX = charCanvas.width  / rect.width;
  const scaleY = charCanvas.height / rect.height;
  const mx    = (e.clientX - rect.left) * scaleX;
  const my    = (e.clientY - rect.top)  * scaleY;
  const scale = getCharScale();
  const dw    = AUDREY_FRAME_W * scale;
  const dh    = AUDREY_FRAME_H * scale;
  const groundY = window.innerHeight - 120 + (120 - 16);
  const drawY   = groundY - dh;
  const hit = mx >= audrey.x - 10 && mx <= audrey.x + dw + 10
           && my >= drawY   - 10 && my <= drawY   + dh + 10;
  charCanvas.style.cursor = hit ? 'pointer' : 'default';
}

// ─── NAMETAG DRAWING ─────────────────────────────────────────────

function drawNametag(cx, topY) {
  const label    = 'Audrey';
  const fontSize = 7;
  const pad      = 4;
  charCtx.font   = `${fontSize}px "Press Start 2P", monospace`;
  const tw       = charCtx.measureText(label).width;
  const bw       = tw + pad * 2;
  const bh       = fontSize + pad * 2;
  const bx       = cx - bw / 2;
  const by       = topY - bh - 6;

  // shadow / border
  charCtx.fillStyle = '#000';
  charCtx.fillRect(Math.round(bx) + 2, Math.round(by) + 2, Math.ceil(bw), Math.ceil(bh));
  // background
  charCtx.fillStyle = '#1a2530';
  charCtx.fillRect(Math.round(bx), Math.round(by), Math.ceil(bw), Math.ceil(bh));
  // border
  charCtx.strokeStyle = '#a8bfcf';
  charCtx.lineWidth   = 1.5;
  charCtx.strokeRect(Math.round(bx) + 0.5, Math.round(by) + 0.5, Math.ceil(bw) - 1, Math.ceil(bh) - 1);
  // text
  charCtx.fillStyle    = '#f0e8d0';
  charCtx.textBaseline = 'top';
  charCtx.fillText(label, Math.round(bx + pad), Math.round(by + pad));
}

function drawCharacters() {
  if (!charCanvas || !audreySheet.complete) return;
  charCtx.clearRect(0, 0, charCanvas.width, charCanvas.height);

  const scale  = getCharScale();
  const dw     = AUDREY_FRAME_W * scale;
  const dh     = AUDREY_FRAME_H * scale;

  // Ground Y: sit her feet on top of the grass (grass canvas is 120px, soil starts ~80px in)
  const groundY = window.innerHeight - 120 + (120 - 16); // 16px = soil strip height
  const drawY   = groundY - dh;

  charCtx.save();

  if (audrey.facingLeft) {
    // Flip horizontally around character centre
    charCtx.translate(Math.round(audrey.x) + dw, 0);
    charCtx.scale(-1, 1);
    charCtx.drawImage(
      audreySheet,
      audrey.frame * AUDREY_FRAME_W, 0,   // source x,y in sheet
      AUDREY_FRAME_W, AUDREY_FRAME_H,      // source w,h
      0, Math.round(drawY),                // dest x,y
      dw, dh                               // dest w,h
    );
  } else {
    charCtx.drawImage(
      audreySheet,
      audrey.frame * AUDREY_FRAME_W, 0,
      AUDREY_FRAME_W, AUDREY_FRAME_H,
      Math.round(audrey.x), Math.round(drawY),
      dw, dh
    );
  }

  charCtx.restore();

  // Draw nametag above character (always unflipped position)
  const cx = Math.round(audrey.x + dw / 2);
  drawNametag(cx, Math.round(drawY));
}

// ─── MAIN ANIMATION LOOP ──────────────────────────────────────────

function mainLoop(timestamp) {
  drawGrass(timestamp);
  updateCharacters(timestamp);
  drawCharacters();
  requestAnimationFrame(mainLoop);
}
