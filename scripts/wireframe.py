#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Render black & white layout wireframes for the layout-suggestion step (Buoc 3a).
Fast, no Photoshop needed.

Modes (any combination in one JSON):
  "groups":    layouts classified by overall form -> nhom-NN.png (Title + 2-line Subtitle placeholders)
  "screens":   per screen (man) several layout options -> man-NN.png  (options labelled 1A, 1B, ...)
  "selection": {"picks": ["L05","L01",...] or ["1B","2A",...], "connect": "P1"} -> chot-<id>.png
  "directions": whole-set directions -> wireframe-<id>.png

Usage:
  python3 scripts/wireframe.py <wireframes.json> [out_dir]

Input JSON (see references/layout-catalog.md, section 4):
{
  "aspect": [1290, 2796],                // slide size (portrait or landscape); default iPhone 6.9"
  "directions": [
    {
      "id": "B", "name": "Nhip xen ke", "connect": "P1", "recommended": true,
      "why": "...", "tradeoff": "...",
      "slides": [
        { "layout": "L01", "headline": "Chuyen tien 3 giay", "sub": true, "screen": "01" },
        { "layout": "L05", "rotate": -15, "offsetX": 0.3 }
      ]
    }
  ]
}
Per-slide overrides: rotate (deg), offsetX (fraction of slide width, P2 straddle), bleed (bool), scale.
Output: <out_dir>/wireframe-<id>.png  (default out_dir = folder of the JSON + /wireframes)
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SS = 2                      # supersampling factor
FW = 300                    # slide frame width (final px) for portrait
INK = (20, 20, 20)
MID = (120, 120, 120)
LIGHT = (205, 205, 205)
SCREEN = (238, 238, 238)
FRAME = (150, 150, 150)
WHITE = (255, 255, 255)
BG = (255, 255, 255)

FONT_DIR = '/System/Library/Fonts/Supplemental/'
def font(size, bold=False):
    for name in (['Arial Bold.ttf'] if bold else ['Arial.ttf']) + ['Arial Unicode.ttf']:
        try:
            return ImageFont.truetype(FONT_DIR + name, int(size * SS))
        except OSError:
            pass
    return ImageFont.load_default()

LAYOUT_NAMES_VI = {
    'L01': u'Text trên, máy dưới', 'L02': u'Máy trên, text dưới',
    'L03': 'Sandwich', 'L04': u'Máy tràn đáy', 'L05': u'Máy nghiêng',
    'L06': u'Hai máy', 'L07': u'Máy + thẻ UI', 'L08': u'Máy + chat',
    'L09': 'Hero badge', 'L10': 'Bullets', 'L11': u'Số liệu', 'L12': u'Thẻ tính năng',
    'L13': 'Watermark', 'L14': u'Chỉ máy', 'SIDE': u'Ngang: text + máy',
    'L15': u'Quạt màn hình', 'L16': u'Collage vật thể', 'L17': u'Máy + dải thumbnail',
    'L18': u'Ảnh nền thật', 'L19': u'Chip + mũi tên', 'L20': u'Cặp máy nghiêng + chip',
    'L21': u'Hero đôi vắt 2 ảnh', 'L22': u'Nền chia chéo', 'L23': u'Chữ khổng lồ',
    'L24': u'Lưới máy lặp', 'L25': u'Đánh giá', 'L26': u'Trích dẫn lớn',
    'L27': u'Chữ xoay theo máy', 'L28': u'Ba máy hàng ngang', 'NEXT': u'Khung nhận',
}
CONNECT_VI = {'P0': u'ảnh rời', 'P1': u'nền nối liền', 'P2': u'máy vắt qua mép'}


def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=fnt) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


# Background codes (references/layout-catalog.md, section 7) -> wireframe painter.
# B10 (one colour per slide) = solid with a different "tone" per slide; B11 (one background for the set) = connect P1.
BG_CODES = {'B01': 'solid', 'B02': 'gradient', 'B03': 'mesh', 'B04': 'dark', 'B05': 'grain', 'B06': 'split',
            'B07': 'deco', 'B08': 'pattern', 'B09': 'photo', 'B10': 'solid', 'B11': None}


