// note-card.js – complete replacement

// ---------------- Config ----------------
const DEFAULT_PAPER = "#f2e6d0";
const DEFAULT_CONTINUE = "Tap to continue";

// ---------------- Styles ----------------
const STYLE = `
@font-face {
  font-family: 'Boho';
  src: url('Boho.otf') format('opentype');
  font-display: swap;
}

.note-wrap{ position:absolute; inset:0; display:grid; place-items:center; z-index:1001; perspective:1000px; }
.note{ width:min(86vw,360px); aspect-ratio:3/2; position:relative; transform-style:preserve-3d; cursor:pointer; }
.note-pane{ position:absolute; inset:0; border-radius:14px; background: var(--paper, ${DEFAULT_PAPER}); box-shadow: 0 10px 28px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06); backface-visibility:hidden; border:1.5px solid #a37b4c; }

/* FRONT */
.note-front, .note-back{ display:flex; align-items:center; justify-content:center; padding:18px; }
.note-front{ font-family:'Boho', cursive; font-weight:700; font-size: clamp(42px,7vw,64px); line-height:1.1; color:#1f1f1f; letter-spacing:.02em; text-align:center; }
.note-front span{ padding:0; border-radius:0; background:none; display:inline-block; will-change:contents; opacity:1; max-width:92%; white-space:normal; word-break:break-word; hyphens:auto; text-align:center; }

/* BACK */
.note-back{ transform:rotateY(180deg); flex-direction:column; text-align:center; color:#1f1f1f; font-family:"Courier New", monospace; justify-content:center; align-items:center; }
.note-body{ margin:0; white-space:pre-wrap; font-size:clamp(16px,3.6vw,20px); line-height:1.25; text-align:center; }
.note-body.typewriter{ overflow:hidden; white-space:pre-wrap; width:100%; animation: fadeIn .2s ease-in forwards; }

/* Flip */
.note.is-flipped{ transform:rotateY(180deg); transition:transform .6s cubic-bezier(.22,.61,.36,1); }
.note:not(.is-flipped){ transition:transform .6s cubic-bezier(.22,.61,.36,1); }

/* Continue (text only) */
.note-continue{ position:absolute; bottom:clamp(28px,9vh,72px); left:50%; transform:translateX(-50%); background:none; border:none; box-shadow:none; padding:0; color:#fff; font:600 18px "Courier New", monospace; letter-spacing:.05em; text-shadow:0 0 6px rgba(0,0,0,.4); opacity:0; pointer-events:none; transition:opacity .28s, transform .28s; transform:translate(-50%,8px); }
.note-continue.is-visible{ opacity:1; pointer-events:auto; transform:translate(-50%,0); animation:pulseText 1.6s ease-in-out infinite; }

@keyframes pulseText { 0%,100%{opacity:.85} 50%{opacity:.35} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }

@media (prefers-reduced-motion: reduce){ .note, .note-continue{ transition:none !important; animation:none !important; } }
`;

// ---------------- Utils ----------------
function params() {
  const p = new URLSearchParams(location.search);
  const g = k => (p.get(k) || "").replace(/\+/g, " ");
  const safe = v => { try { return decodeURIComponent(v); } catch { return v; } };
  return new Proxy({}, { get:(_,k)=> safe(g(k)) });
}

