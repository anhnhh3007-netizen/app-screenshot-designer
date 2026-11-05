// list-fonts.jsx: lists installed fonts whose name contains a keyword.
// Usage: scripts/run-ps.sh scripts/list-fonts.jsx "Inter"
// Output: one line per font, "postScriptName | family | style".

(function () {
    var q = (typeof ASD_ARGS !== 'undefined' && ASD_ARGS.length) ? String(ASD_ARGS[0]).toLowerCase() : '';
    var out = [];
    for (var i = 0; i < app.fonts.length; i++) {
        var f = app.fonts[i];
        var line = f.postScriptName + ' | ' + f.family + ' | ' + f.style;
        if (!q || line.toLowerCase().indexOf(q) >= 0) out.push(line);
    }
    return out.length ? out.join('\n') : 'No fonts match "' + q + '"';
})();