def diag_gradient(w, h, top, bottom):
    """Diagonal (top-left -> bottom-right) grayscale gradient."""
    sw, sh = max(2, w // 16), max(2, h // 16)
    g = Image.new('L', (sw, sh))
    g.putdata([int(top + (bottom - top) * ((x / float(sw - 1)) * 0.5 + (y / float(sh - 1)) * 0.5)) for y in range(sh) for x in range(sw)])
    return g.resize((w, h), Image.BILINEAR)


def paint_bg_tile(bg, w, h, tone=228):
    if bg == 'solid':
        return Image.new('RGB', (w, h), (tone,) * 3)
    if bg == 'gradient':
        return Image.linear_gradient('L').resize((w, h)).point(lambda v: 248 - v * 70 // 255).convert('RGB')
    if bg == 'panorama':                    # w covers several frames
        t = Image.linear_gradient('L').rotate(90, expand=True).resize((w, h)).point(lambda v: 245 - v * 60 // 255).convert('RGB')
        ImageDraw.Draw(t).ellipse([w * 0.25, h * 0.6, w * 0.8, h * 1.25], fill=(214, 214, 214))
        return t
    if bg == 'mesh':
        t = diag_gradient(w, h, 244, 200).convert('RGB')
        blobs = Image.new('L', (w, h), 0)
        bd = ImageDraw.Draw(blobs)
        bd.ellipse([-w * 0.3, -h * 0.05, w * 0.7, h * 0.4], fill=170)
        bd.ellipse([w * 0.35, h * 0.55, w * 1.4, h * 1.05], fill=200)
        blobs = blobs.filter(ImageFilter.GaussianBlur(w * 0.15))
        dark = Image.new('RGB', (w, h), (150, 150, 150))
        return Image.composite(dark, t, blobs)
    if bg == 'dark':
        return Image.new('RGB', (w, h), (45, 45, 48))
    t = Image.new('RGB', (w, h), (240, 240, 240))
    d = ImageDraw.Draw(t)
    if bg == 'split':
        t.paste((245, 245, 245), [0, 0, w, h])
        d.polygon([(w, h * 0.38), (w, h), (0, h), (0, h * 0.7)], fill=(200, 200, 200))
    elif bg == 'photo':
        t.paste((214, 214, 214), [0, 0, w, h])
        d.line([0, 0, w, h], fill=(196, 196, 196), width=3 * SS)
        d.line([w, 0, 0, h], fill=(196, 196, 196), width=3 * SS)
        f = font(FW * 0.04, True); tx = u'\u1ea2nh n\u1ec1n'
        d.text((w / 2 - d.textlength(tx, font=f) / 2, h * 0.9), tx, font=f, fill=MID)
    elif bg == 'deco':
        d.ellipse([w * 0.55, h * 0.22, w * 1.25, h * 0.22 + w * 0.7], fill=(222, 222, 222))
        d.ellipse([-w * 0.25, h * 0.62, w * 0.35, h * 0.62 + w * 0.6], fill=(226, 226, 226))
        d.ellipse([w * 0.06, h * 0.3, w * 0.18, h * 0.3 + w * 0.12], outline=MID, width=2 * SS)
        d.rounded_rectangle([w * 0.8, h * 0.8, w * 0.94, h * 0.8 + w * 0.14], radius=w * 0.04, fill=(205, 205, 205))
    elif bg == 'grain':
        noise = Image.effect_noise((w, h), 40).point(lambda v: 226 + (v - 128) // 4)
        t = noise.convert('RGB')
    elif bg == 'pattern':
        t.paste((242, 242, 242), [0, 0, w, h])
        st, r, yy = w * 0.08, 0, w * 0.04
        while yy < h:
            xx = w * 0.04 + (st / 2 if r % 2 else 0)
            while xx < w:
                d.ellipse([xx - 3 * SS, yy - 3 * SS, xx + 3 * SS, yy + 3 * SS], fill=(200, 200, 200))
                xx += st
            yy += st; r += 1
    return t


class Slide(object):
    """Draws one slide into the strip canvas. Coordinates in supersampled px."""

    def __init__(self, img, layer, lo, x0, y0, w, h, s):
        self.layer, self.lo, self.img = layer, lo, img   # layer: RGBA device layer whose origin is lo (in img space)
        self.x0, self.y0, self.w, self.h, self.s = x0, y0, w, h, s
        self.d = ImageDraw.Draw(img)
        dark = s.get('bg') in ('dark', 'B04', 'b04') or s.get('dark')
        self.ink, self.mid = ((255, 255, 255), (200, 200, 200)) if dark else (INK, MID)

    def X(self, f): return self.x0 + f * self.w
    def Y(self, f): return self.y0 + f * self.h

    # ---------- primitives ----------
    def sub_lines(self):
        v = self.s.get('subtitle')
        if isinstance(v, list):
            return v[:2]
        if isinstance(v, str):
            return [v]
        return [u'Subtitle d\u00f2ng 1', u'Subtitle d\u00f2ng 2']

    def draw_sub(self, y, align, cx, left):
        fs = font(FW * 0.04)
        lh = fs.size * 1.3
        for ln in self.sub_lines():
            tw = self.d.textlength(ln, font=fs)
            self.d.text((cx - tw / 2 if align == 'center' else left, y), ln, font=fs, fill=self.mid)
            y += lh
        return y

    def text_block(self, top, align='center', width=0.8, x=None, size=1.0, sub=True, headline=None, bottom=False):
        """Title (bold) + Subtitle (2 lines). Placeholder text unless headline / subtitle are given."""
        hl = headline or self.s.get('headline') or 'Title'
        fnt = font(FW * 0.08 * size, True)
        fs = font(FW * 0.04)
        maxw = self.w * width
        lines = wrap(self.d, hl, fnt, maxw)[:3]
        lh = fnt.size * 1.18
        show_sub = sub and self.s.get('sub', True)
        subh = (fs.size * 0.5 + fs.size * 1.3 * len(self.sub_lines())) if show_sub else 0
        total = lh * len(lines) + subh
        y = self.Y(top) - (total if bottom else 0)
        cx = self.X(x if x is not None else 0.5)
        left = self.X(x if x is not None else (1 - width) / 2)
        for ln in lines:
            tw = self.d.textlength(ln, font=fnt)
            self.d.text((cx - tw / 2 if align == 'center' else left, y), ln, font=fnt, fill=self.ink)
            y += lh
        if show_sub:
            y = self.draw_sub(y + fs.size * 0.5, align, cx, left)
        return y

    def phone(self, cx, top, width, rotate=0, label=None, scale_h=2.05):
        """Phone outline drawn on its own RGBA tile then pasted (rotation supported)."""
        pw, ph = int(width), int(width * scale_h)
        pad = int(pw * 0.6)
        tile = Image.new('RGBA', (pw + 2 * pad, ph + 2 * pad), (0, 0, 0, 0))
        td = ImageDraw.Draw(tile)
        r = pw * 0.16
        b = max(3 * SS, pw * 0.035)
        td.rounded_rectangle([pad, pad, pad + pw, pad + ph], radius=r, fill=INK)
        td.rounded_rectangle([pad + b, pad + b, pad + pw - b, pad + ph - b], radius=r - b, fill=SCREEN)
        nw, nh = pw * 0.32, pw * 0.07                     # dynamic island
        td.rounded_rectangle([pad + pw / 2 - nw / 2, pad + b * 2.2, pad + pw / 2 + nw / 2, pad + b * 2.2 + nh],
                             radius=nh / 2, fill=INK)
        lab = label if label is not None else (u'Màn hình ' + str(self.s['screen']) if self.s.get('screen') else u'Màn hình')
        f = font(FW * 0.04)
        tw = td.textlength(lab, font=f)
        td.text((pad + pw / 2 - tw / 2, pad + ph * 0.45), lab, font=f, fill=MID)
        if rotate:
            tile = tile.rotate(rotate, resample=Image.BICUBIC, expand=False)
        ox = self.s.get('offsetX', 0) * self.w
        self.layer.paste(tile, (int(cx + ox - self.lo[0] - tile.width / 2), int(top - self.lo[1] - pad)), tile)

    def card(self, x, y, w, h, icon=True, bars=2):
        self.d.rounded_rectangle([x, y, x + w, y + h], radius=h * 0.22, fill=WHITE, outline=INK, width=2 * SS)
        ix = x + h * 0.2
        if icon:
            s = h * 0.55
            self.d.rounded_rectangle([ix, y + (h - s) / 2, ix + s, y + (h + s) / 2], radius=s * 0.25, fill=LIGHT)
            ix += s + h * 0.2
        for k in range(bars):
            bh = h * 0.12
            by = y + h * (0.32 + k * 0.26)
            self.d.rounded_rectangle([ix, by, x + w - h * 0.25 - k * w * 0.18, by + bh], radius=bh / 2,
                                     fill=INK if k == 0 else LIGHT)

    def default_phone(self, top, wfrac=0.66, rotate=0):
        sc = self.s.get('scale', 1.0)
        self.phone(self.X(0.5), self.Y(top), self.w * wfrac * sc, rotate or self.s.get('rotate', 0))

    # ---------- layouts ----------
    # ---------- background styles (B01-B11) ----------
    def paint_bg(self):
        """Background styles drawn on a tile the size of the frame, so nothing spills outside it."""
        bg = BG_CODES.get(str(self.s.get('bg', '')).upper(), self.s.get('bg'))
        if not bg:
            return
        w, h = int(self.w), int(self.h)
        tile = paint_bg_tile(bg, w, h, self.s.get('tone', 228))
        self.img.paste(tile, (int(self.x0), int(self.y0)))

    def draw(self):
        self.paint_bg()
        L = self.s.get('layout', 'L01').upper()
        getattr(self, 'l_' + L.lower(), self.l_l01)()

    def l_l01(self):
        self.text_block(0.07); self.default_phone(0.26, 0.70)

    def l_l02(self):
        self.default_phone(-0.12 if self.s.get('bleed', True) else 0.05, 0.8)
        self.text_block(0.93, bottom=True)

    def l_l03(self):
        self.draw_sub(self.Y(0.06), 'center', self.X(0.5), self.X(0.1))
        self.default_phone(0.14, 0.58)
        self.text_block(0.97, size=1.25, sub=False, bottom=True)

    def l_l04(self):
        self.text_block(0.07); self.default_phone(0.28, 0.84)

    def l_l05(self):
        self.text_block(0.07)
        self.default_phone(0.33, 0.68, rotate=self.s.get('rotate', -14))

    def l_l06(self):
        self.text_block(0.07)
        self.phone(self.X(0.36), self.Y(0.30), self.w * 0.5, 0, u'Màn hình A')
        self.phone(self.X(0.62), self.Y(0.38), self.w * 0.54, 0, u'Màn hình B')

    def l_l07(self):
        self.text_block(0.07); self.default_phone(0.26, 0.66)
        self._cards_after = [(self.X(0.42), self.Y(0.50), self.w * 0.54, self.w * 0.17),
                             (self.X(0.06), self.Y(0.68), self.w * 0.5, self.w * 0.15)]

    def l_l08(self):
        self.text_block(0.07); self.default_phone(0.26, 0.66)
        self._bubbles_after = [(self.X(0.44), self.Y(0.46), 0.5, False), (self.X(0.05), self.Y(0.57), 0.48, True),
                               (self.X(0.44), self.Y(0.68), 0.44, False)]

    def l_l09(self):
        d = self.d
        pill_w, pill_h = self.w * 0.32, self.w * 0.09
        d.rounded_rectangle([self.X(0.5) - pill_w / 2, self.Y(0.07), self.X(0.5) + pill_w / 2, self.Y(0.07) + pill_h],
                            radius=pill_h / 2, outline=INK, width=2 * SS)
        f = font(FW * 0.035, True); t = 'LOGO'
        d.text((self.X(0.5) - d.textlength(t, font=f) / 2, self.Y(0.07) + pill_h * 0.28), t, font=f, fill=INK)
        cy, rx = self.Y(0.24), self.w * 0.3                 # laurel badge
        for side in (-1, 1):
            for k in range(6):
                lx = self.X(0.5) + side * (rx - k * self.w * 0.012)
                ly = cy - self.w * 0.05 + k * self.w * 0.03
                d.ellipse([lx - 6 * SS, ly - 3 * SS, lx + 6 * SS, ly + 3 * SS], fill=MID)
        f2 = font(FW * 0.06, True); t2 = '4.8 / 50K+'
        d.text((self.X(0.5) - d.textlength(t2, font=f2) / 2, cy - f2.size * 0.4), t2, font=f2, fill=INK)
        self.text_block(0.36)
        self.card(self.X(0.08), self.Y(0.62), self.w * 0.84, self.w * 0.2)
        self.card(self.X(0.08), self.Y(0.75), self.w * 0.84, self.w * 0.2)

    def l_l10(self):
        y = self.text_block(0.07, align='left', width=0.84, x=0.08)
        y += self.w * 0.08
        for k in range(5):
            s = self.w * 0.12
            self.d.rounded_rectangle([self.X(0.08), y, self.X(0.08) + s, y + s], radius=s * 0.25,
                                     fill=WHITE, outline=INK, width=2 * SS)
            bh = s * 0.22
            self.d.rounded_rectangle([self.X(0.08) + s * 1.35, y + s / 2 - bh / 2, self.X(0.08) + s * 1.35 + self.w * (0.5 - 0.05 * (k % 2)),
                                      y + s / 2 + bh / 2], radius=bh / 2, fill=INK if k % 2 == 0 else MID)
            y += s * 1.55

    def l_l11(self):
        self.text_block(0.07, align='left', width=0.84, x=0.08)
        self.phone(self.X(0.30), self.Y(0.32), self.w * 0.58, self.s.get('rotate', 0))
        f, f2 = font(FW * 0.085, True), font(FW * 0.035)
        for k, v in enumerate(('99K+', '3,9K', '4.8')):
            y = self.Y(0.40 + k * 0.17)
            tw = self.d.textlength(v, font=f)
            self.d.text((self.X(0.93) - tw, y), v, font=f, fill=INK)
            bw = self.w * 0.22
            self.d.rounded_rectangle([self.X(0.93) - bw, y + f.size * 1.25, self.X(0.93), y + f.size * 1.25 + 4 * SS],
                                     radius=2 * SS, fill=LIGHT)

    def l_l12(self):
        d = self.d
        pill_w, pill_h = self.w * 0.32, self.w * 0.09
        d.rounded_rectangle([self.X(0.5) - pill_w / 2, self.Y(0.07), self.X(0.5) + pill_w / 2, self.Y(0.07) + pill_h],
                            radius=pill_h / 2, outline=INK, width=2 * SS)
        f = font(FW * 0.035, True); t = 'LOGO'
        d.text((self.X(0.5) - d.textlength(t, font=f) / 2, self.Y(0.07) + pill_h * 0.28), t, font=f, fill=INK)
        self.text_block(0.18, size=1.1)
        x, y, w, h = self.X(0.08), self.Y(0.50), self.w * 0.84, self.w * 0.42
        d.rounded_rectangle([x, y, x + w, y + h], radius=h * 0.14, fill=WHITE, outline=INK, width=2 * SS)
        s = h * 0.24
        d.rounded_rectangle([x + h * 0.12, y + h * 0.12, x + h * 0.12 + s, y + h * 0.12 + s], radius=s * 0.25, fill=LIGHT)
        for k, (fr, col) in enumerate(((0.6, INK), (0.8, LIGHT), (0.7, LIGHT))):
            by = y + h * (0.48 + k * 0.15)
            d.rounded_rectangle([x + h * 0.12, by, x + h * 0.12 + w * fr, by + h * 0.07], radius=4 * SS, fill=col)
        for frac in (0.7,):
            bw = self.w * frac
            d.rounded_rectangle([self.X(0.5) - bw / 2, self.Y(0.92), self.X(0.5) + bw / 2, self.Y(0.92) + 5 * SS],
                                radius=3 * SS, fill=MID)

    def l_l13(self):
        f = font(FW * 0.8, True); t = self.s.get('watermark', 'AI')
        self.d.text((self.X(0.5), self.Y(0.20)), t, font=f, fill=(222, 222, 222), anchor='ma')
        self.text_block(0.07); self.default_phone(0.36, 0.58)

    def l_l14(self):
        self.default_phone(0.07, 0.8)

    # ---------- helpers for L15+ ----------
    def panel(self, cx, top, w, h, rot=0, fill=WHITE, outline=INK, radius=0.12, label=None, bars=0):
        """Rotated rounded panel drawn on the device layer (stacking above text)."""
        pad = int(max(w, h) * 0.5)
        tile = Image.new('RGBA', (int(w) + 2 * pad, int(h) + 2 * pad), (0, 0, 0, 0))
        td = ImageDraw.Draw(tile)
        td.rounded_rectangle([pad, pad, pad + w, pad + h], radius=min(w, h) * radius, fill=fill,
                             outline=outline, width=(2 * SS if outline else 0))
        for k in range(bars):
            bh = h * 0.05
            by = pad + h * (0.62 + k * 0.12)
            td.rounded_rectangle([pad + w * 0.12, by, pad + w * (0.85 - k * 0.2), by + bh], radius=bh / 2,
                                 fill=INK if k == 0 else MID)
        if label:
            f = font(FW * 0.045, True)
            tw = td.textlength(label, font=f)
            td.text((pad + w / 2 - tw / 2, pad + h / 2 - f.size * 0.6), label, font=f, fill=INK)
        if rot:
            tile = tile.rotate(rot, resample=Image.BICUBIC, expand=False)
        self.layer.paste(tile, (int(cx - self.lo[0] - tile.width / 2), int(top - self.lo[1] - pad)), tile)

    def chip(self, x, y, text='Chip', right=False):
        f = font(FW * 0.045, True)
        h = f.size * 1.9
        w = self.d.textlength(text, font=f) + h * 1.3
        if right:
            x = x - w
        self.d.rounded_rectangle([x, y, x + w, y + h], radius=h / 2, fill=INK)
        self.d.ellipse([x + h * 0.3, y + h * 0.3, x + h * 0.7, y + h * 0.7], outline=WHITE, width=2 * SS)
        self.d.text((x + h * 0.95, y + h * 0.22), text, font=f, fill=WHITE)

    def laurel(self, cx, cy, rx, size=1.0):
        for side in (-1, 1):
            for k in range(5):
                lx = cx + side * (rx - k * self.w * 0.01 * size)
                ly = cy - self.w * 0.04 * size + k * self.w * 0.022 * size
                e = 5 * SS * size
                self.d.ellipse([lx - e, ly - e / 2, lx + e, ly + e / 2], fill=MID)

    def after(self, fn):
        if not hasattr(self, '_after'):
            self._after = []
        self._after.append(fn)

    # ---------- layouts from reference analysis (L15-L28) ----------
    def l_l15(self):                       # fan / cascade of screens
        self.text_block(0.07)
        for k, rot in enumerate((-4, -10, -16)):
            self.panel(self.X(0.74 - k * 0.14), self.Y(0.27 + k * 0.03), self.w * 0.5, self.w * 0.86, rot=rot,
                       fill=(250 - k * 10,) * 3, label=u'M\u00e0n %d' % (3 - k))
        self.phone(self.X(0.3), self.Y(0.42), self.w * 0.48, rotate=-14)

    def l_l16(self):                       # sticker / object collage, no phone
        self.text_block(0.07)
        d, w = self.d, self.w
        self.panel(self.X(0.3), self.Y(0.3), w * 0.32, w * 0.2, rot=15, fill=LIGHT, outline=None)
        self.panel(self.X(0.72), self.Y(0.28), w * 0.36, w * 0.17, rot=-10, fill=WHITE, label='$100')
        d.ellipse([self.X(0.12), self.Y(0.5), self.X(0.42), self.Y(0.5) + w * 0.3], fill=(225, 225, 225))
        cx, cy, r = self.X(0.7), self.Y(0.55), w * 0.16
        import math
        pts = [(cx + (r if i % 2 == 0 else r * 0.45) * math.cos(math.pi / 5 * i - math.pi / 2),
                cy + (r if i % 2 == 0 else r * 0.45) * math.sin(math.pi / 5 * i - math.pi / 2)) for i in range(10)]
        d.polygon(pts, fill=MID)
        self.panel(self.X(0.35), self.Y(0.72), w * 0.4, w * 0.14, rot=8, fill=WHITE, label='50%')
        d.ellipse([self.X(0.68), self.Y(0.76), self.X(0.92), self.Y(0.76) + w * 0.24], outline=INK, width=3 * SS)
        f = font(FW * 0.035)
        t = u'(V\u1eadt th\u1ec3 PNG / sticker)'
        d.text((self.X(0.5) - d.textlength(t, font=f) / 2, self.Y(0.93)), t, font=f, fill=MID)

    def l_l17(self):                       # phone + strip of thumbnails overlapping the bottom
        self.text_block(0.07); self.default_phone(0.26, 0.66)
        def strip():
            tw, th = self.w * 0.2, self.w * 0.3
            for k in range(4):
                x = self.X(0.06) + k * (tw + self.w * 0.025)
                y = self.Y(0.76)
                self.d.rounded_rectangle([x, y, x + tw, y + th], radius=tw * 0.12, fill=WHITE, outline=INK, width=2 * SS)
                self.d.rounded_rectangle([x + tw * 0.12, y + th * 0.12, x + tw * 0.88, y + th * 0.6], radius=tw * 0.08, fill=LIGHT)
                self.d.rounded_rectangle([x + tw * 0.12, y + th * 0.72, x + tw * 0.7, y + th * 0.8], radius=4 * SS, fill=MID)
        self.after(strip)

    def l_l18(self):                       # full-bleed real photo background, phone at the bottom, title on the phone
        d = self.d
        d.rectangle([self.X(0), self.Y(0), self.X(1), self.Y(1)], fill=(214, 214, 214))
        d.line([self.X(0), self.Y(0), self.X(1), self.Y(0.55)], fill=(195, 195, 195), width=3 * SS)
        d.line([self.X(1), self.Y(0), self.X(0), self.Y(0.55)], fill=(195, 195, 195), width=3 * SS)
        f = font(FW * 0.045, True); t = u'\u1ea2nh n\u1ec1n th\u1eadt'
        d.text((self.X(0.5) - d.textlength(t, font=f) / 2, self.Y(0.2)), t, font=f, fill=MID)
        self.phone(self.X(0.5), self.Y(0.44), self.w * 0.78, 0, '')
        self.after(lambda: self.text_block(0.58, width=0.62))

    def l_l19(self):                       # left title + chip + hand-drawn arrow pointing to a tilted phone
        y = self.text_block(0.07, align='left', width=0.84, x=0.08)
        self.chip(self.X(0.08), self.Y(0.33))
        d = self.d
        ax, ay = self.X(0.5), self.Y(0.27)
        d.arc([ax - self.w * 0.12, ay - self.w * 0.05, ax + self.w * 0.18, ay + self.w * 0.22], 200, 330, fill=INK, width=3 * SS)
        hx, hy = ax + self.w * 0.17, ay + self.w * 0.06
        d.polygon([(hx + 8 * SS, hy + 2 * SS), (hx - 6 * SS, hy - 8 * SS), (hx - 4 * SS, hy + 10 * SS)], fill=INK)
        self.phone(self.X(0.62), self.Y(0.42), self.w * 0.7, rotate=10)

    def l_l20(self):                       # pair of tilted phones + chips, no title
        self.phone(self.X(0.36), self.Y(0.14), self.w * 0.58, rotate=12, label=u'M\u00e0n h\u00ecnh A')
        self.phone(self.X(0.66), self.Y(0.26), self.w * 0.58, rotate=12, label=u'M\u00e0n h\u00ecnh B')
        self.after(lambda: (self.chip(self.X(0.94), self.Y(0.05), right=True), self.chip(self.X(0.94), self.Y(0.88), right=True)))

    def l_l21(self):                       # hero spread: giant diagonal phone running into the next slide
        self.phone(self.X(1.0), self.Y(0.1), self.w * 0.85, rotate=40, label='')
        f = font(FW * 0.035)
        t = u'\u2192 v\u1eaft sang \u1ea3nh k\u1ebf'
        self.after(lambda: self.d.text((self.X(0.06), self.Y(0.94)), t, font=f, fill=MID))

    def l_l22(self):                       # diagonal split background, tilted phone, title in the colour zone
        self.d.polygon([(self.X(1), self.Y(0.32)), (self.X(1), self.Y(1)), (self.X(0), self.Y(1)), (self.X(0), self.Y(0.86))],
                       fill=(222, 222, 222))
        self.phone(self.X(0.4), self.Y(0.04), self.w * 0.6, rotate=-22)
        self.after(lambda: self.text_block(0.96, align='left', width=0.6, x=0.36, bottom=True))

    def l_l23(self):                       # giant typography
        hl = self.s.get('headline') or 'Title'
        f = font(FW * (0.3 if hl == 'Title' else 0.16), True)
        y = self.Y(0.07)
        for ln in wrap(self.d, hl, f, self.w * 0.9)[:4]:
            self.d.text((self.X(0.06), y), ln, font=f, fill=self.ink)
            y += f.size * 1.05
        self.draw_sub(y + f.size * 0.2, 'left', self.X(0.5), self.X(0.07))
        self.phone(self.X(0.82), self.Y(0.6), self.w * 0.62, rotate=-30, label='')

    def l_l24(self):                       # repeated phone grid (pattern) + title panel
        for r in range(4):
            for c in range(3):
                self.phone(self.X(-0.1 + c * 0.55 + (r % 2) * 0.27), self.Y(-0.05 + r * 0.27), self.w * 0.34, rotate=-35, label='')
        def head():
            self.d.rectangle([self.X(0), self.Y(0), self.X(1), self.Y(0.24)], fill=WHITE)
            self.text_block(0.05, align='left', width=0.84, x=0.08)
        self.after(head)

    def l_l25(self):                       # testimonials: stacked review rows with laurels
        self.text_block(0.07)
        for k in range(3):
            cy = self.Y(0.38 + k * 0.19)
            self.laurel(self.X(0.5), cy, self.w * 0.34, 1.0)
            for j, (fr, col) in enumerate(((0.36, INK), (0.28, LIGHT), (0.2, LIGHT))):
                bw = self.w * fr
                yy = cy - self.w * 0.05 + j * self.w * 0.045
                self.d.rounded_rectangle([self.X(0.5) - bw / 2, yy, self.X(0.5) + bw / 2, yy + 5 * SS], radius=3 * SS, fill=col)

    def l_l26(self):                       # big quote card
        d = self.d
        x0, y0, x1, y1 = self.X(0.07), self.Y(0.06), self.X(0.93), self.Y(0.78)
        d.rounded_rectangle([x0, y0, x1, y1], radius=self.w * 0.05, fill=(232, 232, 232))
        d.polygon([(x0 + self.w * 0.1, y1), (x0 + self.w * 0.22, y1), (x0 + self.w * 0.1, y1 + self.w * 0.08)], fill=(232, 232, 232))
        d.text((x0 + self.w * 0.07, y0 + self.w * 0.02), u'\u201c', font=font(FW * 0.3, True), fill=MID)
        self.text_block(0.2, align='left', width=0.72, x=0.14, size=1.3)
        d.ellipse([self.X(0.08), self.Y(0.86), self.X(0.08) + self.w * 0.1, self.Y(0.86) + self.w * 0.1], fill=LIGHT)
        d.rounded_rectangle([self.X(0.22), self.Y(0.875), self.X(0.55), self.Y(0.875) + 5 * SS], radius=3 * SS, fill=INK)

    def l_l27(self):                       # text rotated along the phone angle
        ang = 35
        self.phone(self.X(0.62), self.Y(0.3), self.w * 0.62, rotate=ang, label='')
        def rot_text():
            tw, th = int(self.w * 0.9), int(self.w * 0.42)
            tile = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
            td = ImageDraw.Draw(tile)
            f, fs = font(FW * 0.12, True), font(FW * 0.055)
            td.text((0, 0), 'Title', font=f, fill=INK)
            y = f.size * 1.3
            for ln in self.sub_lines():
                td.text((0, y), ln, font=fs, fill=MID); y += fs.size * 1.3
            tile = tile.rotate(ang - 90, resample=Image.BICUBIC, expand=True)
            self.img.paste(tile, (int(self.X(0.04)), int(self.Y(0.08))), tile)
        self.after(rot_text)

    def l_l28(self):                       # three phones in a row, centre full, sides cropped by the frame
        self.text_block(0.07)
        for cx, top, wf in ((-0.08, 0.34, 0.5), (1.08, 0.34, 0.5)):
            self.phone(self.X(cx), self.Y(top), self.w * wf, 0, '')
        self.phone(self.X(0.5), self.Y(0.29), self.w * 0.58, 0)
        def badge():
            self.laurel(self.X(0.5), self.Y(0.93), self.w * 0.16, 0.8)
            f = font(FW * 0.035, True)
            self.d.text((self.X(0.5) - self.d.textlength('50K+', font=f) / 2, self.Y(0.915)), '50K+', font=f, fill=INK)
        self.after(badge)

    def l_next(self):                      # receiving frame of a connected layout: text away from the incoming device
        if self.s.get('textTop'):
            self.after(lambda: self.text_block(0.07))
        else:
            self.after(lambda: self.text_block(0.95, bottom=True))

    def l_side(self):
        self.text_block(0.5 - 0.12, align='left', width=0.42, x=0.07)
        self.phone(self.X(0.72), self.Y(0.12), self.h * 0.52, self.s.get('rotate', 0))

    def overlays(self):
        for fn in getattr(self, '_after', []):
            fn()
        for (x, y, w, h) in getattr(self, '_cards_after', []):
            self.card(x, y, w, h)
        for (x, y, wf, left) in getattr(self, '_bubbles_after', []):
            w, h = self.w * wf, self.w * 0.11
            self.d.rounded_rectangle([x, y, x + w, y + h], radius=h / 2, fill=WHITE if left else LIGHT,
                                     outline=INK, width=2 * SS)
            bh = h * 0.16
            self.d.rounded_rectangle([x + h * 0.4, y + h / 2 - bh / 2, x + w - h * 0.5, y + h / 2 + bh / 2],
                                     radius=bh / 2, fill=MID)


def render_direction(dr, aspect, out_path):
    sw = FW * SS
    sh = int(sw * aspect[1] / aspect[0])
    landscape = aspect[0] > aspect[1]
    if landscape:
        sh = int(FW * 1.2 * SS); sw = int(sh * aspect[0] / aspect[1])
    n = len(dr['slides'])
    M = 40 * SS
    head = 92 * SS
    lab = 30 * SS
    foot = 70 * SS
    W = M * 2 + sw * n
    H = head + lab + sh + foot + M
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    x0, y0 = M, head + lab

    # title
    conn = dr.get('connect', 'P0')
    if dr.get('selection') or dr.get('id', '').startswith('chot'):
        title = u'B\u1ed9 \u0111\u00e3 ch\u1ecdn \u00b7 %s \u00b7 %s %s' % (dr.get('name', ''), conn, CONNECT_VI.get(conn, ''))
    else:
        title = u'Hướng %s · %s · %s %s' % (dr.get('id', ''), dr.get('name', ''), conn, CONNECT_VI.get(conn, ''))
    if dr.get('recommended'):
        title += u'  (Khuyên dùng)'
    d.text((M, 28 * SS), title, font=font(24, True), fill=INK)
    seq = '  -  '.join(s.get('layout', 'L01').upper() for s in dr['slides'])
    d.text((M, 62 * SS), seq, font=font(15), fill=MID)

    # panorama background hint (P1/P2): one soft band running across all slides
    if conn in ('P1', 'P2'):
        band = Image.new('RGBA', (sw * n, sh), (0, 0, 0, 0))
        bd = ImageDraw.Draw(band)
        bd.ellipse([-sw * 0.4, sh * 0.55, sw * n * 1.1, sh * 1.5], fill=(244, 244, 244, 255))
        img.paste(band, (x0, y0), band)

    # devices live on their own layer (padded so rotated / straddling phones are not cut early)
    PADL = sw
    devices = Image.new('RGBA', (sw * n + 2 * PADL, sh + sh), (0, 0, 0, 0))
    lo = (x0 - PADL, y0)
    slides = []
    for i, s in enumerate(dr['slides']):
        if landscape and s.get('layout', '').upper() != 'SIDE':
            s = dict(s, layout='SIDE')
        sl = Slide(img, devices, lo, x0 + i * sw, y0, sw, sh, s)
        sl.draw()
        slides.append(sl)
    devices = devices.crop((PADL, 0, PADL + sw * n, sh))
    img.paste(devices, (x0, y0), devices)
    for sl in slides:
        sl.d = ImageDraw.Draw(img)
        sl.overlays()

    # frames + labels
    for i, s in enumerate(dr['slides']):
        sx = x0 + i * sw
        d.rectangle([sx, y0, sx + sw, y0 + sh], outline=FRAME, width=2 * SS)
        L = s.get('layout', 'L01').upper()
        t = u'%d · %s %s' % (i + 1, L, LAYOUT_NAMES_VI.get(L, ''))
        if s.get('bg'):
            t += u' \u00b7 ' + str(s['bg']).upper()
        d.text((sx + 4 * SS, y0 - 24 * SS), t, font=font(13, True), fill=INK)

    fy = y0 + sh + 16 * SS
    if dr.get('why'):
        d.text((M, fy), u'Vì sao hợp: ' + dr['why'], font=font(14), fill=INK); fy += 24 * SS
    if dr.get('tradeoff'):
        d.text((M, fy), u'Đánh đổi: ' + dr['tradeoff'], font=font(14), fill=MID)

    img = img.resize((W // SS, H // SS), Image.LANCZOS)
    img.save(out_path)
    return out_path


def slide_size(aspect):
    sw = FW * SS
    sh = int(sw * aspect[1] / aspect[0])
    landscape = aspect[0] > aspect[1]
    if landscape:
        sh = int(FW * 1.2 * SS); sw = int(sh * aspect[0] / aspect[1])
    return sw, sh, landscape


def draw_single(img, x, y, sw, sh, s, landscape):
    """Draw one slide inside its own frame (devices clipped to the frame)."""
    if landscape and s.get('layout', '').upper() != 'SIDE':
        s = dict(s, layout='SIDE')
    PAD = sw
    devices = Image.new('RGBA', (sw + 2 * PAD, sh * 2), (0, 0, 0, 0))
    sl = Slide(img, devices, (x - PAD, y), x, y, sw, sh, s)
    sl.draw()
    devices = devices.crop((PAD, 0, PAD + sw, sh))
    img.paste(devices, (x, y), devices)
    sl.d = ImageDraw.Draw(img)
    sl.overlays()
    ImageDraw.Draw(img).rectangle([x, y, x + sw, y + sh], outline=FRAME, width=2 * SS)


def draw_pair(img, x, y, sw, sh, s, landscape):
    """Connected layout: the layout frame plus its receiving frame, sharing one device layer so the
    part that crosses the edge continues in the second frame instead of being cut."""
    nxt = s.get('next') or {'layout': 'NEXT'}
    PAD = sw
    devices = Image.new('RGBA', (2 * sw + 2 * PAD, sh * 2), (0, 0, 0, 0))
    if s.get('bg') == 'panorama':            # one gradient running across both frames
        img.paste(paint_bg_tile('panorama', 2 * sw, sh), (x, y))
        s = dict(s); s.pop('bg')
    a = Slide(img, devices, (x - PAD, y), x, y, sw, sh, s)
    b = Slide(img, devices, (x - PAD, y), x + sw, y, sw, sh, nxt)
    a.draw(); b.draw()
    devices = devices.crop((PAD, 0, PAD + 2 * sw, sh))
    img.paste(devices, (x, y), devices)
    for sl in (a, b):
        sl.d = ImageDraw.Draw(img)
        sl.overlays()
    d = ImageDraw.Draw(img)
    d.rectangle([x, y, x + sw, y + sh], outline=FRAME, width=2 * SS)
    d.rectangle([x + sw, y, x + 2 * sw, y + sh], outline=FRAME, width=2 * SS)
    f = font(11)
    t = s.get('pairLabel') or u'khung nh\u1eadn'
    d.text((x + sw + 6 * SS, y + 6 * SS), t, font=f, fill=MID)


def render_row(title, subtitle, items, labels, aspect, out_path):
    """Several single slides side by side with a label above and a note below each."""
    sw, sh, landscape = slide_size(aspect)
    n = len(items)
    M, G = 40 * SS, 36 * SS
    head, lab, foot = 92 * SS, 30 * SS, 64 * SS
    widths = [sw * (2 if it.get('pair') else 1) for it in items]
    W = M * 2 + sum(widths) + G * (n - 1)
    H = head + lab + sh + foot + M
    img = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((M, 28 * SS), title, font=font(24, True), fill=INK)
    if subtitle:
        d.text((M, 62 * SS), subtitle, font=font(15), fill=MID)
    y0 = head + lab
    x = M
    for i, s in enumerate(items):
        if s.get('pair'):
            draw_pair(img, x, y0, sw, sh, s, landscape)
        else:
            draw_single(img, x, y0, sw, sh, s, landscape)
        d.text((x + 2 * SS, y0 - 24 * SS), labels[i], font=font(13, True), fill=INK)
        if s.get('note'):
            fn = font(12)
            yy = y0 + sh + 12 * SS
            for ln in wrap(d, s['note'], fn, widths[i])[:2]:
                d.text((x + 2 * SS, yy), ln, font=fn, fill=MID); yy += 18 * SS
        x += widths[i] + G
    img = img.resize((W // SS, H // SS), Image.LANCZOS)
    img.save(out_path)
    return out_path


def layout_label(L):
    L = L.upper()
    return u'%s \u00b7 %s' % (L, LAYOUT_NAMES_VI.get(L, ''))


def render_group(gr, no, aspect, out_path):
    """Layouts classified by overall form (no content): title = group name, label = layout code + name."""
    items = [dict(o) for o in gr['layouts']]
    labels = [o.get('label') or (layout_label(o.get('layout', 'L01')) + (u'  (li\u1ec1n, 2 khung)' if o.get('pair') else '')) for o in items]
    title = gr.get('title') or (u'Nh\u00f3m %s \u00b7 %s' % (no, gr.get('name', '')))
    return render_row(title, gr.get('desc', ''), items, labels, aspect, out_path)


def render_screen(sc, aspect, out_path):
    """One screen (man), several layout options side by side: 1A, 1B, 1C..."""
    no = sc.get('no', 1)
    items, labels = [], []
    for i, o in enumerate(sc['options']):
        s = dict(o)
        s.setdefault('headline', sc.get('headline'))
        s.setdefault('screen', sc.get('screen'))
        items.append(s)
        t = u'%s%s \u00b7 %s' % (no, chr(65 + i), layout_label(o.get('layout', 'L01')))
        if o.get('recommended'):
            t += u'  (Khuy\u00ean d\u00f9ng)'
        labels.append(t)
    sub = sc.get('headline') or ''
    return render_row(u'M\u00e0n %s \u00b7 %s' % (no, sc.get('keyword', '')), sub, items, labels, aspect, out_path)


def picks_to_direction(spec):
    """selection.picks: layout codes ("L05"), option codes from screens ("1B"), or objects ({"layout": "L05", "rotate": -10})."""
    sel = spec['selection']
    by_no = dict((str(sc.get('no', i + 1)), sc) for i, sc in enumerate(spec.get('screens', [])))
    slides, names = [], []
    for pk in sel['picks']:
        if isinstance(pk, dict):
            o = dict(pk)
        else:
            pk = pk.strip().upper()
            if pk.startswith('L') or pk in ('SIDE', 'NEXT'):
                o = {'layout': pk}
            else:
                sc = by_no[pk[:-1]]
                o = dict(sc['options'][ord(pk[-1]) - 65])
                o.setdefault('headline', sc.get('headline'))
                o.setdefault('screen', sc.get('screen'))
        slides.append(o)
        names.append(o.get('layout', 'L01').upper() if isinstance(pk, dict) else pk)
    return {'selection': True, 'id': sel.get('id', 'chot'), 'name': sel.get('name', u' \u00b7 '.join(names)),
            'connect': sel.get('connect', 'P0'), 'why': sel.get('why'), 'tradeoff': sel.get('tradeoff'),
            'slides': slides}


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    src = sys.argv[1]
    with open(src, encoding='utf-8') as f:
        spec = json.load(f)
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(src)), 'wireframes')
    os.makedirs(out, exist_ok=True)
    aspect = spec.get('aspect', [1290, 2796])
    for i, gr in enumerate(spec.get('groups', [])):
        fname = gr.get('file') or ('nhom-%02d.png' % (i + 1))
        print(render_group(gr, i + 1, aspect, os.path.join(out, fname)))
    for i, sc in enumerate(spec.get('screens', [])):
        sc.setdefault('no', i + 1)
        print(render_screen(sc, aspect, os.path.join(out, 'man-%02d.png' % int(sc['no']))))
    if spec.get('selection'):
        dr = picks_to_direction(spec)
        print(render_direction(dr, aspect, os.path.join(out, 'chot-%s.png' % dr['id'])))
    for dr in spec.get('directions', []):
        p = render_direction(dr, aspect, os.path.join(out, 'wireframe-%s.png' % dr.get('id', 'X')))
        print(p)


if __name__ == '__main__':
    main()
