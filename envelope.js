const STYLE = `
@font-face {
  font-family: "Boho";
  src: url("Boho.otf") format("opentype");
  font-display: swap;
}

.landing-overlay {
  background: #fceddf !important;
}

.intro-envelope-stage {
  --intro-bg: #fceddf;
  --env-pink: #fbd7c9;
  --env-dark-pink: #f0c3b0;
  --env-outline: #a78042;
  --letter-bg: #fdefe0;
  --text-dark: #a78042;
  --heart-pink: #f4bdae;
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(28px, 7vh, 52px);
  padding: 24px;
  box-sizing: border-box;
  color: var(--text-dark);
  font-family: "Courier New", monospace;
}

.intro-envelope-shell {
  width: min(76vw, 450px);
  aspect-ratio: 1.5;
  perspective: 2000px;
  perspective-origin: 50% 50%;
}

.intro-envelope-card {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
}

.intro-envelope-card.is-flipped {
  transform: rotateY(-180deg);
}

.intro-envelope-front,
.intro-envelope-back {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 2px solid var(--env-outline);
  border-radius: 4px;
  background: var(--env-pink);
  box-shadow:
    0 15px 35px rgba(160, 129, 108, 0.15),
    0 5px 15px rgba(160, 129, 108, 0.1);
  backface-visibility: hidden;
}

.intro-envelope-front {
  overflow: hidden;
}

.intro-envelope-front {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  box-sizing: border-box;
}

.intro-envelope-front::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid var(--env-outline);
  border-radius: 3px;
  opacity: 0.4;
}

.intro-envelope-front-copy {
  position: relative;
  margin-top: 10px;
  transform: rotate(-2deg);
  text-align: center;
  color: var(--text-dark);
}

.intro-envelope-to {
  display: block;
  margin-bottom: 2px;
  font-family: "Boho", cursive;
  font-size: clamp(34px, 8vw, 52px);
  line-height: 1;
}

.intro-envelope-name {
  display: block;
  max-width: 100%;
  font-family: "Boho", cursive;
  font-size: clamp(58px, 15vw, 94px);
  line-height: 0.9;
  font-weight: 400;
  white-space: nowrap;
}

.intro-envelope-back {
  transform: rotateY(180deg);
  background: var(--env-dark-pink);
  overflow: visible;
}

.intro-letter-wrapper {
  position: absolute;
  bottom: 4%;
  left: 4%;
  width: 92%;
  height: 90%;
  z-index: 10;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition:
    height 1s cubic-bezier(0.34, 1.3, 0.64, 1),
    transform 1s cubic-bezier(0.34, 1.3, 0.64, 1),
    z-index 0s 0.2s;
}

.intro-letter-wrapper.is-out {
  height: var(--letter-height, 90%);
  transform: translateY(-48%);
  z-index: 25;
  transition:
    height 1s cubic-bezier(0.34, 1.3, 0.64, 1),
    transform 1s cubic-bezier(0.34, 1.3, 0.64, 1),
    z-index 0s 0s;
}

.intro-envelope-letter {
  min-height: 100%;
  height: max-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  padding: 24px 18px 18px;
  box-sizing: border-box;
  border: 2px solid var(--env-outline);
  border-radius: 6px;
  background: var(--letter-bg);
  text-align: center;
  color: var(--text-dark);
}

.intro-bow {
  width: 76px;
  height: 46px;
  flex: 0 0 auto;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.08));
}

.intro-letter-message {
  margin: 0;
  max-width: 100%;
  font-family: "Courier New", monospace;
  font-size: clamp(13px, 3.1vw, 17px);
  font-weight: 700;
  line-height: 1.75;
  letter-spacing: -0.01em;
  white-space: pre-wrap;
}

.intro-envelope-pocket {
  position: absolute;
  inset: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  z-index: 20;
  pointer-events: none;
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
}

.intro-top-flap {
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: 57%;
  z-index: 30;
  transform-origin: top;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.4, 0, 0.2, 1), z-index 0s 0.45s;
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.12));
}

.intro-top-flap.is-open {
  z-index: 5;
  transform: rotateX(180deg);
}

.intro-flap-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}

.intro-flap-inside {
  transform: rotateX(180deg);
}

.intro-heart-seal {
  position: absolute;
  left: 50%;
  bottom: -25%;
  width: 18%;
  aspect-ratio: 1;
  transform: translateX(-50%);
  z-index: 50;
}

.intro-cta {
  position: relative;
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--env-outline);
  font: 700 12px/1 "Courier New", monospace;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;
  animation: introPulse 2s infinite;
}

@keyframes introPulse {
  0%, 100% { opacity: 0.58; }
  50% { opacity: 1; }
}

.intro-reading-modal {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
  background: rgba(252, 237, 223, 0.95);
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s ease;
}

.intro-reading-modal.is-open {
  opacity: 1;
  pointer-events: auto;
}

.intro-reading-card {
  width: min(88vw, 440px);
  max-height: 84vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
  padding: 30px 28px;
  box-sizing: border-box;
  border: 2px solid var(--env-outline);
  border-radius: 12px;
  background: var(--letter-bg);
  color: var(--text-dark);
  text-align: center;
  box-shadow: 0 18px 45px rgba(120, 85, 62, 0.18);
  transform: scale(0.75);
  transition: transform 0.6s ease;
}

.intro-reading-modal.is-open .intro-reading-card {
  transform: scale(1);
}

.intro-reading-message {
  margin: 0;
  font-family: "Courier New", monospace;
  font-size: clamp(18px, 4.8vw, 25px);
  font-weight: 700;
  line-height: 1.85;
  white-space: pre-wrap;
}

.intro-reading-hint {
  margin: 10px 0 0;
  font: 700 10px/1 "Courier New", monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0.6;
}

@media (max-width: 520px) {
  .intro-envelope-stage {
    gap: 34px;
  }

  .intro-envelope-shell {
    width: min(88vw, 430px);
  }

  .intro-letter-message {
    font-size: clamp(12px, 3.5vw, 15px);
    line-height: 1.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-envelope-card,
  .intro-top-flap,
  .intro-letter-wrapper,
  .intro-reading-modal,
  .intro-reading-card,
  .intro-cta {
    animation: none !important;
    transition: none !important;
  }
}
`;

