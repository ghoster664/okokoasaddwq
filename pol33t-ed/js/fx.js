(() => {
const $ = (t, c, h) => { const e = document.createElement(t); e.className = c || ""; e.innerHTML = h || ""; document.body.appendChild(e); return e; };
const R = (a, b) => a + Math.random() * (b - a), P = a => a[Math.floor(Math.random() * a.length)];
const EM = ["🔥","💪","⚡","💥","🦍","🏋️","💯","🤑","🚀","⭐","👑","🦾","💰","🎰","💎","🚨","👊","🦁","🧨","🌋"];
const WORDS = ["BOOM!","WOW!","MEGA!","ALPHA!","HOT!","BUY!","SIGMA!","GIGA!","POWER!","CRAZY!","LEGEND!","ULTRA!","-99%!","NOW!!!","JACKPOT!","RAGE!"];
let calm = matchMedia("(prefers-reduced-motion: reduce)").matches, mute = false, ac, out, lastS = 0, lastF = 0;
document.body.classList.toggle("calm", calm);

// ---------- SOUND (loud-ish, but capped by a compressor + master volume) ----------
function dest() {
  if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); const c = ac.createDynamicsCompressor(), m = ac.createGain(); m.gain.value = .5; c.connect(m); m.connect(ac.destination); out = c; }
  if (ac.state == "suspended") ac.resume();
}
function tone(type, f1, f2, d, v, delay = 0) {
  const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + d);
}
function noise(d, v) {
  const n = ac.sampleRate * d | 0, b = ac.createBuffer(1, n, ac.sampleRate), a = b.getChannelData(0);
  for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1;
  const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = b;
  g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d);
  s.connect(g); g.connect(out); s.start();
}
const SND = [
  () => { tone("sawtooth", 440, 420, .5, .12); tone("sawtooth", 554, 530, .5, .12); },
  () => tone("square", 2000, 80, .25, .12),
  () => { tone("sine", 160, 30, .45, .35); noise(.2, .15); },
  () => tone("sawtooth", 500, 1500, .35, .1),
  () => { tone("square", 988, 988, .08, .1); tone("square", 1319, 1319, .25, .1, .08); },
  () => { for (let i = 0; i < 6; i++) tone("square", R(100, 2500), R(100, 2500), .05, .08, i * .05); },
  () => noise(.3, .12)
];
function beep(n = 1) {
  if (mute || calm) return;
  const t = Date.now(); if (t - lastS < 70) return; lastS = t;
  try { dest(); for (let i = 0; i < n; i++) P(SND)(); } catch (e) {}
}

// ---------- VISUALS ----------
function spawn(txt, x, y, cls, vars) {
  if (calm || document.querySelectorAll(".fx").length > 300) return;
  const e = $("span", "fx " + cls, txt);
  e.style.left = x + "px"; e.style.top = y + "px";
  for (const k in vars) e.style.setProperty(k, vars[k]);
  e.addEventListener("animationend", () => e.remove());
}
function burst(x, y, n) {
  for (let i = 0; i < n; i++) { const a = R(0, 6.28), d = R(80, 420);
    spawn(P(EM), x, y, "burst", { "--dx": Math.cos(a) * d + "px", "--dy": Math.sin(a) * d + "px", "--r": R(-900, 900) + "deg" }); }
}
const word = (x, y) => spawn(P(WORDS), x, y, "word", { "--c": `hsl(${R(0,360)},100%,60%)`, "--r": R(-25, 25) + "deg" });
const ring = (x, y) => spawn("", x, y, "ring", {});
function shake() { if (calm) return; const b = document.body; b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); }
// full-screen flash: limited to 3 per second max, soft fade, no red tones
const fl = $("div", "flash");
function flash(giant) {
  if (calm) return;
  const n = Date.now(); if (n - lastF < 340) return; lastF = n;
  fl.style.background = `hsl(${R(30, 330)},100%,60%)`;
  fl.classList.remove("on"); void fl.offsetWidth; fl.classList.add("on");
  if (giant) spawn(P(WORDS), innerWidth / 2, innerHeight / 2, "giant", { "--c": `hsl(${R(30,330)},100%,60%)` });
}

// ---------- INPUT EFFECTS ----------
addEventListener("pointerdown", e => {
  const big = e.target.closest(".btn,.card,a");
  burst(e.clientX, e.clientY, big ? 110 : 45); word(e.clientX, e.clientY); word(e.clientX + R(-80, 80), e.clientY + R(-40, 40));
  ring(e.clientX, e.clientY); setTimeout(() => ring(e.clientX, e.clientY), 120);
  shake(); flash(!!e.target.closest(".btn")); beep(big ? 3 : 2);
  navigator.vibrate && navigator.vibrate([60, 30, 60]);
});
let lt = 0;
addEventListener("pointermove", e => { const n = Date.now(); if (n - lt < 20) return; lt = n; spawn(P(EM), e.clientX, e.clientY, "trail", { "--r": R(-90, 90) + "deg" }); spawn(P(EM), e.clientX, e.clientY, "trail", { "--r": R(-90, 90) + "deg" }); });
addEventListener("keydown", () => {
  const a = document.activeElement, r = a.getBoundingClientRect();
  const inp = (a.tagName == "INPUT" || a.tagName == "TEXTAREA") && r.width;
  const x = inp ? r.left + R(0, r.width) : R(50, innerWidth - 50), y = inp ? r.top : R(50, innerHeight - 50);
  burst(x, y, 30); word(x, y); beep(2); shake(); flash();
});

