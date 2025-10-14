// Envelope landing animation integration
const DEFAULT_LETTER_COLOR = "#f2e6d0";
const OPEN_DURATION_MS = 2000;
const AUTOCLOSE_OVERLAY = false;
const DEFAULT_CONTINUE_PROMPT = "Tap to continue";

function getParams() {
  const url = new URL(window.location.href);
  const params = {};
  for (const [k, v] of url.searchParams.entries()) {
    const key = k.toLowerCase();
    const value = v.replace(/\+/g, " ");
    params[key] = value;
    if (key !== k) params[k] = value;
  }
  return params;
}

const isValidHex = (str) => /^#([0-9A-F]{3}){1,2}$/i.test(str);

function sanitizeColor(value, fallback) {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (isValidHex(trimmed)) return trimmed;
  const test = new Option().style;
  test.color = trimmed;
  return test.color ? trimmed : fallback;
}

function htmlToEl(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function safeDecode(value) {
  if (!value) return value;
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

const STYLE = `
.env-wrap {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 1001;
  perspective: 800px;
}
.env {
  position: relative;
  width: min(86vw, 360px);
  aspect-ratio: 550/366.6667;
  transform-style: preserve-3d;
  transform-origin: right center;
  font-family: "Courier New", monospace;
  color: #1f1f1f;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(120, 85, 50, 0.4), 0 0 15px rgba(150, 100, 60, 0.3);
  /* visual tokens (flat by default) */
  --env-panel-shadow: none;           /* no elevation */
  --env-letter-shadow: none;          /* no inset shading */
  --env-flap-shadow: none;            /* no flap shading */
  --env-border: none;                 /* remove keyline by default */
  --env-panel-bg: #fffaf3;            /* soft cream to mesh with peach bg */
  --env-letter-bg: ${DEFAULT_LETTER_COLOR}; /* parchment */
}
.env-front,
.env-back {
  position: absolute;
  inset: 0;
  background: var(--env-panel-bg); 
  border-radius: 8px;
  box-shadow: var(--env-panel-shadow);
  border: 1.5px solid #a37b4c;
}
.env-front {
  backface-visibility: hidden;
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 2;
  transition: opacity 0.2s ease;
}
.env-mailme {
  text-align: center;
  line-height: 1.15;
  font-weight: 700;
  font-size: clamp(16px, 3.6vw, 28px);
}
.env-back { transform: none; z-index: 1; }
.env-letter {
  position: absolute;
  top: 6px; left: 10px; right: 10px; bottom: 6px;
  background: var(--env-letter-bg);
  border-radius: 6px;
  padding: 14px;
  box-shadow: var(--env-letter-shadow);
  overflow: hidden;
}
.env-letter-title {
  margin: 0 0 8px;
  font-weight: 800;
  font-size: clamp(16px, 3.6vw, 22px);
}
.env-letter-body {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.15;
  font-size: clamp(14px, 3.2vw, 18px);
}
.env-flap { position: absolute; inset: 0; overflow: hidden; backface-visibility: hidden; }
.env-flap-top    { transform-origin: top center; }
.env-flap-bottom { transform-origin: bottom center; }
.env-flap-left   { transform-origin: left center; }
.env-flap-right  { transform-origin: right center; }
.env-flap-top, .env-flap-bottom, .env-flap-left, .env-flap-right { transform: none; }

/* New flap geometry using clip-path so edges meet cleanly */
.env-flap { background: var(--env-panel-bg); }

/* Z stacking matches previous intent */
.env-flap-top    { z-index: 5; }
.env-flap-bottom { z-index: 4; }
.env-flap-left   { z-index: 3; }
.env-flap-right  { z-index: 2; }

/* Triangular flaps; left/right use slight 48/52% overlap so they meet */
.env-flap-top    { clip-path: polygon(50% 0%, 100% 58%, 0% 58%); }
.env-flap-bottom { clip-path: polygon(0% 42%, 100% 42%, 50% 100%); }
.env-flap-left   { clip-path: polygon(0% 50%, 52% 0%, 52% 100%); }
.env-flap-right  { clip-path: polygon(48% 0%, 100% 50%, 48% 100%); }

@keyframes flap-top-open {
  0%   { transform: rotateX(0deg);   z-index: 5; }
  100% { transform: rotateX(-180deg); z-index: -1; }
}
@keyframes flap-left-open {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(-180deg); }
}
@keyframes flap-right-open {
  0%   { transform: rotateY(0deg); }
  100% { transform: rotateY(180deg); }
}
@keyframes paper-out {
  0%   { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(0, 115%, 0); }
}
@keyframes env-dismiss {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-12px) scale(0.98); }
}
.env.is-dismissing { animation: env-dismiss 320ms ease forwards; }

/* Staged unfold: top flap → paper → side flaps */
.env.is-opening { /* container stays put; stagger children */ }
.env.is-opening .env-front { opacity: 0; }
.env.is-opening .env-flap-top  { animation: flap-top-open 0.7s ease-out 0s forwards; }
.env.is-opening .env-letter    { animation: paper-out     0.9s ease-out 0.55s forwards; }
.env.is-opening .env-flap-left { animation: flap-left-open 0.7s ease-out 1.2s forwards; }
.env.is-opening .env-flap-right{ animation: flap-right-open 0.7s ease-out 1.2s forwards; }
.env:active { transform: scale(.98); }
.env-continue {
  position: absolute;
  bottom: clamp(32px, 9vh, 72px);
  left: 50%;
  transform: translate(-50%, 12px);
  padding: 0.85rem 2.4rem;
  border-radius: 999px;
  border: none;
  font-family: "Courier New", monospace;
  font-weight: 600;
  font-size: clamp(15px, 3.4vw, 20px);
  letter-spacing: 0.02em;
  color: #fff;
  background: #1f1f1f;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.env-continue.is-visible {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
}
.env-continue:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.9);
  outline-offset: 4px;
}
.env-continue:active {
  transform: translate(-50%, 2px);
}

/* Variants */
.env--flat {
  --env-panel-shadow: none;
  --env-letter-shadow: none;
  --env-flap-shadow: none;
  --env-border: none;
  --env-panel-bg: #fffaf3;
  --env-letter-bg: ${DEFAULT_LETTER_COLOR};
}
.env--soft {
  --env-panel-shadow: 0 6px 16px rgba(0,0,0,.12);
  --env-letter-shadow: inset 0 0 8px -2px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08);
  --env-flap-shadow: inset 0 0 12px -4px rgba(0,0,0,.18);
  --env-border: 1px solid rgba(0,0,0,0.08);
}
.env--elevated {
  --env-panel-shadow: inset 0 0 30px -5px #a87e50, 0 0 20px -5px rgba(0,0,0,.25);
  --env-letter-shadow: inset 0 0 30px -5px #b08c5b, 0 0 10px -5px rgba(0,0,0,.25);
  --env-flap-shadow: inset 0 0 30px -7px #a87e50;
  --env-border: 1px solid rgba(0,0,0,0.10);
}
`;

const MARKUP = `
<div class="env-wrap" id="envWrap">
  <div class="env" id="env">
    <div class="env-front">
      <div class="env-mailme" id="envMailme"></div>
    </div>
    <div class="env-back">
      <div class="env-letter" id="envLetter">
        <h3 class="env-letter-title" id="letterTitle"></h3>
        <p class="env-letter-body" id="letterBody"></p>
      </div>
      <div class="env-flap env-flap-left"></div>
      <div class="env-flap env-flap-right"></div>
      <div class="env-flap env-flap-bottom"></div>
      <div class="env-flap env-flap-top"></div>
    </div>
  </div>
  <button class="env-continue" id="envContinue" type="button"></button>
</div>
`;

function mountEnvelope() {
  if (!document.getElementById("landingOverlay")) return;

  if (!document.getElementById("env-style")) {
    const style = document.createElement("style");
    style.id = "env-style";
    style.textContent = STYLE;
    document.head.appendChild(style);
  }

  const mount =
    document.getElementById("landingOverlay") ||
    document.querySelector(".landing-overlay") ||
    document.body;

  const node = htmlToEl(MARKUP);
  mount.appendChild(node);

  const messageContainer = mount.querySelector(".landing-message-container");
  if (messageContainer) {
    messageContainer.style.display = "none";
  }

  const params = getParams();

  const defaultLanding = "Tap to spin and reveal your surprise!";
  const rawFrontText =
    safeDecode(params.envelopefront) ||
    safeDecode(params.landingmessage) ||
    safeDecode(params.landingtext);
  const frontText = rawFrontText && rawFrontText.trim()
    ? rawFrontText.trim()
    : defaultLanding;

  const rawLetterTitle = safeDecode(params.lettertitle);
  const letterTitle = rawLetterTitle && rawLetterTitle.trim()
    ? rawLetterTitle.trim()
    : "Alex,";

  const rawLetterBody = safeDecode(params.letterbody);
  const letterBody =
    (rawLetterBody && rawLetterBody.replace(/\\n/g, "\n")) ||
    "you've always been by my side.\nI can't imagine doing the next chapter without you.";

  const letterColor = sanitizeColor(params.lettercolor, DEFAULT_LETTER_COLOR);

  const env = node.querySelector("#env");
  const envWrap = node.querySelector("#envWrap");
  const envMailme = node.querySelector("#envMailme");
  const letterTitleEl = node.querySelector("#letterTitle");
  const letterBodyEl = node.querySelector("#letterBody");
  const envLetter = node.querySelector("#envLetter");
  const continueButton = node.querySelector("#envContinue");

  env.setAttribute("role", "button");
  env.setAttribute("tabindex", "0");
  env.setAttribute(
    "aria-label",
    frontText ? `Open envelope: ${frontText}` : "Open envelope",
  );

  if (envMailme) envMailme.textContent = frontText;
  if (letterTitleEl) letterTitleEl.textContent = letterTitle;
  if (letterBodyEl) letterBodyEl.textContent = letterBody;
  if (envLetter) envLetter.style.background = letterColor;

  // Apply visual variant (flat|soft|elevated). Accepts `envelopestyle` or `envelopeshadow`.
  const styleParam = (params.envelopestyle || params.envelopeshadow || "").toLowerCase();
  let variantClass = "";
  if (styleParam.includes("elev")) variantClass = "env--elevated";
  else if (styleParam.includes("soft")) variantClass = "env--soft";
  else if (styleParam.includes("flat") || styleParam === "none") variantClass = "env--flat";
  // Default is flat via CSS variables; explicitly add class if requested
  if (env && variantClass) env.classList.add(variantClass);

  if (continueButton) {
    const rawContinuePrompt =
      safeDecode(params.continueprompt) || safeDecode(params.continuetext);
    const continuePrompt = rawContinuePrompt && rawContinuePrompt.trim()
      ? rawContinuePrompt.trim()
      : DEFAULT_CONTINUE_PROMPT;
    continueButton.textContent = continuePrompt;
    continueButton.setAttribute("aria-label", continuePrompt);
    continueButton.setAttribute("hidden", "");
    continueButton.disabled = true;
  }

  let hasOpened = false;
  let canDismiss = false;
  let hasDismissed = false;

  function dismissOverlay() {
    if (hasDismissed) return;
    hasDismissed = true;
    canDismiss = false;
    // Play a quick fade/slide on the envelope before removing overlay
    if (env && env.classList) {
      env.classList.add("is-dismissing");
    }
    if (continueButton) {
      continueButton.disabled = true;
      continueButton.classList.remove("is-visible");
    }
    const overlay =
      document.getElementById("landingOverlay") ||
      document.querySelector(".landing-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.pointerEvents = "none";
      window.setTimeout(() => overlay.remove(), 500);
    } else if (envWrap && envWrap.parentNode) {
      envWrap.parentNode.removeChild(envWrap);
    }
  }

  function showContinuePrompt() {
    if (!continueButton) {
      dismissOverlay();
      return;
    }
    canDismiss = true;
    continueButton.disabled = false;
    continueButton.removeAttribute("hidden");
    window.requestAnimationFrame(() => {
      continueButton.classList.add("is-visible");
      window.setTimeout(() => {
        if (continueButton.isConnected) {
          try {
            continueButton.focus({ preventScroll: true });
          } catch (error) {
            continueButton.focus();
          }
        }
      }, 150);
    });
  }

  function openEnvelope(e) {
    if (hasOpened) return;
    hasOpened = true;
    e.preventDefault();
    e.stopPropagation();
    env.classList.add("is-opening");

    window.setTimeout(() => {
      document.dispatchEvent(new CustomEvent("envelope:opened"));
      if (AUTOCLOSE_OVERLAY) {
        dismissOverlay();
      } else {
        showContinuePrompt();
      }
    }, OPEN_DURATION_MS);
  }

  env.addEventListener("click", openEnvelope, { passive: false });
  env.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      openEnvelope(e);
    },
    { passive: false },
  );

  env.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openEnvelope(event);
    }
  });

  envWrap.addEventListener(
    "click",
    (event) => {
      if (event.target === envWrap) {
        if (!hasOpened) {
          openEnvelope(event);
        } else if (canDismiss) {
          dismissOverlay();
        }
      }
    },
    { passive: false },
  );
  envWrap.addEventListener(
    "touchstart",
    (event) => {
      if (event.target === envWrap) {
        event.preventDefault();
        if (!hasOpened) {
          openEnvelope(event);
        } else if (canDismiss) {
          dismissOverlay();
        }
      }
    },
    { passive: false },
  );

  if (continueButton) {
    continueButton.addEventListener("click", (event) => {
      event.preventDefault();
      dismissOverlay();
    });
    continueButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        dismissOverlay();
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountEnvelope);
} else {
  mountEnvelope();
}
