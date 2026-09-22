/* Personio "We're hiring" generator — template data + canvas renderer.
   Geometry, type and colour values are transcribed verbatim from the Figma file. */
(function () {
  var WM = "M 102.531 24.626 L 106.957 24.626 L 106.957 8.608 L 102.531 8.608 L 102.531 24.626 Z M 104.707 5.913 C 106.304 5.913 107.61 4.641 107.61 2.994 C 107.61 1.347 106.304 0 104.707 0 C 103.111 0 101.878 1.347 101.878 2.994 C 101.878 4.641 103.111 5.913 104.707 5.913 Z M 9.143 0.898 L 0 0.898 L 0 24.551 L 4.644 24.551 L 4.644 15.569 L 8.78 15.569 C 13.061 15.569 16.617 12.949 16.617 8.234 C 16.617 3.518 13.497 0.898 9.143 0.898 Z M 8.925 11.302 L 4.644 11.302 L 4.644 5.015 L 9.143 5.015 C 10.957 5.015 12.408 6.213 12.408 8.159 C 12.408 10.105 10.884 11.302 8.925 11.302 Z M 113.778 15.569 C 113.778 18.638 115.955 20.808 118.712 20.808 C 121.469 20.808 123.646 18.638 123.646 15.569 C 123.646 12.5 121.542 10.254 118.712 10.254 C 115.882 10.254 113.778 12.5 113.778 15.569 Z M 109.497 15.569 C 109.497 10.105 113.488 6.063 118.712 6.063 C 123.936 6.063 128 10.105 128 15.569 C 128 21.033 124.009 25 118.712 25 C 113.415 25 109.497 21.033 109.497 15.569 Z M 83.955 11.377 L 83.955 24.626 L 88.236 24.626 L 88.236 11.976 C 88.236 10.928 88.816 10.404 89.76 10.404 L 93.388 10.404 C 94.331 10.404 94.912 10.928 94.912 11.976 L 94.912 24.626 L 99.193 24.626 L 99.193 11.377 C 99.193 8.608 96.943 6.287 94.186 6.287 L 88.961 6.287 C 86.204 6.287 83.955 8.608 83.955 11.377 Z M 67.991 15.569 C 67.991 18.638 70.095 20.808 72.925 20.808 C 75.755 20.808 77.859 18.638 77.859 15.569 C 77.859 12.5 75.683 10.254 72.925 10.254 C 70.168 10.254 67.991 12.5 67.991 15.569 Z M 63.71 15.569 C 63.71 10.105 67.628 6.063 72.925 6.063 C 78.222 6.063 82.141 10.105 82.141 15.569 C 82.141 21.033 78.222 25 72.925 25 C 67.628 25 63.71 21.033 63.71 15.569 Z M 47.093 19.012 L 51.519 19.012 C 51.664 20.808 52.971 21.482 54.857 21.482 C 56.381 21.482 57.832 21.033 57.832 19.461 C 57.832 17.889 56.381 17.665 55.147 17.44 L 53.406 17.141 C 50.068 16.542 47.528 15.195 47.528 11.826 C 47.528 8.159 50.939 6.063 54.639 6.063 C 58.34 6.063 61.751 8.009 61.896 11.826 L 57.615 11.826 C 57.469 10.18 56.308 9.581 54.639 9.581 C 52.971 9.581 51.882 10.03 51.882 11.452 C 51.882 12.725 52.971 13.174 54.277 13.398 L 56.163 13.698 C 59.429 14.222 62.113 15.419 62.113 18.937 C 62.113 22.904 58.776 25 54.785 25 C 51.011 25 47.456 22.904 47.093 19.012 Z M 36.499 11.377 L 36.499 24.626 L 40.78 24.626 L 40.78 11.976 C 40.78 10.928 41.361 10.404 42.304 10.404 L 46.295 10.404 L 46.295 6.287 L 41.506 6.287 C 38.748 6.287 36.499 8.608 36.499 11.377 Z M 21.624 13.623 L 30.186 13.623 C 29.823 11.527 28.082 10.03 25.905 10.03 C 23.728 10.03 21.986 11.527 21.624 13.623 Z M 16.907 15.569 C 16.907 10.254 20.68 6.063 25.76 6.063 C 31.492 6.063 34.467 10.554 34.467 15.195 C 34.467 15.793 34.395 16.392 34.322 16.991 L 21.478 16.991 C 21.624 19.386 23.51 20.808 25.905 20.808 C 27.429 20.808 28.807 20.06 29.823 18.713 L 33.088 21.108 C 31.202 23.728 28.59 25 25.76 25 C 20.753 25 16.907 20.883 16.907 15.569 Z";
  var wmPath = null;
  var FONT = '"FT Regola Neue", sans-serif';
  var PILL_FILL = 'rgba(236,233,235,0.32)';

  var IMG_SRC = {
    t01: 'assets/bg-t01.jpg',
    t02: 'assets/bg-t02.jpg',
    t03: 'assets/bg-t03.jpg'
  };
  var IMAGES = {};

  // ── Visual templates (exact Figma geometry) ──────────────────────────────
  var VISUALS = [
    {
      key: 't01', label: 'Portrait', ratio: '4:5', w: 1200, h: 1500, bg: 'rgb(255,255,255)',
      layers: [
        { type: 'img', img: 't01', x: 0, y: 0, w: 1200, h: 1500 },
        { type: 'pill', y: 1197, h: 100, r: 20, size: 48, lh: 80, ls: -0.02, weight: 400, pad: 40, minW: 750, blur: 29.7 },
        { type: 'meta', x: 70, y: 1396, w: 1060, size: 30, lh: 30, ls: -0.005, weight: 400 }
      ]
    },
    {
      key: 't02', label: 'Square', ratio: '1:1', w: 1200, h: 1200, bg: 'rgb(255,255,255)',
      layers: [
        { type: 'img', img: 't02', x: 0, y: 0, w: 1200, h: 1200 },
        { type: 'pill', y: 915, h: 100, r: 20, size: 44, lh: 80, ls: -0.02, weight: 400, pad: 40, minW: 750, blur: 29.7 },
        { type: 'meta', x: 70, y: 1108, w: 1060, size: 30, lh: 30, ls: -0.005, weight: 400 }
      ]
    },
    {
      key: 't03', label: 'Landscape', ratio: '1.91:1', w: 1200, h: 627, bg: 'rgb(0,0,0)',
      layers: [
        { type: 'img', img: 't03', x: 0, y: 0, w: 1200, h: 627 },
        { type: 'pill', y: 427, h: 72, r: 14, size: 35, lh: 80, ls: -0.02, weight: 400, pad: 40, minW: 540, blur: 29.7 },
        { type: 'meta', x: 70, y: 561, w: 1060, size: 28, lh: 30, ls: -0.005, weight: 400 }
      ]
    }
  ];

  // ── Message generator ───────────────────────────────────────────────────
  var FIELDS = {
    city: { label: 'City', ph: '[city]' },
    workLine: { label: 'One concrete line about the work / team', ph: '[One concrete line on the work or the team. What would someone actually do, or work on?]', multi: true },
    link: { label: 'Link', ph: '[link]' },
    name: { label: 'Name', ph: '[name]' },
    prevContext: { label: 'Previous company / university / project', ph: '[previous company / university / project]' },
    department: { label: 'Department', ph: '[department]' },
    teamDesc: { label: 'Team description', ph: '[describe team briefly \u2014 e.g., collaborative, fast-moving team of X people]', multi: true },
    careersLink: { label: 'Careers page link', ph: '[add job careers page link]' },
    fullName: { label: 'Full name', ph: '[Full name]' },
    currentCompany: { label: 'Current company', ph: '[current company]' },
    prevContext2: { label: 'Previous company / context', ph: '[previous company / when you worked together]' },
    skill: { label: 'Specific skill', ph: '[specific skill you saw firsthand \u2014 e.g., turning messy data into clear stories / closing deals everyone else had given up on / shipping features under crazy deadlines]', multi: true },
    project: { label: 'Project / company', ph: '[project / at company]' },
    jobDesc: { label: 'Job description / unique aspect', ph: '[Briefly describe the job and any unique aspects that might interest them]', multi: true },
    jobLink: { label: 'Job link', ph: '[add job link]' }
  };

  var MESSAGES = [
    {
      key: 'social', label: 'Social media', hint: 'Post copy to sit alongside the visual',
      fields: ['city', 'workLine', 'link'],
      body: "My team at Personio is hiring a %jobTitle% in %city%.\n%workLine%\nI enjoy working here and I'm happy to answer honest questions.\nKnow someone? Send them my way, or share this: %link%"
    },
    {
      key: 'opt1', label: 'Option 01', hint: 'Warm reconnect \u2014 referral offer',
      fields: ['name', 'prevContext', 'department', 'teamDesc', 'careersLink', 'fullName'],
      body: "Hey %name%,\n\nIt's been way too long. How are you?\n\nI was just thinking about our time together at %prevContext%, and you came to mind for a reason:\n\nWe have an opening in the %department% team here at Personio. We're a %teamDesc%, and from what I know about you, I think you'd fit right in, both in terms of how we work and the energy you'd bring.\n\nWe currently have an open %jobTitle% role, and I'd love to refer you through our internal referral program. Would you be interested? If yes, just send me your CV and I'll apply directly on your behalf.\n\nHere you can already find the full job description %careersLink%.\n\nLooking forward to catching up and hopefully working together again!\n\nBest\n\n%fullName%"
    },
    {
      key: 'opt2', label: 'Message option 02', hint: 'Specific skill you saw firsthand',
      fields: ['name', 'currentCompany', 'prevContext2', 'skill', 'project', 'careersLink', 'fullName'],
      body: "Hi %name%,\n\nLong time no speak. I hope things are going well at %currentCompany%!\n\nI've been following your journey a bit and it's great to see how far you've come since %prevContext2%.\n\nThe reason I'm writing: we're hiring a %jobTitle% at Personio.\n\nI still remember how strong you were at %skill% when we worked together on %project%, and that's exactly what this role needs.\n\nIf you're even a little curious, send me your CV and I'll refer you through our internal referral program.\n\nHere you can already find the full job description %careersLink%.\n\nBest\n\n%fullName%"
    },
    {
      key: 'opt3', label: 'Option 03', hint: 'Formal outreach \u2014 career progression',
      fields: ['name', 'currentCompany', 'jobDesc', 'jobLink'],
      body: "Hi %name%,\n\nI hope this message finds you well!\n\nIt's been a while since we last connected. I've been keeping up with your impressive career progression at %currentCompany%, and I wanted to reach out to you with an exciting opportunity.\n\nWe're currently looking for a %jobTitle% at Personio, and based on your skills and experience, I think you would be a fantastic fit for the role.\n\n%jobDesc%\n\nIf you're open to exploring new opportunities, I'd love to tell you more about the role and discuss how it could align with your career goals.\n\nHere you can already find the full job description %jobLink%.\n\nLooking forward to catching up and hopefully working together again!\n\nBest\n\n%name%"
    }
  ];

  // Split a template body into literal text runs and editable variable tokens.
  function buildSegments(msg, vals, jobTitle) {
    var out = [];
    var re = /%(\w+)%/g;
    var last = 0, m;
    while ((m = re.exec(msg.body)) !== null) {
      if (m.index > last) out.push({ kind: 'text', text: msg.body.slice(last, m.index) });
      var key = m[1];
      if (key === 'jobTitle') {
        out.push({ kind: 'token', key: 'jobTitle', label: 'Job title', value: (jobTitle || '').trim(), ph: '[job title]', multi: false });
      } else {
        var def = FIELDS[key] || {};
        out.push({ kind: 'token', key: key, label: def.label || key, value: (vals[key] || '').trim(), ph: def.ph || '', multi: !!def.multi });
      }
      last = m.index + m[0].length;
    }
    if (last < msg.body.length) out.push({ kind: 'text', text: msg.body.slice(last) });
    return out;
  }

  function buildMessage(msg, vals, jobTitle) {
    var out = msg.body.replace(/%jobTitle%/g, (jobTitle || '').trim() || '[job title]');
    msg.fields.forEach(function (k) {
      var v = (vals[k] || '').trim();
      out = out.split('%' + k + '%').join(v || FIELDS[k].ph);
    });
    return out;
  }

  // ── Canvas painting ─────────────────────────────────────────────────────
  var assetPromise = null;
  function loadAssets() {
    if (assetPromise) return assetPromise;
    var keys = Object.keys(IMG_SRC);
    assetPromise = Promise.all(keys.map(function (k) {
      return new Promise(function (res) {
        var im = new Image();
        im.onload = function () { IMAGES[k] = im; res(); };
        im.onerror = function () { res(); };
        im.src = IMG_SRC[k];
      });
    })).then(function () {
      if (Object.keys(IMAGES).length < keys.length) assetPromise = null;
      if (document.fonts && document.fonts.load) {
        return Promise.all([
          document.fonts.load('500 276px "FT Regola Neue"'),
          document.fonts.load('400 48px "FT Regola Neue"'),
          document.fonts.load('400 25px "FT Regola Neue"')
        ]).catch(function () {});
      }
    });
    return assetPromise;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function setFont(ctx, L, k) {
    ctx.font = (L.weight || 400) + ' ' + (L.size * k) + 'px ' + FONT;
    ctx.letterSpacing = (L.ls * L.size * k) + 'px';
  }

  function baselineFor(ctx, topPx, lhPx) {
    var m = ctx.measureText('Hg');
    var asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    if (!asc) { asc = m.actualBoundingBoxAscent; desc = m.actualBoundingBoxDescent; }
    return topPx + (lhPx - (asc + desc)) / 2 + asc;
  }

  function drawText(ctx, L, k, text, xOverride, alignOverride) {
    ctx.save();
    setFont(ctx, L, k);
    ctx.fillStyle = L.color || '#fff';
    var align = alignOverride || L.align || 'left';
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    var x = xOverride != null ? xOverride
      : align === 'center' ? (L.x + L.w / 2) * k
      : align === 'right' ? (L.x + L.w) * k : L.x * k;
    ctx.fillText(text, x, baselineFor(ctx, L.y * k, L.lh * k));
    ctx.restore();
  }

  function snapshot(canvas) {
    var s = document.createElement('canvas');
    s.width = canvas.width; s.height = canvas.height;
    s.getContext('2d').drawImage(canvas, 0, 0);
    return s;
  }

  function drawGrad(ctx, L, k, canvas) {
    var x = L.x * k, y = L.y * k, w = L.w * k, h = L.h * k;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    if (L.blur > 1) {
      var snap = snapshot(canvas);
      ctx.filter = 'blur(' + (L.blur * k) + 'px)';
      ctx.drawImage(snap, 0, 0);
      ctx.filter = 'none';
    }
    var a = L.angle * Math.PI / 180;
    var dx = Math.sin(a), dy = -Math.cos(a);
    var len = Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a));
    var cx = x + w / 2, cy = y + h / 2;
    var g = ctx.createLinearGradient(cx - dx * len / 2, cy - dy * len / 2, cx + dx * len / 2, cy + dy * len / 2);
    L.stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
  }

  function drawPill(ctx, L, k, text, canvas, tpl) {
    var spec = { size: L.size, weight: L.weight, ls: L.ls };
    setFont(ctx, spec, k);
    var tw = ctx.measureText(text).width;
    var maxInner = (tpl.w - 2 * L.pad - 20) * k;
    if (tw > maxInner) {
      spec.size = L.size * (maxInner / tw);
      setFont(ctx, spec, k);
      tw = ctx.measureText(text).width;
    }
    var w = Math.max(tw + 2 * L.pad * k, (L.minW || 0) * k), h = L.h * k;
    var x = (tpl.w * k - w) / 2, y = L.y * k, r = L.r * k;

    ctx.save();
    roundRectPath(ctx, x, y, w, h, r);
    ctx.clip();
    var snap = snapshot(canvas);
    ctx.filter = 'blur(' + (L.blur * k) + 'px)';
    ctx.drawImage(snap, 0, 0);
    ctx.filter = 'none';
    ctx.fillStyle = PILL_FILL;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(x, y, w, Math.max(1, 1.2 * k));
    ctx.restore();

    ctx.save();
    roundRectPath(ctx, x + 0.6 * k, y + 0.6 * k, w - 1.2 * k, h - 1.2 * k, Math.max(0, r - 0.6 * k));
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.05 * k;
    ctx.stroke();
    ctx.restore();

    drawText(ctx, {
      size: spec.size, weight: L.weight, ls: L.ls, lh: L.lh,
      y: L.y + (L.h - L.lh) / 2, color: '#fff'
    }, k, text, x + w / 2, 'center');
  }

  function drawLogo(ctx, L, k) {
    if (!wmPath) wmPath = new Path2D(WM);
    ctx.save();
    ctx.translate(L.x * k, L.y * k);
    ctx.scale(L.w * k / 128, L.h * k / 25);
    ctx.fillStyle = '#fff';
    ctx.fill(wmPath, 'nonzero');
    ctx.restore();
  }

  function paint(canvas, tplKey, vals, scale) {
    var tpl = VISUALS.filter(function (t) { return t.key === tplKey; })[0] || VISUALS[0];
    var k = scale || 1;
    canvas.width = Math.round(tpl.w * k);
    canvas.height = Math.round(tpl.h * k);
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = tpl.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    tpl.layers.forEach(function (L) {
      if (L.type === 'rect') {
        ctx.fillStyle = L.fill;
        ctx.fillRect(L.x * k, L.y * k, L.w * k, L.h * k);
      } else if (L.type === 'img') {
        var im = IMAGES[L.img];
        if (im) ctx.drawImage(im, L.x * k, L.y * k, L.w * k, L.h * k);
      } else if (L.type === 'grad') {
        drawGrad(ctx, L, k, canvas);
      } else if (L.type === 'text') {
        drawText(ctx, L, k, L.word);
      } else if (L.type === 'pill') {
        drawPill(ctx, L, k, (vals.jobTitle || '').trim() || '[job title]', canvas, tpl);
      } else if (L.type === 'logo') {
        drawLogo(ctx, L, k);
      } else if (L.type === 'meta') {
        drawText(ctx, L, k, (vals.location || '').trim(), L.x * k, 'left');
        drawText(ctx, L, k, (vals.cta || '').trim(), (L.x + L.w) * k, 'right');
      }
    });
    return tpl;
  }

  window.PGEN = {
    visuals: VISUALS, fields: FIELDS, messages: MESSAGES,
    buildMessage: buildMessage, buildSegments: buildSegments, loadAssets: loadAssets, paint: paint
  };
})();
