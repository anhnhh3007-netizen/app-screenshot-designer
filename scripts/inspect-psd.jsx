// inspect-psd.jsx: reads a reference PSD and dumps its design data for the agent.
// Usage: scripts/run-ps.sh scripts/inspect-psd.jsx path/to/design.psd [outDir]
// Default outDir: <psd folder>/<psd name>_inspect/
// Writes:
//   inspect.json        full layer tree: bounds (px + fractions), text styles, fills, gradients, layer effects, smart objects
//   preview.png         flattened preview (max 2400px wide)
//   artboard-NN.png     one preview per artboard (if any)
// Returns a short text summary (fonts, colors, text layers, smart objects).
// rel / sizeRelW values are fractions of the enclosing artboard (or of the document when there are no artboards).
// The PSD is opened read-only in practice: it is closed without saving.

#target photoshop

(function () {
    var SCRIPT_DIR = new File($.fileName).parent.fsName;
    $.evalFile(new File(SCRIPT_DIR + '/lib/asd.jsx'));
    var A = ASD, cTID = A.cTID, sTID = A.sTID;

    var args = (typeof ASD_ARGS !== 'undefined') ? ASD_ARGS : [];
    if (!args.length) return 'ERROR: missing PSD path argument';
    var psd = new File(args[0]);
    if (!psd.exists) return 'ERROR: file not found: ' + psd.fsName;
    var outDir = args[1] || (psd.parent.fsName + '/' + psd.name.replace(/\.[^.]+$/, '') + '_inspect');
    A.ensureFolder(outDir);

    function r3(v) { return Math.round(v * 1000) / 1000; }
    function hex2(n) { var h = Math.round(Math.max(0, Math.min(255, n))).toString(16); return h.length < 2 ? '0' + h : h; }

    function colorFromDesc(d) {
        try {
            if (d.hasKey(cTID('Rd  '))) return '#' + hex2(d.getDouble(cTID('Rd  '))) + hex2(d.getDouble(cTID('Grn '))) + hex2(d.getDouble(cTID('Bl  ')));
            if (d.hasKey(sTID('redFloat'))) return '#' + hex2(d.getDouble(sTID('redFloat')) * 255) + hex2(d.getDouble(sTID('greenFloat')) * 255) + hex2(d.getDouble(sTID('blueFloat')) * 255);
            if (d.hasKey(cTID('Gry '))) { var g = 255 * (1 - d.getDouble(cTID('Gry ')) / 100); return '#' + hex2(g) + hex2(g) + hex2(g); }
        } catch (e) {}
        return null;
    }
    function getUnit(d, key) { try { return d.hasKey(key) ? r3(d.getUnitDoubleValue(key)) : undefined; } catch (e) { return undefined; } }
    function getColor(d) { try { return d.hasKey(cTID('Clr ')) ? colorFromDesc(d.getObjectValue(cTID('Clr '))) : null; } catch (e) { return null; } }

    // ---- Stats for the summary ----
    var fontsUsed = {}, colorsUsed = {}, textList = [], smartList = [], artboards = [];
    function countColor(c, w) { if (c) colorsUsed[c] = (colorsUsed[c] || 0) + (w || 1); }

    // ---- Action Manager details for one layer ----
    function amInfo(layerId, info) {
        var ref = new ActionReference();
        ref.putIdentifier(cTID('Lyr '), layerId);
        var d;
        try { d = executeActionGet(ref); } catch (e) { return; }

        if (d.hasKey(sTID('smartObject'))) {
            info.smartObject = true;
            try {
                var so = d.getObjectValue(sTID('smartObject'));
                if (so.hasKey(sTID('fileReference'))) info.smartObjectFile = so.getString(sTID('fileReference'));
            } catch (e) {}
        }
        try {
            if (d.hasKey(sTID('artboardEnabled')) && d.getBoolean(sTID('artboardEnabled'))) {
                var ab = d.getObjectValue(sTID('artboard')).getObjectValue(sTID('artboardRect'));
                info.artboard = { x: ab.getDouble(cTID('Left')), y: ab.getDouble(cTID('Top ')), w: ab.getDouble(cTID('Rght')) - ab.getDouble(cTID('Left')), h: ab.getDouble(cTID('Btom')) - ab.getDouble(cTID('Top ')) };
                artboards.push({ name: info.name, rect: info.artboard });
            }
        } catch (e) {}

        // Fill layers (solid / gradient / pattern)
        try {
            if (d.hasKey(sTID('adjustment'))) {
                var adj = d.getList(sTID('adjustment')).getObjectValue(0);
                var cls = typeIDToStringID(d.getList(sTID('adjustment')).getObjectType(0));
                if (cls === 'solidColorLayer') { info.fill = { type: 'solid', color: getColor(adj) }; countColor(info.fill.color, 2); }
                else if (cls === 'gradientLayer') {
                    var g = { type: 'gradient', angle: getUnit(adj, cTID('Angl')), stops: [] };
                    try { g.style = typeIDToStringID(adj.getEnumerationValue(cTID('Type'))); } catch (e) {}
                    var grad = adj.getObjectValue(cTID('Grad'));
                    var clrs = grad.getList(cTID('Clrs'));
                    for (var i = 0; i < clrs.count; i++) {
                        var st = clrs.getObjectValue(i);
                        var col = getColor(st);
                        g.stops.push({ color: col, location: r3(st.getInteger(cTID('Lctn')) / 4096) });
                        countColor(col, 2);
                    }
                    info.fill = g;
                } else info.fill = { type: cls };
            }
        } catch (e) {}

        // Layer effects
        try {
            if (d.hasKey(sTID('layerEffects'))) {
                var fx = d.getObjectValue(sTID('layerEffects')), out = {};
                var map = { dropShadow: 'DrSh', stroke: 'FrFX', outerGlow: 'OrGl', innerShadow: 'IrSh', innerGlow: 'IrGl', colorOverlay: 'SoFi', gradientOverlay: 'GrFl', bevel: 'ebbl' };
                for (var k in map) {
                    if (!fx.hasKey(cTID(map[k]))) continue;
                    var e = fx.getObjectValue(cTID(map[k]));
                    if (e.hasKey(cTID('enab')) && !e.getBoolean(cTID('enab'))) continue;
                    var o = {};
                    o.opacity = getUnit(e, cTID('Opct'));
                    o.color = getColor(e);
                    o.size = getUnit(e, cTID('blur'));
                    if (o.size === undefined) o.size = getUnit(e, cTID('Sz  '));
                    o.distance = getUnit(e, cTID('Dstn'));
                    o.angle = getUnit(e, cTID('lagl'));
                    try { o.blend = typeIDToStringID(e.getEnumerationValue(cTID('Md  '))); } catch (x) {}
                    out[k] = o;
                }
                info.effects = out;
            }
        } catch (e) {}

        // All fonts in a text layer (DOM only exposes the first style run)
        try {
            if (d.hasKey(sTID('textKey'))) {
                var tk = d.getObjectValue(sTID('textKey'));
                var scale = 1;
                try { var tr = tk.getObjectValue(sTID('transform')); scale = tr.getDouble(sTID('yy')); } catch (e) {}
                var ranges = tk.getList(sTID('textStyleRange')), runs = [];
                for (var j = 0; j < ranges.count; j++) {
                    var rg = ranges.getObjectValue(j), ts = rg.getObjectValue(sTID('textStyle'));
                    var run = { from: rg.getInteger(sTID('from')), to: rg.getInteger(sTID('to')) };
                    try { run.font = ts.getString(sTID('fontPostScriptName')) || undefined; } catch (e) {}
                    try { run.size = r3(ts.getUnitDoubleValue(sTID('size')) * scale); } catch (e) {}
                    run.color = getColor(ts);
                    runs.push(run);
                    if (run.font) fontsUsed[run.font] = true;
                    else delete run.font;
                    countColor(run.color, 1);
                }
                if (runs.length > 1) info.textRuns = runs;
                if (info.text && !info.text.font && runs.length && runs[0].font) info.text.font = runs[0].font;
            }
        } catch (e) {}
    }

    // ---- Layer tree ----
    var DOC_W, DOC_H;
    // frame = rectangle that relative values are measured against: the enclosing artboard, or the whole document.
    function walk(container, depth, frame) {
        var out = [];
        for (var i = 0; i < container.layers.length; i++) {
            var l = container.layers[i], info = { name: l.name, type: l.typename };
            try { info.visible = l.visible; } catch (e) {}
            try { info.opacity = Math.round(l.opacity); } catch (e) {}
            try { info.blendMode = String(l.blendMode).replace('BlendMode.', ''); } catch (e) {}
            try {
                var b = A.bounds(l);
                info.bounds = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.w), h: Math.round(b.h) };
                info.rel = { x: r3((b.x - frame.x) / frame.w), y: r3((b.y - frame.y) / frame.h), w: r3(b.w / frame.w), h: r3(b.h / frame.h) };
            } catch (e) {}
            if (l.typename === 'ArtLayer') {
                try { info.kind = String(l.kind).replace('LayerKind.', ''); } catch (e) {}
                try { info.clipped = l.grouped; } catch (e) {}
                if (info.kind === 'TEXT') {
                    var t = l.textItem, tx = {};
                    try { tx.contents = t.contents; } catch (e) {}
                    try { if (t.font) { tx.font = t.font; fontsUsed[t.font] = true; } } catch (e) {}
                    try { tx.size = r3(t.size.as('px')); } catch (e) {}
                    try { tx.color = '#' + t.color.rgb.hexValue.toLowerCase(); countColor(tx.color, 1); } catch (e) {}
                    try { tx.kind = String(t.kind).replace('TextType.', ''); } catch (e) {}
                    try { tx.justification = String(t.justification).replace('Justification.', ''); } catch (e) {}
                    try { tx.tracking = t.tracking; } catch (e) {}
                    try { tx.leading = t.useAutoLeading ? 'auto' : r3(t.leading.as('px')); } catch (e) {}
                    try { tx.capitalization = String(t.capitalization).replace('TextCase.', ''); } catch (e) {}
                    try { if (tx.size) tx.sizeRelW = r3(tx.size / frame.w); } catch (e) {}
                    info.text = tx;
                    textList.push({ name: l.name, text: tx, rel: info.rel, frame: frame.name });
                }
            }
            amInfo(l.id, info);
            if (info.smartObject) smartList.push(l.name + (info.smartObjectFile ? ' (' + info.smartObjectFile + ')' : ''));
            if (info.artboard) {
                // the artboard itself is measured against the document; its children against the artboard
                var ab = info.artboard;
                info.rel = { x: r3(ab.x / DOC_W), y: r3(ab.y / DOC_H), w: r3(ab.w / DOC_W), h: r3(ab.h / DOC_H) };
            }
            if (l.typename === 'LayerSet' && depth < 30) {
                var childFrame = info.artboard ? { x: info.artboard.x, y: info.artboard.y, w: info.artboard.w, h: info.artboard.h, name: l.name } : frame;
                info.children = walk(l, depth + 1, childFrame);
            }
            out.push(info);
        }
        return out;
    }

    // ---- Pretty JSON ----
    function pretty(v, ind) {
        ind = ind || '';
        if (v === null || v === undefined) return 'null';
        if (typeof v !== 'object') return A.stringify(v);
        var nx = ind + '  ', parts = [];
        if (v instanceof Array) {
            if (!v.length) return '[]';
            for (var i = 0; i < v.length; i++) parts.push(nx + pretty(v[i], nx));
            return '[\n' + parts.join(',\n') + '\n' + ind + ']';
        }
        for (var k in v) if (v.hasOwnProperty(k) && v[k] !== undefined) parts.push(nx + A.stringify(k) + ': ' + pretty(v[k], nx));
        return parts.length ? '{\n' + parts.join(',\n') + '\n' + ind + '}' : '{}';
    }
    function writeText(path, s) {
        var f = new File(path);
        f.encoding = 'UTF8';
        f.lineFeed = 'Unix';
        f.open('w');
        f.write(s);
        f.close();
    }
    function savePreview(doc, path, crop) {
        var d = doc.duplicate('asd_preview_tmp', true);
        try {
            if (crop) d.crop([new UnitValue(crop.x, 'px'), new UnitValue(crop.y, 'px'), new UnitValue(crop.x + crop.w, 'px'), new UnitValue(crop.y + crop.h, 'px')]);
            d.flatten();
            if (d.mode !== DocumentMode.RGB) d.changeMode(ChangeMode.RGB);
            if (d.bitsPerChannel !== BitsPerChannelType.EIGHT) d.bitsPerChannel = BitsPerChannelType.EIGHT;
            var w = d.width.as('px'), h = d.height.as('px'), maxW = crop ? 1200 : 2400;
            if (w > maxW) d.resizeImage(new UnitValue(maxW, 'px'), new UnitValue(Math.round(h * maxW / w), 'px'), 72, ResampleMethod.BICUBIC);
            var o = new PNGSaveOptions();
            o.compression = 6;
            d.saveAs(new File(path), o, true, Extension.LOWERCASE);
        } finally {
            d.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    var prefs = A.pushPrefs();
    var doc = null, wasOpen = false;
    try {
        for (var di = 0; di < app.documents.length; di++) {
            if (app.documents[di].fullName && app.documents[di].fullName.fsName === psd.fsName) { doc = app.documents[di]; wasOpen = true; app.activeDocument = doc; }
        }
        if (!doc) doc = app.open(psd);
        DOC_W = doc.width.as('px');
        DOC_H = doc.height.as('px');

        var tree = walk(doc, 0, { x: 0, y: 0, w: DOC_W, h: DOC_H, name: '' });
        var data = {
            file: psd.fsName,
            width: DOC_W, height: DOC_H,
            resolution: doc.resolution,
            mode: String(doc.mode).replace('DocumentMode.', ''),
            bitsPerChannel: String(doc.bitsPerChannel).replace('BitsPerChannelType.', ''),
            artboards: artboards,
            fonts: [], colors: [],
            layers: tree
        };
        for (var f in fontsUsed) data.fonts.push({ postScriptName: f, installed: A.fontExists(f) });
        var cl = [];
        for (var c in colorsUsed) cl.push({ color: c, weight: colorsUsed[c] });
        cl.sort(function (a, b) { return b.weight - a.weight; });
        data.colors = cl;

        writeText(outDir + '/inspect.json', pretty(data));
        savePreview(doc, outDir + '/preview.png', null);
        for (var ai = 0; ai < artboards.length; ai++) {
            savePreview(doc, outDir + '/artboard-' + (ai < 9 ? '0' : '') + (ai + 1) + '.png', artboards[ai].rect);
        }

        // ---- Text summary ----
        var lines = [];
        lines.push('OK ' + psd.name + '  ' + DOC_W + 'x' + DOC_H + ' px, ' + data.mode + ', ' + artboards.length + ' artboard(s)');
        lines.push('Output: ' + outDir);
        lines.push('Fonts:');
        for (var fi = 0; fi < data.fonts.length; fi++) lines.push('  ' + data.fonts[fi].postScriptName + (data.fonts[fi].installed ? '' : '  [NOT INSTALLED]'));
        lines.push('Top colors: ' + (function () { var s = []; for (var i = 0; i < Math.min(10, cl.length); i++) s.push(cl[i].color); return s.join(' '); })());
        lines.push('Text layers (' + textList.length + '):');
        for (var ti = 0; ti < textList.length && ti < 40; ti++) {
            var tl = textList[ti], tt = tl.text;
            var snippet = String(tt.contents || '').replace(/[\r\n]+/g, ' / ');
            if (snippet.length > 60) snippet = snippet.substring(0, 57) + '...';
            lines.push('  "' + snippet + '"  ' + (tt.font || '(unknown font)') + ' ' + (tt.size || '?') + 'px (' + (tt.sizeRelW || '?') + 'W) ' + (tt.color || '') + ' ' + (tt.justification || '') +
                (tl.rel ? '  @x' + tl.rel.x + ' y' + tl.rel.y : '') + (tl.frame ? '  [' + tl.frame + ']' : ''));
        }
        if (textList.length > 40) lines.push('  ... ' + (textList.length - 40) + ' more in inspect.json');
        lines.push('Smart objects (' + smartList.length + '): ' + smartList.join(', '));
        return lines.join('\n');
    } catch (e) {
        return 'ERROR: ' + e.message + (e.line ? ' (line ' + e.line + ')' : '');
    } finally {
        if (doc && !wasOpen) try { doc.close(SaveOptions.DONOTSAVECHANGES); } catch (e) {}
        A.popPrefs(prefs);
    }
})();