// ---------- "BREATHING": constant chaos even when idle ----------
const rx = () => R(40, innerWidth - 40), ry = () => R(40, innerHeight - 40);
setInterval(() => { if (!calm) burst(rx(), ry(), 25); }, 250);
setInterval(() => { if (!calm) { word(rx(), ry()); beep(2); } }, 500);
setInterval(() => { if (!calm) { flash(Math.random() < .5); shake(); } }, 1000);
setInterval(() => spawn(P(EM), R(0, innerWidth), innerHeight, "rise", { "--s": R(30, 120) + "px" }), 70);
setInterval(() => spawn(P(["-99%","SALE!","NEW!","HOT!","🔥🔥🔥","LOL","FREE!"]), -80, R(120, innerHeight - 80), "fly", {}), 900);

// ---------- BANNERS, COUNTERS, TOASTS ----------
const msg = "🔥 MEGA FLASH SALE 99% OFF 🔥 FREE SHIPPING TO THE MOON 🚀 ENDS IN <b class='tm'></b> 💥 BUY 1 GET 1 GET 1 FREE 💪 ";
const bar = $("div", "", `<div class="mq">${msg.repeat(4)}</div>`); bar.id = "bar"; document.body.prepend(bar);
const bar2 = $("div", "", `<div class="mq">${msg.repeat(4)}</div>`); bar2.id = "bar2";
let t = R(600, 3600) | 0;
setInterval(() => {
  if (--t < 0) t = R(600, 3600) | 0;
  const s = [t / 3600 | 0, t / 60 % 60 | 0, t % 60].map(v => String(v).padStart(2, "0")).join(":");
  document.querySelectorAll(".tm").forEach(e => e.textContent = s);
}, 1000);
const v = $("div", "badge", "");
setInterval(() => v.textContent = `👀 ${R(1000, 9999) | 0} gorillas watching · 🛒 ${R(100, 999) | 0} in carts`, 300);
const N = ["Dmitri","Olek","Chad","Brock","Maks","Viktor","Thor","Gigachad","Ivan"], C = ["Kyiv","Lviv","Odesa","Berlin","Texas","Warsaw","Mars","The Gym"];
setInterval(() => {
  if (calm) return;
  const el = $("div", "toast", `${P(N)} from ${P(C)} just bought <b>${typeof PRODUCTS != "undefined" ? P(PRODUCTS).name : "stuff"}</b> 🔥`);
  el.style.bottom = R(100, innerHeight * .6) + "px"; beep();
  setTimeout(() => el.remove(), 2500);
}, 800);

// ---------- POPUPS (up to 7 at once; closing one can spawn more) ----------
const POP = [["🎁 YOU WON!!!","FREE SPIN + 1000 GIGA-POINTS","CLAIM NOW"],["⚡ FLASH DEAL","-99% NEXT 30 SECONDS ONLY","GRAB IT"],["🔥 ONLY 1 LEFT","47 gorillas are looking at this","BUY BEFORE THEM"],["💰 FREE MONEY","Spin the wheel of destiny","SPIN"],["🦍 ALPHA ALERT","You are the 1,000,000th visitor","COLLECT"],["📣 DON'T LEAVE","Take 200% OFF with code SIGMA","TAKE IT"],["🚚 FREE SHIPPING","To Mars, the Moon and Poland","YES!!"],["🎰 JACKPOT","7️⃣7️⃣7️⃣ You hit it again","CASH OUT"]];
function modal() {
  if (calm || document.querySelectorAll(".modal").length >= 7) return;
  const d = P(POP);
  const m = $("div", "modal", `<div class="x">✖</div><h2>${d[0]}</h2><p>${d[1]}</p><button class="btn">${d[2]}</button>`);
  m.style.setProperty("--l", R(2, 60) + "vw"); m.style.setProperty("--t", R(12, 62) + "vh");
  const x = m.querySelector(".x");
  x.onmouseenter = () => x.style.transform = `translate(${R(-120, 120)}px,${R(-60, 60)}px)`;
  x.onclick = () => { m.remove(); if (Math.random() < .5) { setTimeout(modal, 200); setTimeout(modal, 400); } };
  m.querySelector(".btn").onclick = () => { burst(innerWidth / 2, innerHeight / 2, 150); flash(true); m.remove(); };
  beep(2);
}
setTimeout(modal, 1500); setInterval(modal, 3500);

let f = 0; setInterval(() => document.title = (f ^= 1) ? "🔥 BUY NOW 🔥" : "💪 ALPHA SALE 💪", 500);

// ---------- CONTROLS ----------
const ctl = $("div", "ctl", `<button>${calm ? "🤪 Chaos mode" : "😌 Calm mode"}</button><button>🔊 Sound</button>`);
const [cm, mu] = ctl.querySelectorAll("button");
cm.onclick = () => {
  calm = !calm; document.body.classList.toggle("calm", calm);
  cm.textContent = calm ? "🤪 Chaos mode" : "😌 Calm mode";
  document.querySelectorAll(".fx,.modal,.toast").forEach(e => e.remove());
};
mu.onclick = () => { mute = !mute; mu.textContent = mute ? "🔇 Muted" : "🔊 Sound"; };
})();