function getParams() {
  const search = new URLSearchParams(window.location.search);
  const read = (key) => {
    const raw = search.get(key) || "";
    try {
      return decodeURIComponent(raw.replace(/\+/g, " "));
    } catch {
      return raw.replace(/\+/g, " ");
    }
  };
  return new Proxy(
    {},
    {
      get: (_, key) => read(String(key)),
    },
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function bowSvg(className = "intro-bow") {
  return `
    <svg viewBox="0 0 100 60" class="${className}" aria-hidden="true">
      <path d="M45,30 L25,55 L40,55 L50,35 Z" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M55,30 L75,55 L60,55 L50,35 Z" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50,25 C30,5 10,20 25,35 C35,40 45,35 50,25 Z" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50,25 C70,5 90,20 75,35 C65,40 55,35 50,25 Z" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
      <rect x="44" y="20" width="12" height="10" rx="4" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2"/>
    </svg>
  `;
}

function mountEnvelopeIntro() {
  const overlay =
    document.getElementById("landingOverlay") ||
    document.querySelector(".landing-overlay");
  if (!overlay) return;

  const originalMessage = overlay.querySelector(".landing-message-container");
  if (originalMessage) originalMessage.style.display = "none";

  if (!document.getElementById("intro-envelope-style")) {
    const style = document.createElement("style");
    style.id = "intro-envelope-style";
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  const params = getParams();
  const toName = (params.name || params.to || "you").trim();
  const defaultMessage =
    "you've always been by my side.\nI can't imagine doing the next chapter without you.";
  const message = (params.intromessage || params.note || params.message || defaultMessage)
    .replace(/\\n/g, "\n")
    .trim();
  const signature = (params.signature || params.notesignature || "")
    .replace(/\\n/g, "\n")
    .trim();
  const fullMessage = [message, signature].filter(Boolean).join("\n\n");

  overlay.insertAdjacentHTML(
    "beforeend",
    `
    <div class="intro-envelope-stage" id="introEnvelopeStage">
      <div class="intro-envelope-shell">
        <div class="intro-envelope-card" id="introEnvelopeCard" role="button" tabindex="0" aria-label="Open envelope">
          <div class="intro-envelope-front">
            <div class="intro-envelope-front-copy">
              <span class="intro-envelope-to">to:</span>
              <span class="intro-envelope-name" id="introEnvelopeName">${escapeHtml(toName)}</span>
            </div>
          </div>

          <div class="intro-envelope-back">
            <div class="intro-letter-wrapper" id="introLetterWrapper">
              <div class="intro-envelope-letter" id="introEnvelopeLetter">
                ${bowSvg()}
                <p class="intro-letter-message" id="introLetterMessage">${escapeHtml(fullMessage)}</p>
              </div>
            </div>

            <svg class="intro-envelope-pocket" viewBox="0 0 450 300" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0,0 L225,170 L450,0 L450,300 L0,300 Z" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
              <path d="M0,300 L225,170 L450,300" fill="none" stroke="var(--env-outline)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>

            <div class="intro-top-flap" id="introTopFlap">
              <div class="intro-flap-face">
                <svg viewBox="0 0 450 170" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
                  <polygon points="0,0 450,0 225,170" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
                </svg>
                <div class="intro-heart-seal">
                  <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
                    <path d="M50,85 C50,85 10,60 10,30 C10,15 25,5 40,15 C50,25 50,25 50,25 C50,25 50,25 60,15 C75,5 90,15 90,30 C90,60 50,85 50,85 Z" fill="var(--heart-pink)" stroke="var(--env-outline)" stroke-width="3.5" stroke-linejoin="round"/>
                    <path d="M22,30 Q30,12 45,22" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
                  </svg>
                </div>
              </div>
              <div class="intro-flap-face intro-flap-inside">
                <svg viewBox="0 0 450 170" preserveAspectRatio="none" width="100%" height="100%" aria-hidden="true">
                  <polygon points="0,0 450,0 225,170" fill="var(--env-pink)" stroke="var(--env-outline)" stroke-width="2" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button class="intro-cta" id="introCta" type="button">Tap to flip</button>

      <div class="intro-reading-modal" id="introReadingModal">
        <div class="intro-reading-card">
          ${bowSvg("intro-bow")}
          <p class="intro-reading-message" id="introReadingMessage">${escapeHtml(fullMessage)}</p>
          <p class="intro-reading-hint">Tap anywhere to continue</p>
        </div>
      </div>
    </div>
  `,
  );

  const card = document.getElementById("introEnvelopeCard");
  const flap = document.getElementById("introTopFlap");
  const letterWrapper = document.getElementById("introLetterWrapper");
  const letter = document.getElementById("introEnvelopeLetter");
  const cta = document.getElementById("introCta");
  const modal = document.getElementById("introReadingModal");
  let state = 0;

  function updateLetterHeight() {
    if (!letter || !letterWrapper) return;
    const height = Math.max(letter.scrollHeight, letterWrapper.clientHeight);
    letterWrapper.style.setProperty("--letter-height", `${height}px`);
  }

  function dismissIntro() {
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    setTimeout(() => overlay.remove(), 500);
  }

  function openReadingModal() {
    modal.classList.add("is-open");
    state = 3;
  }

  function closeReadingModal() {
    modal.classList.remove("is-open");
    setTimeout(dismissIntro, 360);
  }

  function interact(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (state === 0) {
      card.classList.add("is-flipped");
      cta.textContent = "Tap to open";
      state = 1;
      return;
    }
    if (state === 1) {
      flap.classList.add("is-open");
      cta.style.opacity = "0";
      setTimeout(() => {
        updateLetterHeight();
        letterWrapper.classList.add("is-out");
        setTimeout(() => {
          cta.textContent = "Tap to continue";
          cta.style.opacity = "";
          state = 2;
        }, 520);
      }, 500);
      return;
    }
    if (state === 2) openReadingModal();
  }

  [card, cta].forEach((element) => {
    element.addEventListener("click", interact);
    element.addEventListener(
      "touchstart",
      (event) => {
        event.preventDefault();
        interact(event);
      },
      { passive: false },
    );
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") interact(event);
  });
  modal.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeReadingModal();
  });
  modal.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      closeReadingModal();
    },
    { passive: false },
  );

  const stage = document.getElementById("introEnvelopeStage");
  ["click", "pointerdown", "touchstart"].forEach((eventName) => {
    stage.addEventListener(eventName, (event) => event.stopPropagation(), {
      passive: eventName === "touchstart",
    });
  });

  updateLetterHeight();
  window.addEventListener("resize", updateLetterHeight);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountEnvelopeIntro);
} else {
  mountEnvelopeIntro();
}
