/* =================== DATA =================== */
const RP = 1600/2400, RL = 2400/1600;

const SETS = [
  { cat: 'soiree',   label: 'Soirée',    ratios: [RP,RL,RP,RL,RL,RP,RP,RL,RL,RL] },
  { cat: 'voyage',   label: 'Voyage',    ratios: [RP,RP,RP,RP,RP,RP,RP,RP,RP,RP,RP,RP,RP,RP] },
  { cat: 'portrait', label: 'Portrait',  ratios: [RP,RP,RP,RL,RL,RP] },
  { cat: 'appart',   label: 'Intérieur', ratios: [RL,RL,RP,RL,RL,RL,RL] },
];
const LABELS = Object.fromEntries(SETS.map(s => [s.cat, s.label]));

const byCat = {};
SETS.forEach(s => {
  byCat[s.cat] = s.ratios.map((ar, i) => ({
    cat: s.cat,
    num: i + 1,
    ar,
    src: `img/${s.cat}/${i + 1}.webp`,
  }));
});

const allList = [];
const maxLen = Math.max(...SETS.map(s => s.ratios.length));
for (let i = 0; i < maxLen; i++) {
  SETS.forEach(s => { if (byCat[s.cat][i]) allList.push(byCat[s.cat][i]); });
}

/* =================== TWEAK DEFAULTS =================== */
const TWEAKS = /*EDITMODE-BEGIN*/{
  accent:      '#b8473d',
  displayFont: 'Instrument Serif',
  density:     'standard',
  grain:       'on',
}/*EDITMODE-END*/;

/* =================== GALLERY ENGINE =================== */
const gallery = document.getElementById('gallery');
let current = 'soiree';
let figures = [];
let visibleData = [];
let io;

function buildFigures() {
  allList.forEach(d => {
    const fig = document.createElement('figure');
    fig.className = 'shot';
    fig.dataset.cat = d.cat;

    const img = document.createElement('img');
    img.src = d.src;
    img.alt = `${LABELS[d.cat]} ${d.num}`;
    img.loading = 'lazy';

    const cap = document.createElement('figcaption');
    cap.innerHTML = `<span class="dot"></span>${LABELS[d.cat]} <span class="num">/ ${String(d.num).padStart(2, '0')}</span>`;

    fig.appendChild(img);
    fig.appendChild(cap);
    fig._data = d;
    fig.addEventListener('click', () => openLightbox(visibleData.indexOf(d)));
    gallery.appendChild(fig);
    figures.push(fig);
  });

  io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
}

function densityTarget() {
  const w = gallery.clientWidth;
  const base = { aere: 460, standard: 360, dense: 280 }[TWEAKS.density] || 360;
  if (w < 560) return Math.round(w * 0.92);
  if (w < 900) return Math.round(base * 0.8);
  return base;
}

