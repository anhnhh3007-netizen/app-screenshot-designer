// build.jsx: builds App Store / Google Play / Showcase screenshots from a spec.json.
// Run via: scripts/run-ps.sh scripts/build.jsx path/to/spec.json
// Each target becomes one wide PSD (N slides side by side) and is sliced into N PNGs.

#target photoshop

(function () {
    var SCRIPT_DIR = new File($.fileName).parent.fsName;
    $.evalFile(new File(SCRIPT_DIR + '/lib/asd.jsx'));
    var A = ASD;

    var args = (typeof ASD_ARGS !== 'undefined') ? ASD_ARGS : [];
    if (!args.length) return 'ERROR: missing spec path argument';

    var specFile = new File(args[0]);
    var spec = A.readJSON(specFile);
    var BASE = specFile.parent.fsName;
    var OUT = A.resolvePath(BASE, spec.outputDir || 'output');
    var report = { spec: specFile.fsName, output: OUT, targets: [], warnings: A.warnings };

    var DEFAULT_DEVICE = { style: 'frame', bezelColor: '#111318', bezel: 0.035, scale: null, shadow: true, island: true, bleed: false };

    function n2(i) { return (i < 9 ? '0' : '') + (i + 1); }

    function deepMerge(a, b) {
        var out = A.extend(a);
        if (!b) return out;
        for (var k in b) {
            if (!b.hasOwnProperty(k)) continue;
            var bv = b[k];
            if (bv && typeof bv === 'object' && !(bv instanceof Array) && out[k] && typeof out[k] === 'object' && !(out[k] instanceof Array)) out[k] = deepMerge(out[k], bv);
            else out[k] = bv;
        }
        return out;
    }

    // ---------- Decorations ----------
    // d: { type:"circle"|"rect"|"image", x,y,w,h (x,w in slide widths; y,h in canvas heights), fill, opacity, radius (fraction of W), path }
    function addDecoration(d, ox, W, H, name) {
        var x = ox + d.x * W, y = d.y * H, w = d.w * W, h = (d.h !== undefined ? d.h * H : d.w * W);
        if (d.type === 'image') {
            var l = A.placeFile(A.resolvePath(BASE, d.path), name);
            A.fitLayer(l, { x: x, y: y, w: w, h: h }, d.fit || 'contain');
            if (d.opacity !== undefined) l.opacity = d.opacity;
            return l;
        }
        return A.shape(name, x, y, w, h, {
            ellipse: d.type === 'circle' || d.type === 'ellipse',
            radius: (d.radius || 0) * W,
            fill: d.fill || '#ffffff',
            opacity: d.opacity
        });
    }

    // ---------- Text block ----------
    function makeText(name, text, box, style, maxLines, minSize) {
        var size = style.size;
        var acc = A.parseAccents(String(text));      // "[word]" marks an accent range
        var layer = A.addText(name, acc.text, box, style);
        var tries = 0;
        while (A.textLines(layer, size, style.leading) > maxLines && size > minSize && tries < 8) {
            size = size * 0.92;
            layer.textItem.size = new UnitValue(size, 'px');
            layer.textItem.leading = new UnitValue(size * (style.leading || 1.1), 'px');
            tries++;
        }
        var lines = A.textLines(layer, size, style.leading);
        if (lines > maxLines) A.warnings.push(name + ': text still exceeds ' + maxLines + ' lines, shorten the copy');
        if (lines > 1 && style.balance !== false) balanceText(layer, box, style, size, lines);
        if (acc.ranges.length) A.applyAccents(layer, acc.ranges, style.accent || {});
        return layer;
    }

    // Narrows a wrapped paragraph box until just before it would add a line,
    // so lines get similar lengths (avoids a single orphan word on the last line).
    function balanceText(layer, box, style, size, lines) {
        var t = layer.textItem, w = box.w, best = box.w;
        for (var k = 0; k < 14; k++) {
            w = w * 0.96;
            t.width = new UnitValue(w, 'px');
            if (A.textLines(layer, size, style.leading) > lines) break;
            best = w;
        }
        t.width = new UnitValue(best, 'px');
        var dx = style.align === 'left' ? 0 : (style.align === 'right' ? box.w - best : (box.w - best) / 2);
        t.position = [new UnitValue(box.x + dx, 'px'), new UnitValue(box.y, 'px')];
    }

    // ---------- Header elements ----------
    // Moves a set of layers (treated as one row) so its top is at y and it is aligned within [tx, tx+tw].
    function rowPlace(layers, y, align, tx, tw) {
        var u = A.unionBounds(layers);
        if (!u) return;
        var targetX = align === 'left' ? tx : (align === 'right' ? tx + tw - u.w : tx + (tw - u.w) / 2);
        A.translateAll(layers, targetX - u.x, y - u.y);
    }

    // Logo image and/or wordmark. lg: { path, text, height (x W), textScale, font, color }
    function addLogo(lg, y, align, tx, tw, W, fonts, theme) {
        var h = (lg.height || 0.06) * W, layers = [];
        if (lg.path) {
            var img = A.placeFile(A.resolvePath(BASE, lg.path), 'Logo');
            A.fitLayer(img, { x: tx, y: y, w: W * 0.6, h: h }, 'contain');
            layers.push(img);
        }
        if (lg.text) {
            var txt = A.addPointText('Logo text', lg.text, {
                font: A.pickFont(lg.font || fonts.headline), size: h * (lg.textScale || 0.62),
                color: lg.color || theme.headlineColor || '#111111', tracking: -10
            });
            var tb = A.bounds(txt);
            if (layers.length) {
                var ib = A.bounds(layers[0]);
                txt.translate(ib.r + h * 0.28 - tb.x, (ib.y + ib.h / 2) - (tb.y + tb.h / 2));
            }
            layers.push(txt);
        }
        rowPlace(layers, y, align, tx, tw);
        return layers;
    }

    // Pill tag above the headline. eb: "Text" | { text, icon, fill, opacity, color, scale }
    function addEyebrow(eb, y, align, tx, tw, size, font) {
        if (typeof eb === 'string') eb = { text: eb };
        var s = size * (eb.scale || 1);
        var txt = A.addPointText('Eyebrow text', eb.text, { font: font, size: s, color: eb.color || '#1A1A1A', tracking: 0 });
        var tb = A.bounds(txt);
        var padX = s * 0.95, h = s * 2.1, iconW = s * 1.15, icon = null;
        if (eb.icon) icon = A.placeFile(A.resolvePath(BASE, eb.icon), 'Eyebrow icon');
        var pw = tb.w + 2 * padX + (icon ? iconW + s * 0.45 : 0);
        var pill = A.roundedRect('Eyebrow pill', tx, y, pw, h, h / 2, eb.fill || '#FFFFFF', eb.opacity === undefined ? 85 : eb.opacity);
        if (eb.outline) {
            var ol = (typeof eb.outline === 'object') ? eb.outline : {};
            A.layerEffects({ stroke: { size: Math.max(1, s * (ol.width || 0.12)), color: ol.color || eb.color || '#111111' } });
            // opacity applies to the fill only, so the outline stays visible on a transparent pill
            pill.opacity = 100;
            pill.fillOpacity = eb.opacity === undefined ? 100 : eb.opacity;
        }
        var cx = tx + padX;
        if (icon) { A.fitLayer(icon, { x: cx, y: y + (h - iconW) / 2, w: iconW, h: iconW }, 'contain'); cx += iconW + s * 0.45; }
        txt.translate(cx - tb.x, (y + h / 2) - (tb.y + tb.h / 2));
        var layers = [pill];
        if (icon) layers.push(icon);
        layers.push(txt);
        rowPlace(layers, y, align, tx, tw);
        return layers;
    }

    // ---------- Callout card ----------
    // Crops a region of an image (default: the slide screenshot), enlarges it into a rounded card with shadow.
    // c: { source, crop:{x,y,w,h} (fractions of source), x, y, w (fractions of ref box), relativeTo:"slide"|"device",
    //      radius (x card width), shadow, border:{ width (x card width), color } }
    function addCallout(c, idx, slot, devRect, shotPath, W) {
        var ref = (c.relativeTo === 'device' && devRect) ? devRect : slot;
        var src = (c.source && c.source !== 'screenshot') ? A.resolvePath(BASE, c.source) : shotPath;
        if (!src) throw new Error('Callout ' + idx + ': no source image (slide has no screenshot)');
        var crop = c.crop || { x: 0, y: 0, w: 1, h: 1 };
        var name = 'Callout ' + idx;
        var img = A.placeFile(src, name + ' image');
        var ib = A.bounds(img);
        var cardW = c.w * ref.w;
        var s = cardW / (crop.w * ib.w);
        var cardH = crop.h * ib.h * s;
        var cx = ref.x + c.x * ref.w, cy = ref.y + c.y * ref.h;
        img.resize(s * 100, s * 100, AnchorPosition.TOPLEFT);
        ib = A.bounds(img);
        img.translate(cx - crop.x * ib.w - ib.x, cy - crop.y * ib.h - ib.y);

        var r = (c.radius === undefined ? 0.06 : c.radius) * cardW;
        var layers = [];
        var shadow = c.shadow === undefined ? { opacity: 30, size: W * 0.05, distance: W * 0.015, angle: 90 }
                                            : (c.shadow ? { opacity: c.shadow.opacity || 30, size: W * (c.shadow.size || 0.05), distance: W * (c.shadow.distance || 0.015), angle: 90 } : null);
        if (c.border) {
            var bw = (c.border.width || 0.02) * cardW;
            layers.push(A.roundedRect(name + ' border', cx - bw, cy - bw, cardW + 2 * bw, cardH + 2 * bw, r + bw, c.border.color || '#FFFFFF', c.border.opacity));
            if (shadow) A.dropShadow(shadow);
        }
        layers.push(A.roundedRect(name + ' mask', cx, cy, cardW, cardH, r, '#FFFFFF'));
        if (shadow && !c.border) A.dropShadow(shadow);
        layers.push(img);
        return { layers: layers, clip: img };
    }

    // ---------- Social-proof badge ----------
    // bd: { title:"4.7", subtitle:"*****", x, y (center, fractions of slide), scale, color, laurel (bool), font }
    function addBadge(bd, ox, W, H, fonts, theme) {
        var color = bd.color || theme.headlineColor || '#111111';
        var size = W * 0.085 * (bd.scale || 1);
        var cx = ox + (bd.x === undefined ? 0.5 : bd.x) * W, cy = (bd.y === undefined ? 0.9 : bd.y) * H;
        var layers = [];
        var title = A.addPointText('Badge title', bd.title, { font: A.pickFont(bd.font || fonts.headline), size: size, color: color, tracking: -20 });
        A.centerOn(title, cx, cy);
        layers.push(title);
        if (bd.subtitle) {
            var tb = A.bounds(title);
            var st = A.addPointText('Badge subtitle', bd.subtitle, {
                font: A.pickFont(bd.subtitleFont || fonts.subheadline || fonts.headline), size: size * 0.28, color: color,
                tracking: bd.subtitleTracking === undefined ? 80 : bd.subtitleTracking
            });
            A.centerOn(st, cx, null);
            var sb = A.bounds(st);
            st.translate(0, tb.b + size * 0.2 - sb.y);
            layers.push(st);
        }
        var u = A.unionBounds(layers);
        A.translateAll(layers, 0, cy - (u.y + u.h / 2));
        if (bd.laurel !== false) layers.push(addLaurel(A.unionBounds(layers), size, bd.laurelColor || color));
        var g = A.newGroup(app.activeDocument, 'Badge');
        for (var i = 0; i < layers.length; i++) A.addToGroup(g, layers[i]);
        return g;
    }

    // Laurel wreath: two branches rising from the bottom center and curving up both sides of box u.
    function addLaurel(u, size, color) {
        var doc = app.activeDocument;
        var g = A.newGroup(doc, 'Laurel');
        var cx = u.x + u.w / 2, cy = u.y + u.h / 2;
        var Rx = u.w / 2 + size * 0.8, Ry = Math.max(u.h * 0.7, size * 0.75);
        var N = 8, from = 238, to = 140;                 // degrees on an ellipse, bottom -> upper side (left branch)
        for (var side = 0; side < 2; side++) {
            for (var k = 0; k < N; k++) {
                var deg = from + (to - from) * k / (N - 1);
                var th = deg * Math.PI / 180;
                var px = cx + Rx * Math.cos(th), py = cy - Ry * Math.sin(th);
                var sc = 0.75 + 0.35 * Math.sin(Math.PI * (k + 0.5) / N);   // bigger leaves mid-branch
                var lw = size * 0.5 * sc, lh = size * 0.2 * sc;
                // branch direction (towards decreasing angle), in screen degrees, then tilt leaf outward
                var tx = Rx * Math.sin(th), ty = Ry * Math.cos(th);   // d/d(-theta) in screen coords (y down)
                var dirDeg = Math.atan2(ty, tx) * 180 / Math.PI;
                var rot = dirDeg - 35;                                 // screen rotation, clockwise positive
                if (side === 1) { px = 2 * cx - px; rot = 180 - rot; }
                var leaf = A.shape('Leaf', px - lw / 2, py - lh / 2, lw, lh, { ellipse: true, fill: color });
                leaf.rotate(rot, AnchorPosition.MIDDLECENTER);
                A.addToGroup(g, leaf);
            }
        }
        var merged = g.merge();
        merged.name = 'Laurel';
        return merged;
    }

    // ---------- Text effects ----------
    // fx: { stroke:{ width (x font size), color, opacity }, glow:{ size (x font size), spread, color, opacity } }
    function applyTextFx(layer, fx, size) {
        if (!fx || (!fx.stroke && !fx.glow)) return;
        app.activeDocument.activeLayer = layer;
        A.layerEffects({
            stroke: fx.stroke ? { size: size * (fx.stroke.width || 0.04), color: fx.stroke.color, opacity: fx.stroke.opacity } : null,
            glow: fx.glow ? { size: size * (fx.glow.size || 0.35), spread: fx.glow.spread, color: fx.glow.color, opacity: fx.glow.opacity } : null
        });
    }

    // ---------- Benefit list ----------
    // bl: [ "text" | { text, icon } ] or { items:[...], iconFill, iconOpacity, iconColor, color, scale, width }
    function addBullets(bl, y, align, tx, tw, sSize, font, theme) {
        if (bl instanceof Array) bl = { items: bl };
        var bs = sSize * (bl.scale || 1);
        var d = bs * 2.2, gapX = bs * 0.8, gapY = bs * 0.9;
        var colW = Math.min(tw, tw * (bl.width || 1));
        var colX = align === 'left' ? tx : (align === 'right' ? tx + tw - colW : tx + (tw - colW) / 2);
        var layers = [];
        for (var k = 0; k < bl.items.length; k++) {
            var it = bl.items[k];
            if (typeof it === 'string') it = { text: it };
            var sq = bl.iconShape === 'square';
            var circle = A.shape('Bullet ' + (k + 1) + ' icon bg', colX, y, d, d, { ellipse: !sq, radius: sq ? d * 0.26 : 0, fill: bl.iconFill || '#FFFFFF', opacity: bl.iconOpacity === undefined ? 20 : bl.iconOpacity });
            layers.push(circle);
            var ic;
            if (it.icon) {
                ic = A.placeFile(A.resolvePath(BASE, it.icon), 'Bullet ' + (k + 1) + ' icon');
                A.fitLayer(ic, { x: colX + d * 0.22, y: y + d * 0.22, w: d * 0.56, h: d * 0.56 }, 'contain');
            } else {
                ic = A.addPointText('Bullet ' + (k + 1) + ' check', it.mark || '\u2713', { font: font, size: d * 0.5, color: bl.iconColor || theme.headlineColor || '#FFFFFF' });
                A.centerOn(ic, colX + d / 2, y + d / 2);
            }
            layers.push(ic);
            var txt = A.addText('Bullet ' + (k + 1) + ' text', it.text, { x: colX + d + gapX, y: y, w: colW - d - gapX, h: d * 4 },
                { font: font, size: bs, color: bl.color || theme.subColor || theme.headlineColor || '#333333', align: 'left', leading: 1.25 });
            var tb = A.bounds(txt);
            if (tb.h < d) txt.translate(0, (y + d / 2) - (tb.y + tb.h / 2));
            else txt.translate(0, y - tb.y);
            layers.push(txt);
            y = Math.max(y + d, A.bounds(txt).b) + gapY;
        }
        return layers;
    }

    // ---------- Chat bubbles ----------
    // b: { text, side:"right"|"left", x, y (x = right edge for right bubbles, left edge otherwise), w (max width),
    //      relativeTo:"slide"|"device", fill, color, scale, opacity }
    function addBubble(b, idx, slot, devRect, sSize, font) {
        var ref = (b.relativeTo === 'device' && devRect) ? devRect : slot;
        var right = b.side !== 'left';
        var s = sSize * (b.scale || 1);
        var pad = s * 0.8, maxW = (b.w || 0.7) * ref.w;
        var ax = ref.x + b.x * ref.w, ay = ref.y + b.y * ref.h;
        var txt = A.addText('Bubble ' + idx + ' text', b.text, { x: 0, y: 0, w: maxW - 2 * pad, h: s * 8 },
            { font: font, size: s, color: b.color || (right ? '#FFFFFF' : '#111318'), align: 'left', leading: 1.25 });
        var tb = A.bounds(txt);
        var bw = tb.w + 2 * pad, bh = tb.h + 2 * pad;
        var bx = right ? ax - bw : ax;
        // keep the bubble inside the slide with a small safe margin
        bx = Math.max(slot.x + slot.w * 0.04, Math.min(bx, slot.x + slot.w * 0.96 - bw));
        var rect = A.roundedRect('Bubble ' + idx, bx, ay, bw, bh, Math.min(bh / 2, s * 1.3), b.fill || (right ? '#2F8CFF' : '#FFFFFF'), b.opacity);
        A.dropShadow({ opacity: 22, size: s * 1.2, distance: s * 0.3, angle: 90 });
        txt.translate(bx + pad - tb.x, ay + pad - tb.y);
        return [rect, txt];
    }

    // ---------- Device (frame / frameless) ----------
    // Draws bezel, screen, screenshot (already placed, or null for placeholder) and Dynamic Island.
    function makeDevice(dev, t, W, shot, x, y, dW, dH, bez, label, font, name) {
        var layers = [], clips = [];
        var sw = dW - 2 * bez, sh = dH - 2 * bez;
        var defR = t.platform === 'ipad' ? 0.045 : (t.platform === 'android' ? 0.09 : 0.13);
        var sr = sw * (dev.screenRadius || defR);
        if (dev.style === 'frame') {
            layers.push(A.roundedRect(name + ' bezel', x, y, dW, dH, sr + bez, dev.bezelColor));
            if (dev.shadow) A.dropShadow(shadowOpts(dev, W));
        }
        layers.push(A.roundedRect(name + ' screen', x + bez, y + bez, sw, sh, sr, dev.screenColor || '#E9ECF2'));
        if (dev.style === 'frameless' && dev.shadow) A.dropShadow(shadowOpts(dev, W));
        if (shot) {
            A.fitLayer(shot, { x: x + bez, y: y + bez, w: sw, h: sh }, 'cover');
            layers.push(shot);
            clips.push(shot);
        } else {
            layers.push(A.addText(name + ' placeholder', label, { x: x + bez, y: y + bez + sh * 0.45, w: sw, h: sh * 0.2 },
                { font: font, size: sw * 0.07, color: '#9AA1AE', align: 'center' }));
        }
        if (dev.style === 'frame' && dev.island && t.platform === 'ios') {
            var iw = sw * 0.31, ih = sw * 0.09;
            layers.push(A.roundedRect(name + ' Dynamic Island', x + bez + (sw - iw) / 2, y + bez + sw * 0.03, iw, ih, ih / 2, '#000000'));
        }
        return { layers: layers, clips: clips };
    }

    // ---------- Feature card (drawn, not cropped) ----------
    // c: { title, text, icon, x, y, w (fractions of ref), relativeTo, fill, color, subColor, radius (x card w), scale, iconFill, iconShape }
    function addCard(c, idx, slot, devRect, W, fonts, theme) {
        var ref = (c.relativeTo === 'device' && devRect) ? devRect : slot;
        var cw = c.w * ref.w, cx = ref.x + c.x * ref.w, cy = ref.y + c.y * ref.h;
        var ts = W * 0.04 * (c.scale || 1), pad = ts * 1.1;
        var name = 'Card ' + idx, layers = [], icoW = 0;
        var inner = [];
        if (c.icon) {
            icoW = ts * 2.6;
            var sq = c.iconShape !== 'circle';
            inner.push(A.shape(name + ' icon bg', cx + pad, cy + pad, icoW, icoW, { ellipse: !sq, radius: sq ? icoW * 0.28 : 0, fill: c.iconFill || theme.accentColor || '#EEF0FF' }));
            var ic = A.placeFile(A.resolvePath(BASE, c.icon), name + ' icon');
            A.fitLayer(ic, { x: cx + pad + icoW * 0.22, y: cy + pad + icoW * 0.22, w: icoW * 0.56, h: icoW * 0.56 }, 'contain');
            inner.push(ic);
        }
        var tx = cx + pad + (icoW ? icoW + pad * 0.8 : 0), tw = cw - (tx - cx) - pad;
        var ty = cy + pad, bottom = cy + pad + icoW;
        if (c.title) {
            var tl = A.addText(name + ' title', c.title, { x: tx, y: ty, w: tw, h: ts * 6 },
                { font: A.pickFont(fonts.headline), size: ts, color: c.color || '#111318', align: 'left', leading: 1.15 });
            var tb = A.bounds(tl); tl.translate(0, ty - tb.y); tb = A.bounds(tl);
            inner.push(tl); ty = tb.b + ts * 0.45; bottom = Math.max(bottom, tb.b);
        }
        if (c.text) {
            var tt = A.addText(name + ' text', c.text, { x: tx, y: ty, w: tw, h: ts * 10 },
                { font: A.pickFont(fonts.subheadline || fonts.headline, ['SFPro-Regular', 'ArialMT']), size: ts * 0.72, color: c.subColor || '#5A6070', align: 'left', leading: 1.35 });
            var sb = A.bounds(tt); tt.translate(0, ty - sb.y); sb = A.bounds(tt);
            inner.push(tt); bottom = Math.max(bottom, sb.b);
        }
        var ch = bottom - cy + pad;
        var bg = A.roundedRect(name, cx, cy, cw, ch, (c.radius === undefined ? 0.07 : c.radius) * cw, c.fill || '#FFFFFF', c.opacity);
        A.dropShadow({ opacity: 18, size: W * 0.04, distance: W * 0.012, angle: 90 });
        layers.push(bg);
        return layers.concat(inner);
    }

    // ---------- Stat block ----------
    // st: { items:[{ value, label }], x, y (fractions of slide), align, valueColor, labelColor, scale, gap }
    function addStats(st, ox, W, H, fonts, theme) {
        var align = st.align || 'left';
        var vs = W * 0.085 * (st.scale || 1), ls = vs * 0.42;
        var ax = ox + (st.x === undefined ? 0.5 : st.x) * W, y = (st.y === undefined ? 0.5 : st.y) * H;
        var layers = [];
        for (var k = 0; k < st.items.length; k++) {
            var it = st.items[k];
            var v = A.addPointText('Stat ' + (k + 1) + ' value', it.value, { font: A.pickFont(st.font || fonts.headline), size: vs, color: st.valueColor || theme.accentColor || theme.headlineColor || '#111111', tracking: -10 });
            var l = A.addPointText('Stat ' + (k + 1) + ' label', it.label, { font: A.pickFont(fonts.subheadline || fonts.headline, ['SFPro-Regular', 'ArialMT']), size: ls, color: st.labelColor || theme.subColor || '#555555' });
            var vb = A.bounds(v);
            v.translate(0, y - vb.y); vb = A.bounds(v);
            var lb = A.bounds(l);
            l.translate(0, vb.b + vs * 0.22 - lb.y); lb = A.bounds(l);
            var pair = [v, l];
            for (var q = 0; q < 2; q++) {
                var b = A.bounds(pair[q]);
                var nx = align === 'left' ? ax : (align === 'right' ? ax - b.w : ax - b.w / 2);
                pair[q].translate(nx - b.x, 0);
            }
            layers.push(v, l);
            y = lb.b + vs * (st.gap === undefined ? 0.75 : st.gap);
        }
        return layers;
    }

    // ---------- Press / partner logo row ----------
    // lg: { title, items:[paths], y (center, fraction of H), height (x W), maxWidth (x W), gap (x height), color (tint), opacity, titleColor }
    function addLogoRow(lg, ox, W, H, fonts, theme) {
        var h = W * (lg.height || 0.035), gap = h * (lg.gap === undefined ? 1.1 : lg.gap);
        var cy = H * (lg.y === undefined ? 0.4 : lg.y);
        var imgs = [], total = 0;
        for (var k = 0; k < lg.items.length; k++) {
            var im = A.placeFile(A.resolvePath(BASE, lg.items[k]), 'Press logo ' + (k + 1));
            A.fitLayer(im, { x: ox, y: cy - h / 2, w: W * 0.4, h: h }, 'contain');
            if (lg.color) { app.activeDocument.activeLayer = im; A.layerEffects({ overlay: { color: lg.color } }); }
            if (lg.opacity !== undefined) im.opacity = lg.opacity;
            imgs.push(im);
            total += A.bounds(im).w;
        }
        total += gap * (imgs.length - 1);
        var maxW = W * (lg.maxWidth || 0.86);
        if (total > maxW) {
            var s = maxW / total;
            for (var r = 0; r < imgs.length; r++) imgs[r].resize(s * 100, s * 100, AnchorPosition.MIDDLECENTER);
            gap *= s; total = maxW;
        }
        var x = ox + (W - total) / 2;
        for (var j = 0; j < imgs.length; j++) {
            var b = A.bounds(imgs[j]);
            imgs[j].translate(x - b.x, cy - (b.y + b.h / 2));
            x += b.w + gap;
        }
        var layers = imgs.slice(0);
        if (lg.title) {
            var t = A.addPointText('Press title', lg.title, { font: A.pickFont(fonts.subheadline || fonts.headline, ['SFPro-Regular', 'ArialMT']), size: W * 0.026, color: lg.titleColor || theme.subColor || '#777777' });
            A.centerOn(t, ox + W / 2, cy - h * 1.35);
            layers.unshift(t);
        }
        return layers;
    }

    // ---------- Footnote ----------
    function addFootnote(fn, ox, W, H, font, theme) {
        if (typeof fn === 'string') fn = { text: fn };
        var size = W * 0.022 * (fn.scale || 1);
        var t = A.addText('Footnote', fn.text, { x: ox + W * 0.08, y: 0, w: W * 0.84, h: size * 6 },
            { font: font, size: size, color: fn.color || theme.subColor || '#777777', align: fn.align || 'center', leading: 1.3 });
        var b = A.bounds(t);
        t.translate(0, H * (fn.bottom === undefined ? 0.975 : fn.bottom) - b.b);
        if (fn.opacity !== undefined) t.opacity = fn.opacity;
        return t;
    }

    // Groups a device's layers (clipping kept) and rotates them together.
    function rotateDevice(doc, md, angle, name) {
        var g = A.newGroup(doc, name);
        for (var i = 0; i < md.layers.length; i++) A.addToGroup(g, md.layers[i]);
        for (var c = 0; c < md.clips.length; c++) md.clips[c].grouped = true;
        g.rotate(angle, AnchorPosition.MIDDLECENTER);
        return { layers: [g], clips: [] };
    }

    // ---------- One slide ----------
    function buildSlide(doc, cfg, t, slide, i, ox) {
        var W = t.w, H = t.h;
        var landscape = W / H > 1.05;
        // Portrait layouts (text-top / text-bottom / sandwich) don't fit landscape canvases, so those use landscapeLayout.
        var layout = landscape ? (slide.landscapeLayout || cfg.landscapeLayout || 'side')
                               : (slide.layout || cfg.layout || 'text-top');
        var typo = deepMerge(cfg.typography, slide.typography);
        var dev = deepMerge(DEFAULT_DEVICE, deepMerge(cfg.device, slide.device));
        var theme = deepMerge(cfg.theme, slide.theme);
        var fonts = cfg.fonts || {};
        var headlineText = (slide.headline instanceof Array) ? (slide.headline[0].text || slide.headline[0]) : slide.headline;
        var group = A.newGroup(doc, n2(i) + ' ' + A.slug(headlineText || slide.subheadline));
        var stack = [], clips = [];
        var slot = { x: ox, y: 0, w: W, h: H };
        var shotPath = slide.screenshot ? A.resolvePath(BASE, slide.screenshot) : null;

        // Background (per slide unless panorama)
        if (!cfg.panorama || slide.background) {
            stack.push(A.shape('Background', ox, 0, W, H, { fill: slide.background || theme.background || '#ffffff' }));
        }
        var grain = slide.grain !== undefined ? slide.grain : (!cfg.panorama ? cfg.grain : null);
        if (grain) stack.push(A.addGrain('Grain', ox, 0, W, H, (typeof grain === 'object') ? grain : {}));
        // ---- Text ----
        var margin = W * (landscape ? 0.06 : 0.07);
        var baseSize = landscape ? H * 0.10 : (t.platform === 'ipad' ? W * 0.058 : W * 0.075);
        var hSize = baseSize * (typo.headlineScale || 1);
        var sSize = hSize * (typo.subRatio || 0.56);
        var align = typo.align || (layout === 'side' ? 'left' : 'center');
        var tw = layout === 'side' ? W * 0.42 : W - 2 * margin;
        var tx = ox + margin;
        var headFont = A.pickFont(fonts.headline);
        var subFont = A.pickFont(fonts.subheadline || fonts.headline, ['SFPro-Regular', 'Inter-Regular', 'HelveticaNeue', 'ArialMT']);
        var sandwich = layout === 'sandwich';
        function up(s) { return typo.uppercase ? String(s).toUpperCase() : s; }
        var accentStyle = { color: typo.accentColor || theme.accentColor, underline: !!typo.accentUnderline };
        var bottomPad = slide.footnote ? 0.1 : 0.06;   // leave room for the footnote under bottom-aligned text

        // Watermark: huge faint text behind everything except the background
        if (slide.watermark) {
            var wm = (typeof slide.watermark === 'string') ? { text: slide.watermark } : slide.watermark;
            var wl = A.addPointText('Watermark', up(wm.text), {
                font: A.pickFont(wm.font || fonts.headline), size: W * (wm.size || 0.3),
                color: wm.color || theme.headlineColor || '#FFFFFF', opacity: wm.opacity === undefined ? 10 : wm.opacity, tracking: -20
            });
            A.centerOn(wl, ox + W / 2, H * (wm.y === undefined ? 0.14 : wm.y));
            stack.push(wl);
            if (stack.length >= 2 && stack[0].name === 'Background' && !grain) clips.push(wl); // clip to this slide's background so it can't spill into neighbours
        }
        var decos = slide.decorations || [];
        for (var di = 0; di < decos.length; di++) stack.push(addDecoration(decos[di], ox, W, H, 'Deco ' + (di + 1)));

        var topLayers = [], bottomLayers = [];
        var y = H * (typo.top || 0.065);

        var logo = slide.logo === true ? cfg.logo : slide.logo;
        if (logo) {
            var ll = addLogo(logo, y, align, tx, tw, W, fonts, theme);
            topLayers = topLayers.concat(ll);
            y = A.unionBounds(ll).b + hSize * 0.45;
        }
        if (slide.eyebrow) {
            var el = addEyebrow(slide.eyebrow, y, align, tx, tw, sSize * 0.8, subFont);
            topLayers = topLayers.concat(el);
            y = A.unionBounds(el).b + hSize * 0.4;
        }
        function makeSub(yy) {
            return makeText('Subheadline', slide.subheadline, { x: tx, y: yy, w: tw, h: H * 0.25 },
                { font: subFont, size: sSize, color: theme.subColor || theme.headlineColor || '#444444', align: align, leading: 1.25, tracking: 0, balance: false,
                  accent: { color: theme.accentColor, underline: false } },
                typo.subMaxLines || 3, sSize * 0.7);
        }
        // Headline: a string, or an array of parts with their own scale / color / font (mixed sizes).
        function makeHeadline(yy) {
            var parts = (slide.headline instanceof Array) ? slide.headline : [{ text: slide.headline }];
            var out = [], py = yy;
            for (var p = 0; p < parts.length; p++) {
                var part = (typeof parts[p] === 'string') ? { text: parts[p] } : parts[p];
                var ps = hSize * (part.scale || 1);
                var hl = makeText(parts.length > 1 ? 'Headline ' + (p + 1) : 'Headline', up(part.text), { x: tx, y: py, w: tw, h: H * 0.35 },
                    { font: part.font ? A.pickFont(part.font) : headFont, size: ps, color: part.color || theme.headlineColor || '#111111', align: align,
                      leading: typo.leading || 1.08, tracking: typo.tracking === undefined ? -10 : typo.tracking, accent: accentStyle },
                    parts.length > 1 ? 1 : (typo.maxLines || 2), ps * 0.6);
                applyTextFx(hl, typo.effects, ps);
                out.push(hl);
                py = A.bounds(hl).b + hSize * (typo.partGap === undefined ? 0.12 : typo.partGap);
            }
            return out;
        }
        if (sandwich && slide.subheadline) {
            var sub0 = makeSub(y);
            topLayers.push(sub0);
            y = A.bounds(sub0).b + hSize * 0.35;
        }
        if (slide.headline) {
            var heads = makeHeadline(y);
            if (sandwich) bottomLayers = bottomLayers.concat(heads);
            else { topLayers = topLayers.concat(heads); y = A.unionBounds(heads).b + hSize * 0.35; }
        }
        if (!sandwich && slide.subheadline) {
            var sub1 = makeSub(y);
            topLayers.push(sub1);
            y = A.bounds(sub1).b + hSize * 0.5;
        }
        if (slide.bullets) {
            var bl = addBullets(slide.bullets, y, align, tx, tw, sSize, subFont, theme);
            topLayers = topLayers.concat(bl);
            y = A.unionBounds(bl).b + hSize * 0.5;
        }
        if (slide.pressLogos && slide.pressLogos.y === undefined) {
            var pl = addLogoRow(slide.pressLogos, ox, W, H, fonts, theme);
            var pu = A.unionBounds(pl);
            A.translateAll(pl, 0, y + hSize * 0.3 - pu.y);
            topLayers = topLayers.concat(pl);
        }

        var tu = A.unionBounds(topLayers);
        if (tu && layout === 'text-bottom') A.translateAll(topLayers, 0, (H - H * bottomPad - tu.h) - tu.y);
        else if (tu && layout === 'side') A.translateAll(topLayers, 0, (H - tu.h) / 2 - tu.y);
        var bu = A.unionBounds(bottomLayers);
        if (bu) A.translateAll(bottomLayers, 0, (H - H * bottomPad - bu.h) - bu.y);
        tu = A.unionBounds(topLayers);
        bu = A.unionBounds(bottomLayers);
        var textTop = tu ? tu.y : H * 0.065, textBottom = tu ? tu.b : H * 0.065;

        // ---- Device ----
        var devLayers = [], devRect = null;
        if (dev.style !== 'none') {
            var gap = H * 0.035;
            var area, anchor;
            if (layout === 'text-bottom') { area = { x: ox, y: H * 0.05, w: W, h: textTop - gap - H * 0.05 }; anchor = 'bottom'; }
            else if (layout === 'side') { area = { x: ox + W * 0.5, y: H * 0.08, w: W * 0.44, h: H * 0.84 }; anchor = dev.bleed ? 'top' : 'center'; if (dev.bleed) area.y = H * 0.16; }
            else if (layout === 'device-only') { area = { x: ox, y: H * 0.05, w: W, h: H * 0.9 }; anchor = 'center'; }
            else if (sandwich) {
                var st = tu ? tu.b + gap : H * 0.05, sbm = bu ? bu.y - gap : H * 0.95;
                area = { x: ox, y: st, w: W, h: sbm - st }; anchor = 'center';
            }
            else { var top = tu ? textBottom + gap * 1.4 : H * 0.08; area = { x: ox, y: top, w: W, h: H - top - H * 0.04 }; anchor = 'top'; }

            var defScale = t.platform === 'ipad' ? 0.80 : 0.76;
            var maxW = layout === 'side' ? area.w : W * (dev.scale || defScale);
            var aspect;

            if (dev.style === 'mockup') {
                if (!shotPath) throw new Error('Slide ' + (i + 1) + ': mockup style needs a screenshot');
                var mk = deepMerge(dev.mockup, {});
                mk.psd = A.resolvePath(BASE, mk.psd);
                var tmp = Folder.temp.fsName + '/asd_mockup_' + i + '.png';
                A.renderMockup(mk, shotPath, tmp);
                var mock = A.placeFile(tmp, 'Device (mockup)');
                var mb = A.bounds(mock);
                aspect = mb.w / mb.h;
                var mw = maxW, mh = mw / aspect;
                if (!dev.bleed && mh > area.h) { mh = area.h; mw = mh * aspect; }
                var my = anchor === 'bottom' ? area.y + area.h - mh : (anchor === 'center' ? area.y + (area.h - mh) / 2 : area.y);
                devRect = { x: area.x + (area.w - mw) / 2 + (slide.deviceOffsetX || 0) * W, y: my, w: mw, h: mh };
                A.fitLayer(mock, devRect, 'contain');
                if (dev.shadow) { doc.activeLayer = mock; A.dropShadow(shadowOpts(dev, W)); }
                devLayers.push(mock);
            } else {
                var shot = null;
                if (shotPath) {
                    shot = A.placeFile(shotPath, 'Screenshot');
                    var sb = A.bounds(shot);
                    aspect = sb.w / sb.h;
                } else {
                    aspect = t.platform === 'ipad' ? 0.75 : 0.4603;
                    A.warnings.push('Slide ' + (i + 1) + ': no screenshot, placeholder used');
                }
                var bez = dev.style === 'frame' ? maxW * dev.bezel : 0;
                var dW = maxW, dH = (dW - 2 * bez) / aspect + 2 * bez;
                if (!dev.bleed && dH > area.h) { var s = area.h / dH; dW *= s; dH *= s; bez *= s; }
                var dx = area.x + (area.w - dW) / 2 + (slide.deviceOffsetX || 0) * W;
                var dyy = anchor === 'bottom' ? area.y + area.h - dH : (anchor === 'center' ? area.y + (area.h - dH) / 2 : area.y);
                devRect = { x: dx, y: dyy, w: dW, h: dH };
                var md = makeDevice(dev, t, W, shot, dx, dyy, dW, dH, bez, slide.placeholderLabel || ('Screen ' + n2(i)), subFont, 'Device');
                if (dev.rotate) md = rotateDevice(doc, md, dev.rotate, 'Device');
                devLayers = devLayers.concat(md.layers);
                clips = clips.concat(md.clips);

                // Second, overlapping device. sd: { screenshot, scale (x main device width), x, y (top-left, fractions of main device), placeholderLabel }
                if (slide.secondDevice) {
                    var sd = slide.secondDevice;
                    var shot2 = sd.screenshot ? A.placeFile(A.resolvePath(BASE, sd.screenshot), 'Screenshot 2') : null;
                    var asp2 = shot2 ? A.bounds(shot2).w / A.bounds(shot2).h : aspect;
                    var dW2 = dW * (sd.scale || 0.6);
                    var bez2 = dev.style === 'frame' ? dW2 * dev.bezel : 0;
                    var dH2 = (dW2 - 2 * bez2) / asp2 + 2 * bez2;
                    var x2 = dx + (sd.x === undefined ? 0.55 : sd.x) * dW, y2 = dyy + (sd.y === undefined ? 0.3 : sd.y) * dH;
                    var md2 = makeDevice(dev, t, W, shot2, x2, y2, dW2, dH2, bez2, sd.placeholderLabel || 'Screen 2', subFont, 'Device 2');
                    var rot2 = sd.rotate !== undefined ? sd.rotate : dev.rotate;
                    if (rot2) md2 = rotateDevice(doc, md2, rot2, 'Device 2');
                    devLayers = devLayers.concat(md2.layers);
                    clips = clips.concat(md2.clips);
                }
            }
        }

        // ---- Callout cards ----
        var calloutLayers = [];
        var callouts = slide.callouts || [];
        for (var ci = 0; ci < callouts.length; ci++) {
            var co = addCallout(callouts[ci], ci + 1, slot, devRect, shotPath, W);
            calloutLayers = calloutLayers.concat(co.layers);
            clips.push(co.clip);
        }

        // ---- Chat bubbles ----
        var bubbles = slide.bubbles || [];
        for (var bi = 0; bi < bubbles.length; bi++) calloutLayers = calloutLayers.concat(addBubble(bubbles[bi], bi + 1, slot, devRect, sSize, subFont));

        // ---- Feature cards ----
        var cards = slide.cards || [];
        for (var ki = 0; ki < cards.length; ki++) calloutLayers = calloutLayers.concat(addCard(cards[ki], ki + 1, slot, devRect, W, fonts, theme));

        // ---- Badge, stats, press logos, footnote ----
        var extra = [];
        if (slide.stats) extra = extra.concat(addStats(slide.stats, ox, W, H, fonts, theme));
        if (slide.pressLogos && slide.pressLogos.y !== undefined) extra = extra.concat(addLogoRow(slide.pressLogos, ox, W, H, fonts, theme));
        if (slide.footnote) extra.push(addFootnote(slide.footnote, ox, W, H, subFont, theme));
        if (slide.badge) extra.push(addBadge(slide.badge, ox, W, H, fonts, theme));

        // ---- Stack order: background -> decorations/watermark -> device -> callouts/bubbles -> text -> badge ----
        stack = stack.concat(devLayers).concat(calloutLayers).concat(topLayers).concat(bottomLayers).concat(extra);
        for (var si = 0; si < stack.length; si++) A.addToGroup(group, stack[si]);
        for (var cl = 0; cl < clips.length; cl++) clips[cl].grouped = true; // clip image to the shape just below
        return group;
    }

    function shadowOpts(dev, W) {
        var s = (typeof dev.shadow === 'object') ? dev.shadow : {};
        return { opacity: s.opacity === undefined ? 35 : s.opacity, size: W * (s.size || 0.05), distance: W * (s.distance || 0.02), angle: 90, color: s.color || '#000000' };
    }

    // ---------- One target ----------
    function buildTarget(tdef) {
        var t = A.resolveTarget(tdef);
        var cfg = deepMerge(spec, (spec.targetOverrides || {})[t.id]);
        var slides = t.single ? [cfg.featureGraphic || cfg.slides[0]] : cfg.slides;
        if (!slides || !slides.length) throw new Error('No slides in spec');
        var N = slides.length, W = t.w, H = t.h;

        var doc = app.documents.add(W * N, H, 72, (spec.project || 'app') + '_' + t.id, NewDocumentMode.RGB, DocumentFill.WHITE);
        try {
            if (cfg.panorama) {
                var bg = A.shape('Panorama background', 0, 0, W * N, H, { fill: (cfg.theme && cfg.theme.background) || '#ffffff' });
                if (cfg.grain) A.addGrain('Panorama grain', 0, 0, W * N, H, (typeof cfg.grain === 'object') ? cfg.grain : {});
                var pdecos = cfg.decorations || [];
                if (pdecos.length) {
                    var dg = A.newGroup(doc, 'Panorama decorations');
                    for (var d = 0; d < pdecos.length; d++) A.addToGroup(dg, addDecoration(pdecos[d], 0, W, H, 'Deco ' + (d + 1)));
                }
            }
            for (var i = 0; i < N; i++) {
                var g = buildSlide(doc, cfg, t, slides[i], i, i * W);
                g.move(doc.layers[0], ElementPlacement.PLACEBEFORE);
            }

            var dir = OUT + '/' + t.id;
            A.ensureFolder(OUT + '/psd');
            A.ensureFolder(dir);
            A.savePSD(doc, OUT + '/psd/' + t.id + '.psd');

            var files = [];
            for (var j = 0; j < N; j++) {
                var p = dir + '/' + n2(j) + '_' + A.slug(slides[j].headline) + '.png';
                A.exportSlice(doc, j * W, 0, W, H, p);
                files.push(p);
            }
            // Overview strip for quick visual review
            var ov = doc.duplicate('overview', true);
            try {
                ov.flatten();
                var ow = Math.min(2400, W * N);
                ov.resizeImage(new UnitValue(ow, 'px'), new UnitValue(Math.round(H * ow / (W * N)), 'px'), 72, ResampleMethod.BICUBIC);
                var jo = new JPEGSaveOptions();
                jo.quality = 9;
                ov.saveAs(new File(dir + '/_overview.jpg'), jo, true, Extension.LOWERCASE);
            } finally { ov.close(SaveOptions.DONOTSAVECHANGES); }

            report.targets.push({ id: t.id, size: W + 'x' + H, count: N, psd: OUT + '/psd/' + t.id + '.psd', files: files });
        } finally {
            if (!spec.keepOpen) doc.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    var prefs = A.pushPrefs();
    try {
        var targets = spec.targets || ['ios-6.9'];
        for (var ti = 0; ti < targets.length; ti++) buildTarget(targets[ti]);
        return 'OK ' + A.stringify(report);
    } catch (e) {
        return 'ERROR: ' + e.message + (e.line ? ' (line ' + e.line + ')' : '') + ' ' + A.stringify({ warnings: A.warnings });
    } finally {
        A.popPrefs(prefs);
    }
})();
