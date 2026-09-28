// Click through tour. The steps are already on the page as plain HTML (.tour-static);
// this turns them into one step at a time. Address: /tour/#<chapter>/<step>.
(function () {
  var src = document.querySelector('.tour-static');
  var root = document.getElementById('tour');
  if (!src || !root) return;

  var chapters = [].map.call(src.querySelectorAll('.chapter'), function (c) {
    return {
      id: c.id,
      title: c.querySelector('h2').textContent,
      clip: c.getAttribute('data-clip'),
      steps: [].map.call(c.querySelectorAll('li'), function (li) {
        var img = li.querySelector('img');
        return { img: img.getAttribute('data-src') || img.getAttribute('src'), alt: img.alt, text: li.querySelector('p').textContent };
      })
    };
  });
  if (!chapters.length) return;

  var el = {
    list: root.querySelector('.tour-chapters ul'),
    shot: root.querySelector('.tour-stage img'),
    stage: root.querySelector('.tour-stage .phone'),
    count: root.querySelector('.tour-count'),
    title: root.querySelector('.tour-title'),
    text: root.querySelector('.tour-text'),
    dots: root.querySelector('.tour-dots'),
    back: root.querySelector('[data-go="back"]'),
    next: root.querySelector('[data-go="next"]'),
    watch: root.querySelector('.tour-watch a')
  };
  var ci = 0, si = 0;

  chapters.forEach(function (c, i) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    var n = document.createElement('span'), t = document.createElement('span');
    n.className = 'n';
    n.textContent = String(i + 1).padStart(2, '0');
    t.textContent = c.title;
    b.appendChild(n);
    b.appendChild(t);
    b.addEventListener('click', function () { go(i, 0, true); });
    li.appendChild(b);
    el.list.appendChild(li);
  });

  function last() { return ci === chapters.length - 1 && si === chapters[ci].steps.length - 1; }

  function render(push) {
    var c = chapters[ci], s = c.steps[si];
    el.shot.src = s.img;
    el.shot.alt = s.alt;
    el.count.textContent = 'Chapter ' + (ci + 1) + ' of ' + chapters.length + ' · Step ' + (si + 1) + ' of ' + c.steps.length;
    el.title.textContent = c.title;
    el.text.textContent = s.text;
    [].forEach.call(el.list.querySelectorAll('button'), function (b, i) {
      if (i === ci) { b.setAttribute('aria-current', 'true'); if (b.scrollIntoView && window.innerWidth < 1021) b.scrollIntoView({ block: 'nearest', inline: 'center' }); }
      else b.removeAttribute('aria-current');
    });
    while (el.dots.firstChild) el.dots.removeChild(el.dots.firstChild);
    c.steps.forEach(function (_, i) {
      var d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Step ' + (i + 1) + ' of ' + c.steps.length);
      if (i === si) d.setAttribute('aria-current', 'true');
      d.addEventListener('click', function () { go(ci, i, true); });
      el.dots.appendChild(d);
    });
    el.back.disabled = ci === 0 && si === 0;
    el.back.style.visibility = el.back.disabled ? 'hidden' : 'visible';
    var endOfChapter = si === c.steps.length - 1;
    el.next.textContent = last() ? 'Get GroundLog' : endOfChapter ? 'Next: ' + chapters[ci + 1].title : 'Next';
    if (el.watch) el.watch.href = '/academy/#' + c.clip;
    var nx = peek();
    if (nx) { var im = new Image(); im.src = nx.img; }
    var hash = '#' + c.id + '/' + (si + 1);
    if (push && location.hash !== hash) history.replaceState(null, '', hash);
  }

  function peek() {
    var c = chapters[ci];
    if (si < c.steps.length - 1) return c.steps[si + 1];
    if (ci < chapters.length - 1) return chapters[ci + 1].steps[0];
    return null;
  }

  function go(c, s, push) {
    ci = Math.max(0, Math.min(chapters.length - 1, c));
    si = Math.max(0, Math.min(chapters[ci].steps.length - 1, s));
    render(push);
  }

  function next() {
    if (last()) { location.href = '/#get'; return; }
    if (si < chapters[ci].steps.length - 1) go(ci, si + 1, true); else go(ci + 1, 0, true);
  }
  function back() {
    if (si > 0) go(ci, si - 1, true);
    else if (ci > 0) go(ci - 1, chapters[ci - 1].steps.length - 1, true);
  }

  function fromHash() {
    var m = /^#([a-z-]+)(?:\/(\d+))?$/.exec(location.hash || '');
    if (!m) return false;
    for (var i = 0; i < chapters.length; i++) {
      if (chapters[i].id === m[1]) { go(i, (parseInt(m[2], 10) || 1) - 1, false); return true; }
    }
    return false;
  }

  el.next.addEventListener('click', next);
  el.back.addEventListener('click', back);
  // a tap on the screen is a shortcut for Next; the buttons stay the keyboard path
  el.stage.addEventListener('click', function () { if (!last()) next(); });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input,textarea,select')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); if (!last()) next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); back(); }
  });
  window.addEventListener('hashchange', fromHash);

  src.hidden = true;
  root.hidden = false;
  if (!fromHash()) render(false);
})();
