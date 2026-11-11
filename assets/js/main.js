(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  const nav = $('.site-nav'), bar = $('.progress-line'), journey = $('.journey'), timeline = $('.timeline'), rocket = $('.rocket');
  const stops = []; let len = 0;

  // Scroll progress, sticky nav, and the internship line that draws as you scroll
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav.classList.toggle('scrolled', scrollY > 20);
    if (journey) {
      // The rocket sits at 60% of the screen height while you read, and stops just above the planet
      const r = timeline.getBoundingClientRect();
      const maxY = Math.max(0, len - 34);
      const y = Math.min(maxY, Math.max(0, innerHeight * 0.6 - r.top));
      journey.style.setProperty('--y', y + 'px');
      stops.forEach((s, i) => s.el.classList.toggle('lit', i === stops.length - 1 ? y >= maxY - 1 : y + 27 >= s.y));
      rocket.classList.toggle('landed', maxY > 0 && y >= maxY - 1);
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Measure where each stop (and the planet) sits so the rocket can light them up
  const measure = () => {
    stops.length = 0;
    [...timeline.children].forEach(el => stops.push({ el, y: el.offsetTop + (el.classList.contains('next') ? 18 : 13) }));
    len = stops[stops.length - 1].y;
    journey.style.setProperty('--len', len + 'px');
    onScroll();
  };
  if (journey) { measure(); new ResizeObserver(measure).observe(timeline); addEventListener('load', measure); }

  // Count-up numbers
  const count = el => {
    const to = +el.dataset.count, dec = +el.dataset.dec || 0;
    if (reduce) { el.textContent = to.toFixed(dec); el.dataset.state = 'done'; return; }
    el.dataset.state = 'run';
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min(1, (t - t0) / 1400);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick); else el.dataset.state = 'done';
    };
    requestAnimationFrame(tick);
  };

  // One observer drives every scroll-in animation (chips, rows, wipes, rings, bars, counters)
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.dataset.count) count(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.15 });
  $$('.chips,.pills').forEach(c => [...c.children].forEach((li, i) => li.style.setProperty('--n', i)));
  $$('.rule,.wipe,.skill-row,.ring-wrap,.rise,.pills,.lang-list,[data-count]').forEach(el => io.observe(el));
  // Safety net: anything already on screen that the observer missed still gets revealed
  setTimeout(() => $$('.wipe:not(.in),.rise:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }), 2000);

  // Live GitHub data (falls back silently to the numbers already in the page)
  const GH = 'kabishS';
  const colors = { Java: '#ED8B00', JavaScript: '#F7DF1E', TypeScript: '#3178C6', Python: '#3776AB', HTML: '#E34F26', CSS: '#1572B6' };
  const setStat = (key, val) => {
    const el = $(`[data-live="${key}"]`);
    if (!el) return;
    el.dataset.count = val;
    if (el.dataset.state) el.textContent = val;
  };
  (async () => {
    try {
      const [u, r] = await Promise.all([
        fetch(`https://api.github.com/users/${GH}`),
        fetch(`https://api.github.com/users/${GH}/repos?per_page=100`)
      ]);
      if (!u.ok || !r.ok) throw new Error('GitHub API unavailable');
      const user = await u.json();
      const repos = (await r.json()).filter(x => !x.fork);
      setStat('repos', user.public_repos);
      setStat('followers', user.followers);
      setStat('stars', repos.reduce((s, x) => s + x.stargazers_count, 0));
      const langs = {};
      repos.forEach(x => { if (x.language) langs[x.language] = (langs[x.language] || 0) + 1; });
      const list = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 6);
      if (!list.length) return;
      const max = list[0][1];
      $('#langList').innerHTML = list.map(([n, c], i) => {
        const col = colors[n] || '#8A94A6';
        return `<li><span><i style="background:${col}"></i>${n}</span><span class="lbar"><b style="--w:${Math.round(c / max * 100)}%;--n:${i};background:${col}"></b></span><small>${c}</small></li>`;
      }).join('');
      $('#langCard').hidden = false;
      $('.gh-grid').classList.add('has-lang');
    } catch (err) { /* keep static fallback */ }
  })();

  // Tidio AI chatbot (public key from your original site)
  const TIDIO_KEY = '1ecdniecfvgzqolltjbpslhthzzcosn3';
  const loadChat = () => {
    if (!TIDIO_KEY || $('#tidio-js')) return;
    const s = document.createElement('script');
    s.id = 'tidio-js'; s.async = true; s.src = `https://code.tidio.co/${TIDIO_KEY}.js`;
    document.body.appendChild(s);
  };
  addEventListener('load', () => setTimeout(loadChat, 1500));
  $('#openChat').addEventListener('click', () => {
    loadChat();
    const open = () => window.tidioChatApi && window.tidioChatApi.open();
    if (window.tidioChatApi) open(); else document.addEventListener('tidioChat-ready', open, { once: true });
  });

  // Close mobile menu after choosing a link
  const menu = $('#menu');
  $$('.navbar-nav .nav-link, .navbar-nav .btn').forEach(a => a.addEventListener('click', () => {
    if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
  }));

  // Certificates: continuous right-to-left marquee (track is duplicated), plus the full-size viewer
  const track = $('#certTrack');
  if (track && !reduce) {
    [...track.children].forEach(n => {
      const c = n.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      $$('button', c).forEach(b => { b.tabIndex = -1; });
      track.appendChild(c);
    });
  }
  const modal = $('#certModal'), img = $('img', modal), title = $('.modal-title', modal);
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-cert]');
    if (!btn) return;
    img.src = btn.dataset.cert;
    img.alt = btn.dataset.title + ' certificate';
    title.textContent = btn.dataset.title;
  });

  // Contact form — submits via Web3Forms so messages arrive in your inbox
  const form = $('#contactForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
    const note = $('#formNote');
    const btn = form.querySelector('[type=submit]');
    btn.disabled = true;
    note.textContent = 'Sending\u2026';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });
      const json = await res.json();
      if (json.success) {
        note.textContent = '\u2713 Message sent! I\u2019ll get back to you soon.';
        form.reset();
        form.classList.remove('was-validated');
      } else {
        note.textContent = 'Something went wrong. Please email me directly at kabishvimala@gmail.com';
      }
    } catch {
      note.textContent = 'Network error. Please email me directly at kabishvimala@gmail.com';
    } finally {
      btn.disabled = false;
    }
  });

  // Offline: a panda cuts the cable. (When a page cannot load at all, sw.js serves offline.html.)
  const off = $('#offline'), retry = $('#offlineRetry'), note = $('#offlineNote');
  const setOff = on => { off.hidden = !on; document.body.classList.toggle('is-offline', on); if (on) { note.textContent = ''; retry.focus(); } };
  addEventListener('offline', () => setOff(true));
  addEventListener('online', () => setOff(false));
  $('#offlineClose').addEventListener('click', () => setOff(false));
  retry.addEventListener('click', () => { if (navigator.onLine) setOff(false); else note.textContent = 'Still offline. Check your Wi-Fi or mobile data.'; });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !off.hidden) setOff(false); });
  if (!navigator.onLine) setOff(true);
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  $('#year').textContent = new Date().getFullYear();
})();
