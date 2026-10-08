const ROOT = document.body.dataset.root || "";
const money = n => CURRENCY + Number(n).toFixed(2);

// ---- State: saved in localStorage AND carried in the page address,
// so it also works when opening files directly (file://), where
// some browsers do not share storage between pages.
function loadState() {
  let best = null;
  const cands = [];
  const m = location.hash.match(/s=([^&]*)/);
  if (m) { try { cands.push(JSON.parse(decodeURIComponent(m[1]))); } catch (e) {} }
  try { cands.push(JSON.parse(localStorage.getItem("pol33t_state"))); } catch (e) {}
  cands.forEach(s => { if (s && typeof s == "object" && (!best || (s.t || 0) > (best.t || 0))) best = s; });
  return best ? { c: best.c || {}, o: best.o || [], t: best.t || 0 } : { c: {}, o: [], t: 0 };
}
const STATE = loadState();
function persist() {
  STATE.t = Date.now();
  const s = JSON.stringify(STATE);
  try { localStorage.setItem("pol33t_state", s); } catch (e) {}
  try { history.replaceState(null, "", location.pathname + location.search + "#s=" + encodeURIComponent(s)); } catch (e) {}
}
function nav(url) { location.href = url.split("#")[0] + "#s=" + encodeURIComponent(JSON.stringify(STATE)); }
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  const h = a.getAttribute("href");
  if (/^(https?:|mailto:|#)/.test(h)) return;
  e.preventDefault(); nav(h);
});

// ---- Cart ----
const Cart = {
  get() { return STATE.c; },
  save(c) { STATE.c = c; persist(); Cart.badge(); },
  add(id, q = 1) { const c = Cart.get(); c[id] = (c[id] || 0) + q; Cart.save(c); },
  setQty(id, q) { const c = Cart.get(); if (q <= 0) delete c[id]; else c[id] = q; Cart.save(c); },
  remove(id) { const c = Cart.get(); delete c[id]; Cart.save(c); },
  clear() { Cart.save({}); },
  items() { const c = Cart.get(); return Object.keys(c).map(id => ({ p: PRODUCTS.find(x => x.id == id), q: c[id] })).filter(i => i.p); },
  count() { return Cart.items().reduce((s, i) => s + i.q, 0); },
  total() { return Cart.items().reduce((s, i) => s + i.p.price * i.q, 0); },
  badge() { const e = document.getElementById("cc"); if (e) e.textContent = Cart.count(); }
};

// ---- Orders (for delivery status page) ----
const Orders = {
  get() { return STATE.o; },
  create() {
    STATE.o.unshift({ id: "P" + Date.now().toString().slice(-7), date: new Date().toLocaleDateString(), status: "Processing",
      total: Cart.total(), items: Cart.items().map(i => i.q + " x " + i.p.name) });
    persist();
  }
};

// ---- Shared header ----
(function () {
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat") || "All";
  const cats = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  document.getElementById("header").innerHTML =
    `<nav class="strip">${cats.map(c => `<a class="${c == cat ? "on" : ""}" href="${ROOT}index.html?cat=${encodeURIComponent(c)}">${c}</a>`).join("")}</nav>
     <div class="top"><a class="logo" href="${ROOT}index.html">Pol33t Testosterone ED</a>
     <input id="q" type="search" placeholder="Search products" value="${params.get("q") || ""}"></div>
     <div class="links">
       <a href="${ROOT}pages/cart.html">Shopping cart (<span id="cc">0</span>)</a>
       <a href="${ROOT}pages/delivery.html">Delivery status</a>
       <a href="${ROOT}pages/about.html">About us</a>
       <a href="${ROOT}pages/contact.html">Contact us</a>
     </div>`;
  Cart.badge();
  if (!document.body.dataset.shop)
    document.getElementById("q").addEventListener("keydown", e => {
      if (e.key == "Enter") nav(ROOT + "index.html?q=" + encodeURIComponent(e.target.value));
    });
})();
