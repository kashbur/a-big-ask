// envelope.js – 3D envelope with flap mechanics

// ---------------- Config ----------------
const DEFAULT_PAPER = "#f2e6d0";

// ---------------- Styles ----------------
const STYLE = `
@font-face {
  font-family: 'Boho';
  src: url('Boho.otf') format('opentype');
  font-display: swap;
}

.envelope-scene {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 1001;
  perspective: 1200px;
  cursor: pointer;
}

.envelope-3d {
  width: min(86vw, 360px);
  height: calc(min(86vw, 360px) * 2 / 3);
  aspect-ratio: 3 / 2;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(.22,.61,.36,1);
  box-shadow: 0 10px 28px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06);
}

.envelope-3d.is-flipped {
  transform: rotateY(180deg);
}

/* Common Face Styles */
.envelope-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 14px;
  overflow: hidden;
}

/* FRONT OF ENVELOPE */
.envelope-front {
  background: white;
  background-image: radial-gradient(#fdfbf7, #f4f1ea);
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1.5px solid #a37b4c;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.05);
  padding: 18px;
}

.envelope-front-text {
  font-family: 'Boho', cursive;
  font-weight: 700;
  font-size: clamp(42px, 7vw, 64px);
  line-height: 1.1;
  color: #1f1f1f;
  letter-spacing: 0.02em;
  text-align: center;
  max-width: 92%;
  white-space: normal;
  word-break: break-word;
  hyphens: auto;
}

.stamp {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 60px;
  background-color: #e74c3c;
  border: 3px double white;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
  transform: rotate(5deg);
}

.stamp::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(transparent 40%, rgba(0,0,0,0.1) 40%);
  background-size: 4px 4px;
}

/* BACK OF ENVELOPE */
.envelope-back {
  transform: rotateY(180deg);
  background-color: #dcdcdc;
  z-index: 1;
  transform-style: preserve-3d;
  overflow: visible;
  border-radius: 14px;
}

/* The Flaps (triangular shapes using borders) */
.flap {
  position: absolute;
  width: 0;
  height: 0;
  z-index: 10;
}

/* Left flap - half width of envelope */
.flap.left {
  border-left: calc(min(86vw, 360px) / 2) solid #f4f1ea;
  border-top: calc((min(86vw, 360px) * 2 / 3) / 2) solid transparent;
  border-bottom: calc((min(86vw, 360px) * 2 / 3) / 2) solid transparent;
  top: 0;
  left: 0;
  filter: drop-shadow(1px 0 1px rgba(0,0,0,0.05));
}

/* Right flap - half width of envelope */
.flap.right {
  border-right: calc(min(86vw, 360px) / 2) solid #f4f1ea;
  border-top: calc((min(86vw, 360px) * 2 / 3) / 2) solid transparent;
  border-bottom: calc((min(86vw, 360px) * 2 / 3) / 2) solid transparent;
  top: 0;
  right: 0;
  filter: drop-shadow(-1px 0 1px rgba(0,0,0,0.05));
}

/* Bottom flap */
.flap.bottom {
  border-bottom: calc((min(86vw, 360px) * 2 / 3) * 0.55) solid #f4f1ea;
  border-left: calc(min(86vw, 360px) / 2) solid transparent;
  border-right: calc(min(86vw, 360px) / 2) solid transparent;
  bottom: 0;
  left: 0;
  z-index: 11;
  filter: drop-shadow(0 -2px 3px rgba(0,0,0,0.1));
}

/* Moving Top Flap */
.flap.top {
  border-top: calc((min(86vw, 360px) * 2 / 3) * 0.55) solid #fdfbf7;
  border-left: calc(min(86vw, 360px) / 2) solid transparent;
  border-right: calc(min(86vw, 360px) / 2) solid transparent;
  top: 0;
  left: 0;
  transform-origin: top center;
  transition: transform 0.6s 0.2s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.4s;
  z-index: 12;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.1));
}

.envelope-3d.is-open .flap.top {
  transform: rotateX(180deg);
  z-index: 1;
  transition-delay: 0s;
}

/* Wax Seal */
.wax-seal {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 50px;
  background: #c0392b;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e74c3c;
  font-size: 28px;
  font-weight: bold;
  z-index: 13;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.envelope-3d.is-open .wax-seal {
  transform: translateX(-50%) scale(0.5);
  opacity: 0;
}

/* THE LETTER */
.letter {
  position: absolute;
  background: white;
  width: 90%;
  height: 90%;
  left: 5%;
  bottom: 5px;
  z-index: 5;
  padding: 20px;
  box-sizing: border-box;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
  transition: transform 1.2s ease-in-out;
  border-radius: 2px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.envelope-3d.is-open .letter.is-out {
  transform: translateY(-120px);
  transition-delay: 0.1s;
}

.letter-content {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.3s;
  font-family: "Courier New", monospace;
  font-size: clamp(16px, 3.6vw, 20px);
  line-height: 1.25;
  color: #1f1f1f;
  white-space: pre-wrap;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.envelope-3d.is-open .letter.is-out .letter-content {
  opacity: 1;
  transition-delay: 0.6s;
}

/* Continue Button */
.envelope-continue {
  position: absolute;
  bottom: clamp(28px, 9vh, 72px);
  left: 50%;
  transform: translateX(-50%);
  background: none;
  border: none;
  box-shadow: none;
  padding: 0;
  color: #fff;
  font: 600 18px "Courier New", monospace;
  letter-spacing: 0.05em;
  text-shadow: 0 0 6px rgba(0,0,0,0.4);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s, transform 0.28s;
  transform: translate(-50%, 8px);
  outline: none;
  cursor: pointer;
}

.envelope-continue:focus,
.envelope-continue:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

.envelope-continue.is-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
  animation: pulseText 1.6s ease-in-out infinite;
}

@keyframes pulseText {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 0.35; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .envelope-3d, .envelope-continue, .flap, .letter {
    transition: none !important;
    animation: none !important;
  }
}
`;