function layout() {
  const W = gallery.clientWidth;
  if (!W) return;
  const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap')) || 12;
  const target = densityTarget();
  const maxH = window.innerHeight * 0.86;
  const shown = figures.filter(f => current === 'all' || f.dataset.cat === current);

  let row = [], arSum = 0, y = 0;
  const placeRow = items => {
    let x = 0;
    const h = Math.min((W - (items.length - 1) * gap) / items.reduce((s, f) => s + f._data.ar, 0), maxH);
    items.forEach(f => {
      const w = h * f._data.ar;
      f.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px`;
      x += w + gap;
    });
    return h;
  };

  shown.forEach(f => {
    row.push(f);
    arSum += f._data.ar;
    if (arSum * target + (row.length - 1) * gap >= W) {
      y += placeRow(row) + gap;
      row = []; arSum = 0;
    }
  });
  if (row.length) {
    const h = Math.min(target, maxH);
    let x = 0;
    row.forEach(f => {
      const w = h * f._data.ar;
      f.style.cssText = `width:${w}px;height:${h}px;left:${x}px;top:${y}px`;
      x += w + gap;
    });
    y += h;
  }

  gallery.style.height = y + 'px';
  visibleData = shown.map(f => f._data);
}

function setFilter(cat) {
  if (cat === current) return;
  current = cat;
  document.querySelectorAll('.filter').forEach(b => b.classList.toggle('is-active', b.dataset.cat === cat));
  gallery.classList.add('switching');
  setTimeout(() => {
    figures.forEach(f => {
      const show = cat === 'all' || f.dataset.cat === cat;
      f.style.display = show ? '' : 'none';
      f.classList.remove('in');
    });
    layout();
    gallery.classList.remove('switching');
    requestAnimationFrame(() => figures.forEach(f => { if (f.style.display !== 'none') io.observe(f); }));
    updateReadout();
  }, 260);
}

function updateReadout() {
  const n = current === 'all' ? allList.length : byCat[current].length;
  const label = current === 'all' ? 'Toutes les séries' : LABELS[current];
  document.getElementById('readout').textContent = `${label} — ${String(n).padStart(2, '0')} clichés`;
}

/* =================== FILTERS UI =================== */
function buildFilters() {
  const wrap = document.getElementById('filters');
  SETS.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'filter' + (i === 0 ? ' is-active' : '');
    b.dataset.cat = s.cat;
    b.setAttribute('role', 'tab');
    b.innerHTML = `${s.label} <sup>${String(s.ratios.length).padStart(2, '0')}</sup>`;
    b.addEventListener('click', () => setFilter(s.cat));
    wrap.appendChild(b);
  });
}

/* =================== LIGHTBOX =================== */
const lb     = document.getElementById('lb');
const lbImg  = document.getElementById('lbImg');
const lbCat  = document.getElementById('lbCat');
const lbCount = document.getElementById('lbCount');
let lbIndex = 0;

function showLb(i) {
  lbIndex = (i + visibleData.length) % visibleData.length;
  const d = visibleData[lbIndex];
  lbImg.classList.remove('shown');
  lbImg.classList.add('swapping');
  const tmp = new Image();
  tmp.onload = () => {
    lbImg.src = d.src;
    lbImg.classList.remove('swapping');
    requestAnimationFrame(() => lbImg.classList.add('shown'));
  };
  tmp.src = d.src;
  lbCat.textContent = LABELS[d.cat];
  lbCount.textContent = `${String(lbIndex + 1).padStart(2, '0')} / ${String(visibleData.length).padStart(2, '0')}`;
}

function openLightbox(i) {
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  showLb(i);
}

function closeLightbox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.removeAttribute('src');
}

document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', () => showLb(lbIndex - 1));
document.getElementById('lbNext').addEventListener('click', () => showLb(lbIndex + 1));
lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lb-stage')) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   showLb(lbIndex - 1);
  if (e.key === 'ArrowRight')  showLb(lbIndex + 1);
});

let tsx = 0;
lb.addEventListener('touchstart', e => { tsx = e.changedTouches[0].clientX; }, { passive: true });
lb.addEventListener('touchend',   e => { const dx = e.changedTouches[0].clientX - tsx; if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1)); });

/* =================== SCROLL / TOPBAR =================== */
const topbar = document.getElementById('topbar');
window.addEventListener('scroll', () => { topbar.classList.toggle('scrolled', window.scrollY > 24); }, { passive: true });
document.getElementById('year').textContent = new Date().getFullYear();

/* =================== TWEAKS =================== */
function applyTweaks() {
  document.documentElement.style.setProperty('--accent', TWEAKS.accent);
  document.documentElement.style.setProperty('--font-display', `"${TWEAKS.displayFont}"`);
  document.body.classList.toggle('grain-on', TWEAKS.grain === 'on');
}

function persist() {
  try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: TWEAKS }, '*'); } catch (e) {}
}

const ACCENTS = [['#b8473d','Rouge'],['#8a8f86','Mono'],['#b98a3c','Ambre'],['#5f7d8c','Bleu']];
const FONTS   = [['Instrument Serif','Serif'],['Cormorant Garamond','Classique'],['Archivo','Sans']];
const DENS    = [['aere','Aéré'],['standard','Standard'],['dense','Dense']];
const GRAINS  = [['on','Activé'],['off','Désactivé']];

function buildTweakUI() {
  const acc = document.getElementById('twAccent');
  ACCENTS.forEach(([hex, name]) => {
    const b = document.createElement('button');
    b.style.background = hex;
    b.title = name;
    b.className = TWEAKS.accent === hex ? 'active' : '';
    b.onclick = () => {
      TWEAKS.accent = hex;
      applyTweaks();
      [...acc.children].forEach(c => c.classList.toggle('active', c === b));
      persist();
    };
    acc.appendChild(b);
  });

  const mkRow = (host, opts, key, after) => {
    opts.forEach(([val, name]) => {
      const c = document.createElement('button');
      c.className = 'tw-chip' + (TWEAKS[key] === val ? ' active' : '');
      c.textContent = name;
      if (key === 'displayFont') c.style.fontFamily = `"${val}"`;
      c.onclick = () => {
        TWEAKS[key] = val;
        applyTweaks();
        [...host.children].forEach(x => x.classList.toggle('active', x === c));
        if (after) after();
        persist();
      };
      host.appendChild(c);
    });
  };

  mkRow(document.getElementById('twFont'),    FONTS, 'displayFont');
  mkRow(document.getElementById('twDensity'), DENS,  'density', () => layout());
  mkRow(document.getElementById('twGrain'),   GRAINS,'grain');
}

const tweaksPanel = document.getElementById('tweaks');
window.addEventListener('message', e => {
  const t = e.data && e.data.type;
  if (t === '__activate_edit_mode')   tweaksPanel.classList.add('show');
  if (t === '__deactivate_edit_mode') tweaksPanel.classList.remove('show');
});
document.getElementById('twClose').addEventListener('click', () => {
  tweaksPanel.classList.remove('show');
  try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
});
try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

/* =================== INIT =================== */
buildFilters();
buildFigures();
figures.forEach(f => { f.style.display = (current === 'all' || f.dataset.cat === current) ? '' : 'none'; });
buildTweakUI();
applyTweaks();
updateReadout();

let rt;
window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 120); });

function firstLayout() {
  layout();
  requestAnimationFrame(() => figures.forEach(f => io.observe(f)));
}

if (document.fonts && document.fonts.ready) { document.fonts.ready.then(firstLayout); }
window.addEventListener('load', layout);
firstLayout();
