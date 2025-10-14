// note-card.js – simple front/back note that flips, replaces the envelope overlay

const DEFAULT_PAPER = "#f2e6d0";
const DEFAULT_CONTINUE = "Tap to continue";

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap');
.note-wrap{
  position:absolute; inset:0; display:grid; place-items:center;
  z-index:1001; perspective:1000px;
}
.note{
  width:min(86vw,360px); aspect-ratio:3/2; position:relative;
  transform-style:preserve-3d; cursor:pointer;
}
.note-pane{
  position:absolute; inset:0; border-radius:14px;
  background: var(--paper, ${DEFAULT_PAPER});
  box-shadow: 0 10px 28px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06);
  backface-visibility:hidden;
  border:1.5px solid #a37b4c;
}
.note-front, .note-back{ display:flex; align-items:center; justify-content:center; padding:18px; }
.note-front{
  font: italic 600 clamp(28px,5vw,36px)/1.1 "Tangerine", cursive;
  color:#1f1f1f;
}
.note-front span{
  padding:0;
  border-radius:0;
  background:none;
}
.note-back{
  transform:rotateY(180deg);
  flex-direction:column; text-align:left; color:#1f1f1f;
  font-family:"Courier New", monospace;
}
.note-title{ margin:0 0 .4em 0; font-weight:800; font-size:clamp(18px,4vw,24px); }
.note-body{ margin:0; white-space:pre-wrap; font-size:clamp(16px,3.6vw,20px); line-height:1.25; }

.note-body.typewriter {
  overflow: hidden;
  white-space: pre-wrap;
  width: 100%;
  animation: fadeIn .2s ease-in forwards;
}

@keyframes blink {
  from, to { border-color: transparent; }
  50% { border-color: rgba(0,0,0,0.6); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* @keyframes typing {
  from { width: 0; }
  to { width: 100%; }
} */

.note.is-flipped{ transform:rotateY(180deg); transition:transform .6s cubic-bezier(.22,.61,.36,1); }
.note:not(.is-flipped){ transition:transform .6s cubic-bezier(.22,.61,.36,1); }

.note-continue{
  position:absolute; bottom:clamp(28px,9vh,72px); left:50%; transform:translateX(-50%);
  padding:.85rem 2.2rem; border-radius:999px; border:none;
  background:#1f1f1f; color:#fff; font:600 16px "Courier New", monospace;
  letter-spacing:.02em; box-shadow:0 10px 24px rgba(0,0,0,.22);
  opacity:0; pointer-events:none; transition:opacity .28s, transform .28s; transform:translate(-50%,8px);
}
.note-continue.is-visible{ opacity:1; pointer-events:auto; transform:translate(-50%,0); }

@media (prefers-reduced-motion: reduce){
  .note, .note-continue{ transition:none !important; }
}
`;

function params() {
  const p = new URLSearchParams(location.search);
  const g = k => (p.get(k) || "").replace(/\+/g," ");
  const safe = v => { try { return decodeURIComponent(v); } catch { return v; } };
  return new Proxy({}, { get:(_,k)=> safe(g(k)) });
}

function mountNote() {
  const overlay = document.getElementById("landingOverlay") || document.querySelector(".landing-overlay");
  if (!overlay) return;

  // hide original landing text
  const msg = overlay.querySelector(".landing-message-container");
  if (msg) msg.style.display = "none";

  // styles
  if (!document.getElementById("note-style")) {
    const s = document.createElement("style");
    s.id = "note-style"; s.textContent = STYLE; document.head.appendChild(s);
  }

  const p = params();
  const toName = (p.to || p.name || "").trim();
  const frontText = toName ? `To ${toName}` : "To you";
  const title = (p.title || `${toName ? toName + "," : "My friend,"}`).trim();
  const body = (p.body || "you've always been by my side.\nI can't imagine doing the next chapter without you.").replace(/\\n/g,"\n");
  const paper = (p.paper && /^#([0-9A-F]{3}){1,2}$/i.test(p.paper)) ? p.paper : DEFAULT_PAPER;
  const continueLabel = (p.continueprompt || "Tap to continue").trim() || DEFAULT_CONTINUE;

  overlay.insertAdjacentHTML("beforeend", `
    <div class="note-wrap" id="noteWrap" style="--paper:${paper}">
      <div class="note" id="note">
        <div class="note-pane note-front"><span>${frontText}</span></div>
        <div class="note-pane note-back">
          <h3 class="note-title">${title}</h3>
          <p class="note-body">${body}</p>
        </div>
      </div>
      <button class="note-continue" id="noteContinue" type="button">${continueLabel}</button>
    </div>
  `);

  const note = document.getElementById("note");
  const cont = document.getElementById("noteContinue");

  const bodyEl = document.querySelector('.note-body');
  const fullText = bodyEl.textContent.trim();
  bodyEl.textContent = '';
  bodyEl.classList.add('typewriter');

  const chars = [...fullText];
  let i = 0;
  function typeNext(){
    if (i < chars.length){
      bodyEl.textContent += chars[i];
      const ch = chars[i];
      i++;
      let delay = 45;
      if(/[.,!?]/.test(ch)) delay = 300;
      else if(/[\n]/.test(ch)) delay = 400;
      setTimeout(typeNext, delay);
    }
  }
  // Start typing when back of note is shown
  note.addEventListener('transitionend', () => {
    if(note.classList.contains('is-flipped')){
      bodyEl.textContent = '';
      i = 0;
      typeNext();
    }
  });

  const wrap = document.getElementById("noteWrap");
  if (wrap) {
    wrap.addEventListener("click", (e) => e.stopPropagation());
    wrap.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    wrap.addEventListener("pointerdown", (e) => e.stopPropagation());
  }

  // flip on click/tap/Enter/Space (cancel bubbling so overlay doesn't dismiss)
  const flip = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    note.classList.toggle("is-flipped");
  };
  note.addEventListener("click", flip);
  note.addEventListener("touchstart", (e) => { e.preventDefault(); e.stopPropagation(); flip(e); }, { passive: false });
  note.addEventListener("pointerdown", (e) => { e.stopPropagation(); });
  note.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(e); }
  });
  note.tabIndex = 0;
  note.setAttribute("role","button");
  note.setAttribute("aria-label","Flip note");

  // after first flip to back, show continue
  let shown = false;
  note.addEventListener("transitionend", () => {
    const onBack = note.classList.contains("is-flipped");
    if (onBack && !shown) {
      shown = true;
      cont.classList.add("is-visible");
      cont.focus?.();
    }
  });

  // continue → remove overlay
  cont.addEventListener("click", (e) => {
    e.stopPropagation();
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
    setTimeout(() => overlay.remove(), 420);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountNote);
} else {
  mountNote();
}