// ---------------- Utils ----------------
function params() {
  const p = new URLSearchParams(location.search);
  const g = k => (p.get(k) || "").replace(/\+/g, " ");
  const safe = v => { try { return decodeURIComponent(v); } catch { return v; } };
  return new Proxy({}, { get:(_,k)=> safe(g(k)) });
}

// ---------------- Mount ----------------
function mountEnvelope() {
  const overlay = document.getElementById("landingOverlay") || document.querySelector(".landing-overlay");
  if (!overlay) return;

  // Hide original landing text
  const msg = overlay.querySelector(".landing-message-container");
  if (msg) msg.style.display = "none";

  // Inject styles
  if (!document.getElementById("envelope-style")) {
    const s = document.createElement("style");
    s.id = "envelope-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  const p = params();
  const toName = (p.name || "").trim();
  const frontText = toName ? `To ${toName}` : "To you";

  const bodyText = p.message || "you've always been by my side.\nI can't imagine doing the next chapter without you.";
  const body = bodyText.replace(/\\n/g, "\n");

  overlay.insertAdjacentHTML("beforeend", `
    <div class="envelope-scene" id="envelopeScene">
      <div class="envelope-3d" id="envelope">
        <!-- Front Face -->
        <div class="envelope-face envelope-front">
          <div class="stamp">♥</div>
          <span class="envelope-front-text">${frontText}</span>
        </div>

        <!-- Back Face -->
        <div class="envelope-face envelope-back">
          <!-- Static Flaps -->
          <div class="flap left"></div>
          <div class="flap right"></div>

          <!-- The Letter -->
          <div class="letter" id="letter">
            <div class="letter-content">${body}</div>
          </div>

          <!-- Bottom Flap -->
          <div class="flap bottom"></div>

          <!-- Moving Top Flap -->
          <div class="flap top">
            <div class="wax-seal">♥</div>
          </div>
        </div>
      </div>
      <button class="envelope-continue" id="envelopeContinue" type="button">Tap to continue</button>
    </div>
  `);

  const envelope = document.getElementById("envelope");
  const letter = document.getElementById("letter");
  const cont = document.getElementById("envelopeContinue");
  const scene = document.getElementById("envelopeScene");

  let state = 'closed'; // closed, flipped, open

  scene.addEventListener('click', (e) => {
    if (state === 'closed') {
      e.preventDefault();
      e.stopPropagation();

      // Step 1: Flip
      envelope.classList.add('is-flipped');
      state = 'flipped';

      // Step 2: Open Flap (Wait for flip)
      setTimeout(() => {
        envelope.classList.add('is-open');

        // Step 3: Slide Letter Out (Wait for flap)
        setTimeout(() => {
          letter.classList.add('is-out');
          state = 'open';

          // Show continue button
          setTimeout(() => {
            cont.classList.add('is-visible');
          }, 800);
        }, 500);
      }, 800);
    }
  });

  scene.addEventListener('touchstart', (e) => {
    if (state === 'closed') {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive: false });

  // Continue button dismiss
  cont.addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => overlay.remove(), 420);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountEnvelope);
else mountEnvelope();
