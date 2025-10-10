// Envelope landing animation integration
const DEFAULT_LETTER_COLOR = "#f2e6d0";
const OPEN_DURATION_MS = 2400;
const AUTOCLOSE_OVERLAY = true;

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
}
.env-front,
.env-back {
  position: absolute;
  inset: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: inset 0 0 30px -5px #a87e50, 0 0 20px -5px rgba(0,0,0,.25);
}
.env-front {
  backface-visibility: hidden;
  display: grid;
  place-items: center;
  padding: 16px;
}
.env-mailme {
  text-align: center;
  line-height: 1.15;
  font-weight: 700;
  font-size: clamp(16px, 3.6vw, 28px);
}
.env-back { transform: rotateY(180deg) translateZ(1px); }
.env-letter {
  position: absolute;
  top: 6px; left: 10px; right: 10px; bottom: 6px;
  background: ${DEFAULT_LETTER_COLOR};
  border-radius: 6px;
  padding: 14px;
  box-shadow: inset 0 0 30px -5px #b08c5b, 0 0 10px -5px rgba(0,0,0,.25);
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
.env-flap { position: absolute; inset: 0; overflow: hidden; }
.env-flap::before {
  content: "";
  position: absolute;
  background: #fff;
  box-shadow: inset 0 0 30px -7px #a87e50;
}
.env-flap-top::before, .env-flap-bottom::before { width: 70%; aspect-ratio: 1/1; }
.env-flap-left::before, .env-flap-right::before {
  width: 48%;
  aspect-ratio: 1/1;
  top: -5px;
}
.env-flap-top { z-index: 5; transform-origin: top center; }
.env-flap-top::before {
  transform-origin: top left;
  transform: rotate(-45deg);
  left: 14%;
  top: -30%;
  border-bottom-left-radius: 36px;
}
.env-flap-bottom { z-index: 4; }
.env-flap-bottom::before {
  transform-origin: left bottom;
  transform: rotate(45deg);
  left: 14%;
  bottom: -30%;
  border-top-left-radius: 72px;
}
.env-flap-left { z-index: 3; }
.env-flap-left::before {
  transform-origin: top left;
  transform: rotate(45deg);
  left: -12%;
  top: -5%;
  border-bottom-right-radius: 24px;
}
.env-flap-right { z-index: 2; }
.env-flap-right::before {
  right: -12%;
  top: -5%;
  transform-origin: top right;
  transform: rotate(-45deg);
  border-bottom-left-radius: 24px;
}
@keyframes env-open {
  0% { transform: translate3d(0,0,0) rotateY(0); }
  33% { transform: translate3d(-100%,0,0) rotateY(-180deg); }
  66% { transform: translate3d(-100%,0,0) rotateY(-180deg); }
  100% { transform: translate3d(-100%, 65vh, 0) rotateY(-180deg); }
}
@keyframes flap-open {
  0%, 50% { transform: rotateX(0deg); z-index: 5; }
  100% { transform: rotateX(-180deg); z-index: -1; }
}
@keyframes letter-out {
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(0, -65vh, 0); }
}
.env.is-opening { animation: env-open 2.4s forwards; }
.env.is-opening .env-flap-top { animation: flap-open 0.9s 0.8s forwards; }
.env.is-opening .env-letter { animation: letter-out 0.9s 1.6s forwards; }
.env:active { transform: scale(.98); }
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

  let hasOpened = false;
  function openEnvelope(e) {
    if (hasOpened) return;
    hasOpened = true;
    e.preventDefault();
    e.stopPropagation();
    env.classList.add("is-opening");

    window.setTimeout(() => {
      document.dispatchEvent(new CustomEvent("envelope:opened"));
      if (AUTOCLOSE_OVERLAY) {
        const overlay =
          document.getElementById("landingOverlay") ||
          document.querySelector(".landing-overlay");
        if (overlay) {
          overlay.style.opacity = "0";
          overlay.style.pointerEvents = "none";
          window.setTimeout(() => overlay.remove(), 500);
        }
      } else if (envWrap && envWrap.parentNode) {
        envWrap.parentNode.removeChild(envWrap);
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
        openEnvelope(event);
      }
    },
    { passive: false },
  );
  envWrap.addEventListener(
    "touchstart",
    (event) => {
      if (event.target === envWrap) {
        event.preventDefault();
        openEnvelope(event);
      }
    },
    { passive: false },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountEnvelope);
} else {
  mountEnvelope();
}