// ---------------- Mount ----------------
function mountNote() {
  const overlay = document.getElementById("landingOverlay") || document.querySelector(".landing-overlay");
  if (!overlay) return;

  // hide original landing text
  const msg = overlay.querySelector(".landing-message-container");
  if (msg) msg.style.display = "none";

  // inject styles
  if (!document.getElementById("note-style")) {
    const s = document.createElement("style"); s.id = "note-style"; s.textContent = STYLE; document.head.appendChild(s);
  }

  const p = params();
  const toName = (p.to || p.name || "").trim();
  const frontText = toName ? `To ${toName}` : "To you";

  // Greeting handling (optional). If body already starts with greeting, don't duplicate.
  let greeting = "";
  if (p.title) greeting = p.title; else if (toName) greeting = toName;
  let bodyText = p.body || "you've always been by my side.\nI can't imagine doing the next chapter without you.";
  if (greeting && bodyText.trim().startsWith(greeting)) greeting = "";
  const body = ((greeting ? greeting + ",\n\n" : "") + bodyText).replace(/\\n/g, "\n");

  const paper = (p.paper && /^#([0-9A-F]{3}){1,2}$/i.test(p.paper)) ? p.paper : DEFAULT_PAPER;
  const continueLabel = (p.continueprompt || DEFAULT_CONTINUE).trim() || DEFAULT_CONTINUE;

  overlay.insertAdjacentHTML("beforeend", `
    <div class="note-wrap" id="noteWrap" style="--paper:${paper}">
      <div class="note" id="note">
        <div class="note-pane note-front"><span>${frontText}</span></div>
        <div class="note-pane note-back">
          <p class="note-body">${body}</p>
        </div>
      </div>
      <button class="note-continue" id="noteContinue" type="button">${continueLabel}</button>
    </div>
  `);

  const note = document.getElementById("note");
  const cont = document.getElementById("noteContinue");
  const wrap = document.getElementById("noteWrap");

  // Allow continue anywhere after typing completes
  let allowContinue = false;
  function dismiss(e){
    if (e) e.stopPropagation();
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(()=> overlay.remove(), 420);
  }
  function tryDismiss(e){
    if (!allowContinue) return; // ignore until typing+delay are done
    dismiss(e);
  }

  // ----- Front text type-in + auto-fit -----
  const frontSpan = overlay.querySelector('.note-front span');
  if (frontSpan) {
    const fullFront = frontSpan.textContent.trim();
    frontSpan.textContent = '';
    const fchars = [...fullFront];
    let fi = 0;
    let typeFront = function(){
      if (fi < fchars.length){
        frontSpan.textContent += fchars[fi];
        const ch = fchars[fi];
        fi++;
        let d = 70; if (ch === ' ') d = 90; if (/[.,!?]/.test(ch)) d = 220;
        setTimeout(typeFront, d);
      }
    };

    const frontBox = overlay.querySelector('.note-front');
    function fitFront(){
      if (!frontSpan || !frontBox) return;
      const maxPx = 64; const minPx = 18; let size = maxPx;
      frontSpan.style.fontSize = size + 'px';
      const cs = window.getComputedStyle(frontBox);
      const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
      const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const availW = (frontBox.clientWidth - padX) * 0.92;
      const availH = frontBox.clientHeight - padY;
      let guard = 48;
      while ((frontSpan.scrollWidth > availW || frontSpan.scrollHeight > availH) && size > minPx && guard-- > 0){
        size -= 2; frontSpan.style.fontSize = size + 'px';
        frontSpan.style.lineHeight = (size < 40) ? '1.05' : '1.1';
        frontSpan.style.letterSpacing = (size < 36) ? '0.01em' : '0.02em';
      }
    }
    let fitScheduled = false;
    const scheduleFit = () => { if (fitScheduled) return; fitScheduled = true; requestAnimationFrame(() => { fitScheduled = false; fitFront(); }); };
    const oldTypeFront = typeFront; typeFront = function(){ oldTypeFront(); scheduleFit(); };
    fitFront();
    window.addEventListener('resize', fitFront);
    setTimeout(typeFront, 180);
  }

  // ----- Flip handling & prevent overlay dismissal -----
  const flip = (e) => { if (e){ e.preventDefault(); e.stopPropagation(); } note.classList.toggle('is-flipped'); };
  note.addEventListener('click', flip);
  note.addEventListener('touchstart', (e)=>{ e.preventDefault(); e.stopPropagation(); flip(e); }, { passive:false });
  note.addEventListener('pointerdown', (e)=> e.stopPropagation());
  note.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); flip(e); } });
  note.tabIndex = 0; note.setAttribute('role','button'); note.setAttribute('aria-label','Flip note');
  if (wrap){ wrap.addEventListener('click', (e)=> e.stopPropagation()); wrap.addEventListener('touchstart', (e)=> e.stopPropagation(), { passive:true }); wrap.addEventListener('pointerdown', (e)=> e.stopPropagation()); }

  // Once allowed, clicking/tapping anywhere (overlay or outside note) continues
  overlay.addEventListener('click', tryDismiss);
  overlay.addEventListener('touchstart', (e)=> { if (allowContinue) { e.preventDefault(); tryDismiss(e); } }, { passive:false });
  document.addEventListener('keydown', (e)=> { if (allowContinue && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tryDismiss(e); } });

  // ----- Back typewriter -----
  const bodyEl = document.querySelector('.note-body');
  const fullText = bodyEl.textContent.trim();
  bodyEl.textContent = '';
  bodyEl.classList.add('typewriter');
  const chars = [...fullText];
  let i = 0; let typingStarted = false; let typingDone = false;
  function typeNext(){
    if (i < chars.length){
      bodyEl.textContent += chars[i];
      const ch = chars[i]; i++;
      let delay = 65; if(/[.,!?]/.test(ch)) delay = 380; else if(/[\n]/.test(ch)) delay = 500;
      setTimeout(typeNext, delay);
    } else {
      typingDone = true;
      setTimeout(() => {
        allowContinue = true; // enable anywhere-to-continue
        cont.classList.add('is-visible');
      }, 1000);
    }
  }
  // Start typing when flipped to back (only once)
  note.addEventListener('transitionend', () => { if (note.classList.contains('is-flipped') && !typingStarted) { typingStarted = true; bodyEl.textContent=''; i=0; typeNext(); } });

  // Continue button dismiss
  cont.addEventListener('click', tryDismiss);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountNote); else mountNote();
