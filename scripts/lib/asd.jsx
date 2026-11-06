// asd.jsx: App Screenshot Designer helper library for Photoshop (ExtendScript).
// Load with: $.evalFile(new File("<path>/scripts/lib/asd.jsx"));
// All coordinates are in pixels; documents are created at 72 ppi so 1pt == 1px.

var ASD = ASD || {};

(function (A) {
    function cTID(s) { return app.charIDToTypeID(s); }
    function sTID(s) { return app.stringIDToTypeID(s); }
    A.cTID = cTID;
    A.sTID = sTID;
    A.warnings = [];

    // ---------- Targets ----------
    A.TARGETS = {
        'ios-6.9':        { w: 1320, h: 2868, platform: 'ios' },
        'ios-6.5':        { w: 1284, h: 2778, platform: 'ios' },
        'ipad-13':        { w: 2064, h: 2752, platform: 'ipad' },
        'android-phone':  { w: 1080, h: 1920, platform: 'android' },
        'android-tablet': { w: 1600, h: 2560, platform: 'android' },
        'play-feature':   { w: 1024, h: 500,  platform: 'android', single: true },
        'showcase-16x9':  { w: 1920, h: 1080, platform: 'ios' },
        'showcase-1x1':   { w: 1080, h: 1080, platform: 'ios' },
        'showcase-4x5':   { w: 1080, h: 1350, platform: 'ios' }
    };

    A.resolveTarget = function (t) {
        if (typeof t === 'string') {
            var d = A.TARGETS[t];
            if (!d) throw new Error('Unknown target: ' + t);
            return { id: t, w: d.w, h: d.h, platform: d.platform, single: !!d.single };
        }
        if (!t.id || !t.w || !t.h) throw new Error('Custom target needs id, w, h');
        return { id: t.id, w: t.w, h: t.h, platform: t.platform || 'ios', single: !!t.single };
    };

    // ---------- Utils ----------
    A.extend = function () {
        var out = {};
        for (var i = 0; i < arguments.length; i++) {
            var o = arguments[i];
            if (!o) continue;
            for (var k in o) if (o.hasOwnProperty(k)) out[k] = o[k];
        }
        return out;
    };

    A.readJSON = function (file) {
        var f = (file instanceof File) ? file : new File(file);
        if (!f.exists) throw new Error('File not found: ' + f.fsName);
        f.encoding = 'UTF8';
        f.open('r');
        var s = f.read();
        f.close();
        if (s.charCodeAt(0) === 0xFEFF) s = s.substring(1);
        return eval('(' + s + ')');
    };

    A.stringify = function (v) {
        if (v === null || v === undefined) return 'null';
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (typeof v === 'string') return '"' + v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '"';
        if (v instanceof Array) {
            var a = [];
            for (var i = 0; i < v.length; i++) a.push(A.stringify(v[i]));
            return '[' + a.join(',') + ']';
        }
        var parts = [];
        for (var k in v) if (v.hasOwnProperty(k)) parts.push(A.stringify(k) + ':' + A.stringify(v[k]));
        return '{' + parts.join(',') + '}';
    };

    A.ensureFolder = function (path) {
        var f = new Folder(path);
        if (!f.exists) f.create();
        return f;
    };

    A.resolvePath = function (base, p) {
        if (!p) return null;
        if (p.charAt(0) === '/' || p.charAt(0) === '~') return p;
        return base + '/' + p;
    };

    A.slug = function (s) {
        s = String(s || '').toLowerCase();
        var from = '\u00e0\u00e1\u1ea1\u1ea3\u00e3\u00e2\u1ea7\u1ea5\u1ead\u1ea9\u1eab\u0103\u1eb1\u1eaf\u1eb7\u1eb3\u1eb5\u00e8\u00e9\u1eb9\u1ebb\u1ebd\u00ea\u1ec1\u1ebf\u1ec7\u1ec3\u1ec5\u00ec\u00ed\u1ecb\u1ec9\u0129\u00f2\u00f3\u1ecd\u1ecf\u00f5\u00f4\u1ed3\u1ed1\u1ed9\u1ed5\u1ed7\u01a1\u1edd\u1edb\u1ee3\u1edf\u1ee1\u00f9\u00fa\u1ee5\u1ee7\u0169\u01b0\u1eeb\u1ee9\u1ef1\u1eed\u1eef\u1ef3\u00fd\u1ef5\u1ef7\u1ef9\u0111'; // Vietnamese vowels (escaped: evalFile does not read UTF-8)
        var to   = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd';
        var out = '';
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i), j = from.indexOf(c);
            out += (j >= 0) ? to.charAt(j) : c;
        }
        out = out.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return out.substring(0, 40) || 'slide';
    };

    // ---------- Color ----------
    A.hexToRgb = function (hex) {
        hex = String(hex).replace('#', '');
        if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        return { r: parseInt(hex.substring(0, 2), 16), g: parseInt(hex.substring(2, 4), 16), b: parseInt(hex.substring(4, 6), 16) };
    };

    A.solidColor = function (hex) {
        var c = A.hexToRgb(hex), sc = new SolidColor();
        sc.rgb.red = c.r; sc.rgb.green = c.g; sc.rgb.blue = c.b;
        return sc;
    };

    function rgbDesc(hex) {
        var c = A.hexToRgb(hex), d = new ActionDescriptor();
        d.putDouble(cTID('Rd  '), c.r);
        d.putDouble(cTID('Grn '), c.g);
        d.putDouble(cTID('Bl  '), c.b);
        return d;
    }

    // ---------- Fills & shapes ----------
    // fill: "#hex" | { type:"solid", color } | { type:"gradient", angle, stops:["#a","#b"] | [{color,location}] }
    function fillTypeDesc(fill) {
        if (typeof fill === 'string') fill = { type: 'solid', color: fill };
        var td = new ActionDescriptor();
        if (fill.type === 'gradient') {
            td.putBoolean(cTID('Algn'), true);
            td.putUnitDouble(cTID('Angl'), cTID('#Ang'), fill.angle === undefined ? 90 : fill.angle);
            td.putEnumerated(cTID('Type'), cTID('GrdT'), fill.radial ? cTID('Rdl ') : cTID('Lnr '));
            var g = new ActionDescriptor();
            g.putString(cTID('Nm  '), 'Custom');
            g.putEnumerated(cTID('GrdF'), cTID('GrdF'), cTID('CstS'));
            g.putDouble(cTID('Intr'), 4096);
            var clrs = new ActionList(), stops = fill.stops || ['#000000', '#ffffff'];
            for (var i = 0; i < stops.length; i++) {
                var st = (typeof stops[i] === 'string') ? { color: stops[i], location: i / (stops.length - 1) } : stops[i];
                var s = new ActionDescriptor();
                s.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(st.color));
                s.putEnumerated(cTID('Type'), cTID('Clry'), cTID('UsrS'));
                s.putInteger(cTID('Lctn'), Math.round(st.location * 4096));
                s.putInteger(cTID('Mdpn'), 50);
                clrs.putObject(cTID('Clrt'), s);
            }
            g.putList(cTID('Clrs'), clrs);
            var trns = new ActionList();
            for (var j = 0; j < 2; j++) {
                var t = new ActionDescriptor();
                t.putUnitDouble(cTID('Opct'), cTID('#Prc'), 100);
                t.putInteger(cTID('Lctn'), j * 4096);
                t.putInteger(cTID('Mdpn'), 50);
                trns.putObject(cTID('TrnS'), t);
            }
            g.putList(cTID('Trns'), trns);
            td.putObject(cTID('Grad'), cTID('Grdn'), g);
            return { cls: sTID('gradientLayer'), desc: td };
        }
        td.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(fill.color || '#000000'));
        return { cls: sTID('solidColorLayer'), desc: td };
    }

    // Creates a shape layer (rounded rect or ellipse) filled with a solid color or gradient.
    A.shape = function (name, x, y, w, h, opts) {
        opts = opts || {};
        var r = Math.max(0, Math.min(opts.radius || 0, w / 2, h / 2));
        var desc = new ActionDescriptor(), ref = new ActionReference();
        ref.putClass(sTID('contentLayer'));
        desc.putReference(cTID('null'), ref);
        var ld = new ActionDescriptor(), ft = fillTypeDesc(opts.fill || '#000000');
        ld.putObject(cTID('Type'), ft.cls, ft.desc);
        var shp = new ActionDescriptor();
        if (!opts.ellipse) shp.putInteger(sTID('unitValueQuadVersion'), 1);
        shp.putUnitDouble(cTID('Top '), cTID('#Pxl'), y);
        shp.putUnitDouble(cTID('Left'), cTID('#Pxl'), x);
        shp.putUnitDouble(cTID('Btom'), cTID('#Pxl'), y + h);
        shp.putUnitDouble(cTID('Rght'), cTID('#Pxl'), x + w);
        if (!opts.ellipse && r > 0) {
            shp.putUnitDouble(sTID('topRight'), cTID('#Pxl'), r);
            shp.putUnitDouble(sTID('topLeft'), cTID('#Pxl'), r);
            shp.putUnitDouble(sTID('bottomLeft'), cTID('#Pxl'), r);
            shp.putUnitDouble(sTID('bottomRight'), cTID('#Pxl'), r);
        }
        ld.putObject(cTID('Shp '), opts.ellipse ? cTID('Elps') : cTID('Rctn'), shp);
        desc.putObject(cTID('Usng'), sTID('contentLayer'), ld);
        executeAction(cTID('Mk  '), desc, DialogModes.NO);
        var layer = app.activeDocument.activeLayer;
        layer.name = name;
        if (opts.opacity !== undefined) layer.opacity = opts.opacity;
        return layer;
    };

    A.roundedRect = function (name, x, y, w, h, radius, fill, opacity) {
        return A.shape(name, x, y, w, h, { radius: radius, fill: fill, opacity: opacity });
    };

    // ---------- Layer effects ----------
    // Applies a drop shadow to the active layer.
    A.dropShadow = function (o) {
        o = o || {};
        var d = new ActionDescriptor(), ref = new ActionReference();
        ref.putProperty(cTID('Prpr'), cTID('Lefx'));
        ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
        d.putReference(cTID('null'), ref);
        var fx = new ActionDescriptor();
        fx.putUnitDouble(cTID('Scl '), cTID('#Prc'), 100);
        var ds = new ActionDescriptor();
        ds.putBoolean(cTID('enab'), true);
        ds.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Mltp'));
        ds.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(o.color || '#000000'));
        ds.putUnitDouble(cTID('Opct'), cTID('#Prc'), o.opacity === undefined ? 35 : o.opacity);
        ds.putBoolean(cTID('uglg'), false);
        ds.putUnitDouble(cTID('lagl'), cTID('#Ang'), o.angle === undefined ? 90 : o.angle);
        ds.putUnitDouble(cTID('Dstn'), cTID('#Pxl'), Math.min(30000, o.distance || 0));
        ds.putUnitDouble(cTID('Ckmt'), cTID('#Pxl'), 0);
        ds.putUnitDouble(cTID('blur'), cTID('#Pxl'), Math.min(250, Math.max(0, o.size || 0)));
        fx.putObject(cTID('DrSh'), cTID('DrSh'), ds);
        d.putObject(cTID('T   '), cTID('Lefx'), fx);
        executeAction(cTID('setd'), d, DialogModes.NO);
    };

    // Applies several layer effects at once to the active layer (replaces existing effects).
    // o: { stroke:{size,color,opacity}, glow:{size,spread,color,opacity}, shadow:{size,distance,angle,color,opacity} }  sizes in px
    A.layerEffects = function (o) {
        var d = new ActionDescriptor(), ref = new ActionReference();
        ref.putProperty(cTID('Prpr'), cTID('Lefx'));
        ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
        d.putReference(cTID('null'), ref);
        var fx = new ActionDescriptor();
        fx.putUnitDouble(cTID('Scl '), cTID('#Prc'), 100);
        if (o.stroke) {
            var st = new ActionDescriptor();
            st.putBoolean(cTID('enab'), true);
            st.putEnumerated(cTID('Styl'), cTID('FStl'), cTID('OutF'));
            st.putEnumerated(cTID('PntT'), cTID('FrFl'), cTID('SClr'));
            st.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
            st.putUnitDouble(cTID('Opct'), cTID('#Prc'), o.stroke.opacity === undefined ? 100 : o.stroke.opacity);
            st.putUnitDouble(cTID('Sz  '), cTID('#Pxl'), Math.min(250, Math.max(1, o.stroke.size || 4)));
            st.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(o.stroke.color || '#FFFFFF'));
            fx.putObject(cTID('FrFX'), cTID('FrFX'), st);
        }
        if (o.glow) {
            var gl = new ActionDescriptor();
            gl.putBoolean(cTID('enab'), true);
            gl.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Scrn'));
            gl.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(o.glow.color || '#FFFFFF'));
            gl.putUnitDouble(cTID('Opct'), cTID('#Prc'), o.glow.opacity === undefined ? 75 : o.glow.opacity);
            gl.putEnumerated(cTID('GlwT'), cTID('BETE'), cTID('SfBL'));
            gl.putUnitDouble(cTID('Ckmt'), cTID('#Prc'), o.glow.spread || 10);
            gl.putUnitDouble(cTID('blur'), cTID('#Pxl'), Math.min(250, Math.max(1, o.glow.size || 20)));
            gl.putUnitDouble(cTID('Nose'), cTID('#Prc'), 0);
            gl.putUnitDouble(cTID('Inpr'), cTID('#Prc'), 50);
            fx.putObject(cTID('OrGl'), cTID('OrGl'), gl);
        }
        if (o.overlay) {
            var ov = new ActionDescriptor();
            ov.putBoolean(cTID('enab'), true);
            ov.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Nrml'));
            ov.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(o.overlay.color || '#FFFFFF'));
            ov.putUnitDouble(cTID('Opct'), cTID('#Prc'), o.overlay.opacity === undefined ? 100 : o.overlay.opacity);
            fx.putObject(cTID('SoFi'), cTID('SoFi'), ov);
        }
        if (o.shadow) {
            var ds = new ActionDescriptor();
            ds.putBoolean(cTID('enab'), true);
            ds.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Mltp'));
            ds.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(o.shadow.color || '#000000'));
            ds.putUnitDouble(cTID('Opct'), cTID('#Prc'), o.shadow.opacity === undefined ? 35 : o.shadow.opacity);
            ds.putBoolean(cTID('uglg'), false);
            ds.putUnitDouble(cTID('lagl'), cTID('#Ang'), o.shadow.angle === undefined ? 90 : o.shadow.angle);
            ds.putUnitDouble(cTID('Dstn'), cTID('#Pxl'), o.shadow.distance || 0);
            ds.putUnitDouble(cTID('Ckmt'), cTID('#Pxl'), 0);
            ds.putUnitDouble(cTID('blur'), cTID('#Pxl'), Math.min(250, Math.max(0, o.shadow.size || 0)));
            fx.putObject(cTID('DrSh'), cTID('DrSh'), ds);
        }
        d.putObject(cTID('T   '), cTID('Lefx'), fx);
        executeAction(cTID('setd'), d, DialogModes.NO);
    };

    // ---------- Groups ----------
    A.newGroup = function (doc, name) {
        var g = doc.layerSets.add();
        g.name = name;
        return g;
    };

    // Moves `layer` to the top of `group`.
    A.addToGroup = function (group, layer) {
        if (group.layers.length === 0) layer.move(group, ElementPlacement.INSIDE);
        else layer.move(group.layers[0], ElementPlacement.PLACEBEFORE);
        return layer;
    };

    // ---------- Bounds ----------
    A.bounds = function (layer) {
        var b = layer.bounds;
        var l = b[0].as('px'), t = b[1].as('px'), r = b[2].as('px'), bt = b[3].as('px');
        return { x: l, y: t, w: r - l, h: bt - t, r: r, b: bt };
    };

    // Scale + move a layer so it fits (contain) or fills (cover) a box.
    A.fitLayer = function (layer, box, mode) {
        var b = A.bounds(layer);
        if (b.w <= 0 || b.h <= 0) return;
        var sx = box.w / b.w, sy = box.h / b.h;
        var s = (mode === 'cover') ? Math.max(sx, sy) : Math.min(sx, sy);
        layer.resize(s * 100, s * 100, AnchorPosition.MIDDLECENTER);
        b = A.bounds(layer);
        layer.translate((box.x + box.w / 2) - (b.x + b.w / 2), (box.y + box.h / 2) - (b.y + b.h / 2));
    };

    // ---------- Place / smart objects ----------
    A.placeFile = function (path, name) {
        var f = new File(path);
        if (!f.exists) throw new Error('Image not found: ' + f.fsName);
        var d = new ActionDescriptor();
        d.putPath(cTID('null'), f);
        d.putEnumerated(cTID('FTcs'), cTID('QCSt'), cTID('Qcsa'));
        executeAction(cTID('Plc '), d, DialogModes.NO);
        var layer = app.activeDocument.activeLayer;
        if (name) layer.name = name;
        return layer;
    };

    // Finds a layer by name, or by path "Group/Sub/Layer" when names repeat.
    A.findLayer = function (container, name) {
        if (name.indexOf('/') >= 0) {
            var parts = name.split('/'), cur = container;
            for (var p = 0; p < parts.length; p++) {
                var found = null;
                for (var j = 0; j < cur.layers.length; j++) if (cur.layers[j].name === parts[p]) { found = cur.layers[j]; break; }
                if (!found) return null;
                cur = found;
            }
            return cur;
        }
        for (var i = 0; i < container.layers.length; i++) {
            var l = container.layers[i];
            if (l.name === name) return l;
            if (l.typename === 'LayerSet') {
                var f = A.findLayer(l, name);
                if (f) return f;
            }
        }
        return null;
    };

    // Puts an image into a smart object. mode "edit" (default): open the contents, place the image
    // scaled to fill the smart object canvas, hide the old contents, save. mode "replace": Replace Contents.
    A.replaceSmartObject = function (doc, layerName, imagePath, mode, fit) {
        var layer = A.findLayer(doc, layerName);
        if (!layer) throw new Error('Smart object layer "' + layerName + '" not found in mockup');
        doc.activeLayer = layer;
        if (mode === 'replace') {
            var d = new ActionDescriptor();
            d.putPath(cTID('null'), new File(imagePath));
            executeAction(sTID('placedLayerReplaceContents'), d, DialogModes.NO);
            return layer;
        }
        executeAction(sTID('placedLayerEditContents'), new ActionDescriptor(), DialogModes.NO);
        var inner = app.activeDocument;
        try {
            var W = inner.width.as('px'), H = inner.height.as('px');
            var img = A.placeFile(imagePath, 'Screenshot');
            A.fitLayer(img, { x: 0, y: 0, w: W, h: H }, fit || 'cover');
            for (var i = 0; i < inner.layers.length; i++) if (inner.layers[i] !== img) inner.layers[i].visible = false;
        } finally {
            inner.close(SaveOptions.SAVECHANGES);
        }
        app.activeDocument = doc;
        return layer;
    };

    // Changes the color of a solid-color fill layer.
    A.setSolidFill = function (doc, layer, hex) {
        doc.activeLayer = layer;
        var d = new ActionDescriptor(), r = new ActionReference();
        r.putEnumerated(sTID('contentLayer'), cTID('Ordn'), cTID('Trgt'));
        d.putReference(cTID('null'), r);
        var c = new ActionDescriptor();
        c.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(hex));
        d.putObject(cTID('T   '), sTID('solidColorLayer'), c);
        executeAction(cTID('setd'), d, DialogModes.NO);
    };

    // Renders a mockup PSD with the screenshot inside and returns the path of a transparent PNG.
    // mockup: { psd, smartObject, hideLayers[], colorLayer, color, crop (true), cropPad (x screen width), replaceMode, fit }
    A.renderMockup = function (mockup, screenshotPath, tmpPath) {
        var src = app.open(new File(mockup.psd));
        try {
            var so = A.replaceSmartObject(src, mockup.smartObject || 'SCREEN', screenshotPath, mockup.replaceMode, mockup.fit);
            var sb = A.bounds(so);
            var hide = (mockup.hideLayers || []).slice(0);
            // the mockup's own shadows can be switched off (e.g. gray shadows glow on dark backgrounds)
            if (mockup.nativeShadow === false) hide = hide.concat(mockup.shadowLayers || []);
            for (var i = 0; i < hide.length; i++) {
                var hl = A.findLayer(src, hide[i]);
                if (hl) hl.visible = false;
                else A.warnings.push('Mockup: layer "' + hide[i] + '" not found');
            }
            // Body color rule: only "white" or "black" unless customColor is set.
            var bodyColor = mockup.color;
            if (bodyColor) {
                var palette = mockup.colors || { white: '#FFFFFF', black: '#1B1C22' };
                var key = String(bodyColor).toLowerCase();
                if (palette[key]) bodyColor = palette[key];
                else if (!mockup.customColor) {
                    A.warnings.push('Mockup color "' + mockup.color + '" is not allowed (use "white" or "black", or set customColor: true); using white');
                    bodyColor = palette.white || '#FFFFFF';
                }
            }
            if (bodyColor && mockup.colorLayer) {
                var cl = A.findLayer(src, mockup.colorLayer);
                if (cl) A.setSolidFill(src, cl, bodyColor);
                else A.warnings.push('Mockup: color layer "' + mockup.colorLayer + '" not found');
            }
            if (mockup.crop !== false) {
                // keep the phone + its shadow: screen bounds grown by cropPad on each side (more at the bottom)
                var pad = sb.w * (mockup.cropPad === undefined ? 0.16 : mockup.cropPad);
                var dw = src.width.as('px'), dh = src.height.as('px');
                var x0 = Math.max(0, sb.x - pad), y0 = Math.max(0, sb.y - pad);
                var x1 = Math.min(dw, sb.r + pad), y1 = Math.min(dh, sb.b + pad * 1.6);
                src.crop([new UnitValue(x0, 'px'), new UnitValue(y0, 'px'), new UnitValue(x1, 'px'), new UnitValue(y1, 'px')]);
            }
            var o = new PNGSaveOptions();
            o.compression = 3;
            src.saveAs(new File(tmpPath), o, true, Extension.LOWERCASE);
        } finally {
            src.close(SaveOptions.DONOTSAVECHANGES);
        }
        return tmpPath;
    };

    // ---------- Fonts ----------
    var FONT_MAP = null;
    A.fontExists = function (ps) {
        if (!FONT_MAP) {
            FONT_MAP = {};
            for (var i = 0; i < app.fonts.length; i++) FONT_MAP[app.fonts[i].postScriptName] = true;
        }
        return FONT_MAP[ps] === true;
    };

    // Design rule: no italic / oblique type anywhere.
    A.isItalic = function (ps) { return /italic|oblique|slanted/i.test(String(ps || '')); };

    A.pickFont = function (wanted, fallback) {
        var list = (wanted instanceof Array) ? wanted : [wanted];
        for (var i = 0; i < list.length; i++) {
            if (!list[i]) continue;
            if (A.isItalic(list[i])) { A.warnings.push('Font "' + list[i] + '" is italic, skipped (italic type is not allowed)'); continue; }
            if (A.fontExists(list[i])) return list[i];
        }
        var fb = fallback || ['SFPro-Bold', 'Inter-Bold', 'HelveticaNeue-Bold', 'Arial-BoldMT'];
        var asked = [];
        for (var q = 0; q < list.length; q++) if (list[q]) asked.push(list[q]);
        for (var j = 0; j < fb.length; j++) {
            if (A.fontExists(fb[j])) {
                if (asked.length) A.warnings.push('Font "' + asked.join('/') + '" not installed, using ' + fb[j]);
                return fb[j];
            }
        }
        if (asked.length) A.warnings.push('Font "' + asked.join('/') + '" not installed, using ArialMT');
        return 'ArialMT';
    };

    // ---------- Text ----------
    // Paragraph text inside box {x,y,w,h}. Returns the layer.
    A.addText = function (name, text, box, o) {
        var doc = app.activeDocument;
        var layer = doc.artLayers.add();
        layer.kind = LayerKind.TEXT;
        layer.name = name;
        var t = layer.textItem;
        t.kind = TextType.PARAGRAPHTEXT;
        t.contents = String(text).replace(/\n/g, '\r');
        t.font = o.font;
        t.size = new UnitValue(o.size, 'px');
        t.color = A.solidColor(o.color || '#000000');
        t.justification = o.align === 'left' ? Justification.LEFT : (o.align === 'right' ? Justification.RIGHT : Justification.CENTER);
        t.useAutoLeading = false;
        t.leading = new UnitValue(o.size * (o.leading || 1.1), 'px');
        if (o.tracking !== undefined) t.tracking = o.tracking;
        t.position = [new UnitValue(box.x, 'px'), new UnitValue(box.y, 'px')];
        t.width = new UnitValue(box.w, 'px');
        t.height = new UnitValue(box.h, 'px');
        return layer;
    };

    // Number of text lines for a paragraph layer (approx. from rendered height).
    A.textLines = function (layer, size, leading) {
        var b = A.bounds(layer);
        return Math.max(1, Math.round((b.h - size * 0.75) / (size * (leading || 1.1))) + 1);
    };

    // Single-line point text. Returns the layer; position it afterwards with A.moveTo / A.centerOn.
    A.addPointText = function (name, text, o) {
        var doc = app.activeDocument;
        var layer = doc.artLayers.add();
        layer.kind = LayerKind.TEXT;
        layer.name = name;
        var t = layer.textItem;
        t.kind = TextType.POINTTEXT;
        t.contents = String(text);
        t.font = o.font;
        t.size = new UnitValue(o.size, 'px');
        t.color = A.solidColor(o.color || '#000000');
        t.justification = Justification.LEFT;
        if (o.tracking !== undefined) t.tracking = o.tracking;
        t.position = [new UnitValue(0, 'px'), new UnitValue(o.size, 'px')];
        if (o.opacity !== undefined) layer.opacity = o.opacity;
        return layer;
    };

    // Bounding box of several layers.
    A.unionBounds = function (layers) {
        var u = null;
        for (var i = 0; i < layers.length; i++) {
            var b = A.bounds(layers[i]);
            if (b.w <= 0 && b.h <= 0) continue;
            if (!u) { u = { x: b.x, y: b.y, r: b.r, b: b.b }; continue; }
            u.x = Math.min(u.x, b.x); u.y = Math.min(u.y, b.y);
            u.r = Math.max(u.r, b.r); u.b = Math.max(u.b, b.b);
        }
        if (!u) return null;
        u.w = u.r - u.x; u.h = u.b - u.y;
        return u;
    };

    A.translateAll = function (layers, dx, dy) {
        if (!dx && !dy) return;
        for (var i = 0; i < layers.length; i++) layers[i].translate(dx, dy);
    };

    // Moves a layer so its bounds' center sits at (cx, cy). Pass null to keep an axis.
    A.centerOn = function (layer, cx, cy) {
        var b = A.bounds(layer);
        layer.translate(cx === null ? 0 : cx - (b.x + b.w / 2), cy === null ? 0 : cy - (b.y + b.h / 2));
    };

    // Splits "Plan for [anything] big" into plain text and accent ranges (brackets removed).
    A.parseAccents = function (text) {
        var out = '', ranges = [], start = -1;
        for (var i = 0; i < text.length; i++) {
            var c = text.charAt(i);
            if (c === '[' && start < 0) { start = out.length; continue; }
            if (c === ']' && start >= 0) { if (out.length > start) ranges.push({ from: start, to: out.length }); start = -1; continue; }
            out += c;
        }
        return { text: out, ranges: ranges };
    };

    // Recolors / underlines character ranges of the active text layer. o: { color, underline }
    A.applyAccents = function (layer, ranges, o) {
        if (!ranges || !ranges.length) return;
        app.activeDocument.activeLayer = layer;
        var ref = new ActionReference();
        ref.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
        var tk = executeActionGet(ref).getObjectValue(sTID('textKey'));
        var len = tk.getString(cTID('Txt ')).length;
        var base = tk.getList(sTID('textStyleRange')).getObjectValue(0).getObjectValue(sTID('textStyle'));
        function styled(accent) {
            var ts = new ActionDescriptor();
            ts.fromStream(base.toStream());
            if (accent) {
                if (o.color) ts.putObject(cTID('Clr '), cTID('RGBC'), rgbDesc(o.color));
                if (o.underline) ts.putEnumerated(sTID('underline'), sTID('underline'), sTID('underlineOnLeftInVertical'));
            }
            return ts;
        }
        var list = new ActionList(), pos = 0;
        function push(from, to, accent) {
            if (to <= from) return;
            var r = new ActionDescriptor();
            r.putInteger(sTID('from'), from);
            r.putInteger(sTID('to'), to);
            r.putObject(sTID('textStyle'), sTID('textStyle'), styled(accent));
            list.putObject(sTID('textStyleRange'), r);
        }
        for (var i = 0; i < ranges.length; i++) {
            push(pos, ranges[i].from, false);
            push(ranges[i].from, Math.min(ranges[i].to, len), true);
            pos = ranges[i].to;
        }
        push(pos, len, false);
        tk.putList(sTID('textStyleRange'), list);
        var d = new ActionDescriptor();
        d.putReference(cTID('null'), ref);
        d.putObject(cTID('T   '), sTID('textLayer'), tk);
        executeAction(cTID('setd'), d, DialogModes.NO);
    };

    // Film-grain layer over a rectangle: 50% gray + monochrome noise in Overlay mode.
    A.addGrain = function (name, x, y, w, h, o) {
        o = o || {};
        var doc = app.activeDocument;
        var layer = doc.artLayers.add();
        layer.name = name;
        doc.selection.select([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
        doc.selection.fill(A.solidColor('#808080'));
        doc.selection.deselect();
        layer.transparentPixelsLocked = true;
        layer.applyAddNoise(o.amount || 8, NoiseDistribution.GAUSSIAN, true);
        layer.transparentPixelsLocked = false;
        layer.blendMode = BlendMode.OVERLAY;
        layer.opacity = o.opacity === undefined ? 40 : o.opacity;
        return layer;
    };

    // ---------- Export ----------
    A.exportSlice = function (doc, x, y, w, h, outPath) {
        var d = doc.duplicate('asd_export_tmp', true);
        try {
            d.crop([new UnitValue(x, 'px'), new UnitValue(y, 'px'), new UnitValue(x + w, 'px'), new UnitValue(y + h, 'px')]);
            d.flatten();
            if (d.bitsPerChannel !== BitsPerChannelType.EIGHT) d.bitsPerChannel = BitsPerChannelType.EIGHT;
            try { d.convertProfile('sRGB IEC61966-2.1', Intent.RELATIVECOLORIMETRIC, true, false); } catch (e) {}
            var o = new PNGSaveOptions();
            o.compression = 6;
            o.interlaced = false;
            d.saveAs(new File(outPath), o, true, Extension.LOWERCASE);
        } finally {
            d.close(SaveOptions.DONOTSAVECHANGES);
        }
    };

    A.savePSD = function (doc, path) {
        var o = new PhotoshopSaveOptions();
        o.layers = true;
        o.embedColorProfile = true;
        o.maximizeCompatibility = true;
        doc.saveAs(new File(path), o, false, Extension.LOWERCASE);
    };

    // ---------- Preferences ----------
    A.pushPrefs = function () {
        var p = { ruler: app.preferences.rulerUnits, type: app.preferences.typeUnits, dialogs: app.displayDialogs };
        app.preferences.rulerUnits = Units.PIXELS;
        app.preferences.typeUnits = TypeUnits.PIXELS;
        app.displayDialogs = DialogModes.NO;
        return p;
    };

    A.popPrefs = function (p) {
        app.preferences.rulerUnits = p.ruler;
        app.preferences.typeUnits = p.type;
        app.displayDialogs = p.dialogs;
    };
})(ASD);
