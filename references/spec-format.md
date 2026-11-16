# Định dạng `spec.json`

Mỗi dự án là một file `<projectsRoot>/<app-slug>/spec.json`, nằm ngoài folder tool (`projectsRoot` khai báo trong `config.json`). Tạo nhanh bằng `scripts/new-project.sh <app-slug>`. Đường dẫn tương đối trong spec được tính từ thư mục chứa spec. Ví dụ đầy đủ (trong `projectsRoot`): `_example/spec.json` (panorama, đa target) và `_demo-features/spec.json` (logo, pill tag, thẻ nổi, badge, sandwich, slide không có máy) `_demo-features-2/spec.json` (hiệu ứng chữ, watermark, danh sách lợi ích, bong bóng chat, 2 máy) và `_demo-features-3/spec.json` (từ khoá accent, máy nghiêng, grain, logo báo chí, số liệu, thẻ tính năng, footnote, pill viền).

Chạy:
```bash
scripts/run-ps.sh scripts/build.jsx <projectsRoot>/<app-slug>/spec.json
```

## Cấu trúc tổng

```jsonc
{
  "project": "vi-tien",                 // tên dùng cho tên document
  "language": "vi",                     // ghi chú, engine không dùng
  "outputDir": "output",                // mặc định "output"
  "targets": ["ios-6.9", "android-phone", "play-feature", { "id": "linkedin", "w": 1200, "h": 627 }],
  "panorama": true,                     // nền và decorations liền một dải qua mọi ảnh
  "layout": "text-top",                 // bố cục ảnh dọc: text-top | text-bottom | sandwich | device-only
  "landscapeLayout": "side",            // bố cục ảnh ngang: side | device-only
  "logo": { "path": "input/logo.png", "text": "Vipay", "height": 0.07 },  // logo mặc định, slide bật bằng "logo": true
  "fonts": { "headline": ["SFPro-Bold", "Inter-Bold"], "subheadline": ["SFPro-Regular"] },
  "typography": { ... },
  "theme": { ... },
  "device": { ... },
  "decorations": [ ... ],               // chỉ dùng khi panorama = true
  "slides": [ ... ],
  "featureGraphic": { ... },            // slide riêng cho target single (play-feature); nếu thiếu thì dùng slides[0]
  "targetOverrides": { "play-feature": { "panorama": false } },  // ghi đè bất kỳ khoá nào theo từng target
  "keepOpen": false                     // true: để PSD mở trong Photoshop sau khi build
}
```

Danh sách target có sẵn: xem `references/store-specs.md`.

## `fonts`

Dùng **postScriptName**. Có thể là chuỗi hoặc mảng (lấy font đầu tiên có trên máy). Tìm tên font:
```bash
scripts/run-ps.sh scripts/list-fonts.jsx "montserrat"
```
Nếu không có font nào, engine dùng font dự phòng (SF Pro → Inter → Helvetica Neue → Arial) và ghi cảnh báo trong `warnings`.

## `typography`

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `headlineScale` | 1 | Nhân với cỡ chữ gốc (7.5% chiều rộng ảnh dọc, 5.8% với iPad, 10% chiều cao ảnh ngang) |
| `subRatio` | 0.56 | Cỡ subheadline = headline × subRatio |
| `maxLines` | 2 | Headline vượt số dòng thì tự thu nhỏ (tối đa còn 60%) |
| `subMaxLines` | 3 | Tương tự cho subheadline |
| `align` | center (dọc), left (ngang) | left · center · right |
| `leading` | 1.08 | Khoảng cách dòng headline |
| `tracking` | -10 | Khoảng cách chữ headline |
| `accentColor` | `theme.accentColor` | Màu cho từ khoá viết trong ngoặc vuông: `"Cách [dễ nhất] để…"` |
| `accentUnderline` | false | Gạch chân từ khoá trong ngoặc vuông |
| `uppercase` | false | Tự chuyển headline (và watermark) sang IN HOA, đúng cả dấu tiếng Việt |
| `partGap` | 0.12 | Khoảng cách giữa các phần của headline nhiều cỡ chữ (× cỡ headline) |
| `effects` | | Hiệu ứng chữ cho headline: `{ "stroke": { "width": 0.03, "color": "#FFF", "opacity": 100 }, "glow": { "size": 0.25, "spread": 10, "color": "#9FD0FF", "opacity": 60 } }` (width, size × cỡ chữ) |

Headline nhiều dòng được tự cân bằng độ dài các dòng để tránh một chữ mồ côi ở dòng cuối.

## `theme`

```jsonc
{
  "background": "#F5F3FF",                                         // màu đơn
  "background": { "type": "gradient", "angle": 0, "stops": ["#2B1A8F", "#8F5CFF"] },
  "background": { "type": "gradient", "angle": 90, "stops": [{ "color": "#fff", "location": 0 }, { "color": "#eee", "location": 0.7 }] },
  "headlineColor": "#FFFFFF",
  "subColor": "#DCD4FF",
  "accentColor": "#7BE0C3"           // màu từ khoá [..] trong headline/subheadline, số liệu stats
}
```
`angle`: 0 = trái → phải, 90 = dưới → trên. Thêm `"radial": true` để có gradient tròn.

## `device`

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `style` | `frame` | `frame` (viền vector) · `frameless` (bo góc màn hình) · `mockup` (PSD smart object) · `none` (không có máy) |
| `scale` | 0.76 (0.80 iPad) | Chiều rộng máy / chiều rộng ảnh |
| `rotate` | 0 | Xoay máy (độ, dương = theo chiều kim đồng hồ). Kết hợp `deviceOffsetX` và `bleed` cho kiểu máy nghiêng tràn mép |
| `bleed` | false | true: máy được phép tràn khỏi mép ảnh, không bị thu nhỏ cho vừa |
| `bezel` | 0.035 | Độ dày viền / chiều rộng máy |
| `bezelColor` | `#111318` | Màu viền |
| `screenRadius` | 0.13 iOS · 0.09 Android · 0.045 iPad | Bo góc màn hình / chiều rộng màn hình |
| `island` | true | Vẽ Dynamic Island (chỉ iOS + frame) |
| `shadow` | true | true, false, hoặc `{ "opacity": 35, "size": 0.05, "distance": 0.02, "color": "#000" }` (size và distance tính theo chiều rộng ảnh) |
| `screenColor` | `#E9ECF2` | Màu màn hình placeholder |
| `mockup` | | Xem bên dưới |

### Mockup PSD (khung màn hình mặc định)

**Khung mặc định của dự án mới** là mockup **clay iPhone** (Freepik 19151874), có preset sẵn trong thư viện dùng chung:

```jsonc
"device": {
  "style": "mockup",
  "scale": 0.86,
  "shadow": false,                     // dùng bóng có sẵn của mockup
  "mockup": {
    "preset": "../_stock-library/mockups/freepik-19151874_clay-iphone-white.mockup.json",
    "color": "black",                  // màu thân máy: "white" (mặc định) hoặc "black"; màu khác cần "customColor": true
    "nativeShadow": false              // tuỳ chọn: tắt bóng xám của mockup (nên tắt trên nền tối, kèm device.shadow)
  }
}
```

Preset là file JSON nằm cạnh PSD, mô tả cách dùng mockup:
```jsonc
{
  "psd": "freepik-19151874_clay-iphone-white.psd",
  "smartObject": "Editable layers/Design smart object/Your design here",   // tên hoặc đường dẫn "Group/Layer"
  "hideLayers": ["Editable layers/Background color", "..."],               // ẩn để PNG trong suốt, không có quầng sáng
  "colorLayer": "Editable layers/Phone color/Change color",                 // lớp solid fill dùng cho "color"
  "shadowLayers": ["Editable layers/Phone/Shadow 1", "Editable layers/Phone/Shadow 2"]
}
```
**Quy tắc màu thân máy:** chỉ dùng `"white"` hoặc `"black"` (preset định nghĩa mã màu ở `colors`). Màu khác (mã hex) chỉ dùng khi người dùng yêu cầu, và phải thêm `"customColor": true`, nếu không engine sẽ cảnh báo và dùng màu trắng.

Mọi khoá trong `mockup` của spec ghi đè preset. Có thể khai báo thẳng `psd`, `smartObject`… mà không cần preset.

Cách engine dựng: mở PSD, **mở smart object ra và đặt screenshot phủ kín** (`replaceMode: "replace"` để dùng Replace Contents), ẩn layer, đổi màu, **cắt sát quanh máy** (`crop: false` để giữ nguyên canvas, `cropPad` chỉnh lề), xuất PNG trong suốt rồi đặt vào slide. Mockup chưa xoay được bằng `device.rotate`. Không tìm thấy mockup thì engine tự dùng khung vector và ghi cảnh báo.

**Thêm mockup mới:** chạy `scripts/inspect-psd.jsx` để biết tên smart object và các group, rồi viết preset `.mockup.json` cạnh file PSD trong `_stock-library/mockups/`. Nhớ kiểm tra các layer phủ toàn canvas (phản chiếu, nền) và ẩn chúng.

## `slides[]`

```jsonc
{
  "screenshot": "input/01.png",        // bỏ trống thì engine vẽ placeholder
  "placeholderLabel": "Màn hình ví",   // chữ trên placeholder
  "headline": "Chuyển tiền trong 3 giây",   // \n để xuống dòng thủ công; hoặc mảng nhiều phần (xem "Headline nhiều cỡ chữ")
  "subheadline": "Quét QR hoặc chọn danh bạ",
  "layout": "text-bottom",             // ghi đè layout cho riêng ảnh này
  "landscapeLayout": "side",
  "background": "#101010",             // nền riêng (kể cả khi panorama)
  "theme": { "headlineColor": "#fff" },
  "device": { "style": "frameless" },  // ghi đè device cho riêng ảnh này
  "deviceOffsetX": 0.3,                // dịch máy theo chiều ngang (× chiều rộng ảnh); dùng cho máy vắt qua mép panorama
  "decorations": [ ... ],              // toạ độ tính trong ảnh này
  "typography": { "headlineScale": 1.25 },  // ghi đè typography cho riêng ảnh này
  "logo": true,                        // true = dùng logo chung; hoặc object riêng (xem "Logo")
  "eyebrow": "Tiết kiệm",              // pill tag phía trên headline (xem "Eyebrow")
  "callouts": [ ... ],                 // thẻ UI nổi (xem "Callouts")
  "badge": { ... },                    // badge social proof (xem "Badge")
  "bullets": [ ... ],                  // danh sách lợi ích có icon (xem "Bullets")
  "bubbles": [ ... ],                  // bong bóng chat (xem "Bubbles")
  "watermark": "AI",                   // chữ khổng lồ mờ phía sau (xem "Watermark")
  "secondDevice": { ... }              // máy thứ hai chồng lên (xem "Second device")
}
```

### Bố cục dọc

| `layout` | Thứ tự từ trên xuống |
|---|---|
| `text-top` | logo → eyebrow → headline → subheadline → máy |
| `text-bottom` | máy → logo → eyebrow → headline → subheadline |
| `sandwich` | logo → eyebrow → **subheadline** → máy → **headline** (kiểu Moneta) |
| `device-only` | chỉ máy, text bị bỏ qua vị trí |

Slide **không có máy**: `"device": { "style": "none" }` rồi dùng `callouts`, `badge`, `decorations` để lấp phần dưới.

## Headline nhiều cỡ chữ

```jsonc
"headline": [
  { "text": "Gặp gỡ", "scale": 0.9 },
  { "text": "Trợ lý", "scale": 2.6, "color": "#FFE36E" },   // màu riêng cho từng phần = cách tô accent theo dòng
  { "text": "tài chính AI", "scale": 1.3, "font": "SFPro-Black" }
]
```
Mỗi phần là một dòng riêng (1 dòng, tự thu nhỏ nếu dài), xếp chồng theo `typography.partGap`.

## Watermark

```jsonc
"watermark": { "text": "AI", "size": 1.0, "y": 0.82, "color": "#FFFFFF", "opacity": 8, "font": "SFPro-Heavy" }
```
`size` × chiều rộng ảnh, `y` là tâm theo chiều cao. Nằm ngay trên nền và bị cắt gọn trong slide (khi slide có nền riêng, tức là không bật panorama).

## Bullets (danh sách lợi ích)

```jsonc
"bullets": {
  "items": [ "Chuyển tiền miễn phí", { "text": "Hỗ trợ 24/7", "icon": "input/icon-support.png" } ],
  "scale": 1.1, "width": 1, "iconShape": "square", "iconFill": "#FFFFFF", "iconOpacity": 20, "iconColor": "#FFFFFF", "color": "#E3EEFF"
}
```
Viết tắt: `"bullets": ["…", "…"]`. Không có `icon` thì dùng dấu ✓ (đổi bằng `mark`). Danh sách nằm ngay dưới subheadline và di chuyển cùng khối text.

## Bubbles (bong bóng chat)

```jsonc
"bubbles": [
  { "text": "Số dư của mình còn bao nhiêu?", "side": "right", "relativeTo": "device", "x": 1.08, "y": 0.42, "w": 0.85 },
  { "text": "Bạn còn 12.450.000đ", "side": "left", "relativeTo": "device", "x": -0.08, "y": 0.55, "w": 0.85, "fill": "#FFFFFF" }
]
```
- `side: "right"`: `x` là **mép phải** bong bóng, mặc định nền xanh chữ trắng (tin nhắn của người dùng). `side: "left"`: `x` là mép trái, nền trắng chữ đen (câu trả lời).
- `w`: chiều rộng tối đa. Bong bóng tự co theo độ dài chữ và luôn được giữ trong vùng an toàn của slide.
- Tuỳ chọn `fill`, `color`, `scale`, `opacity`. Emoji hiển thị được.

## Second device (2 máy chồng nhau)

```jsonc
"secondDevice": { "screenshot": "input/02.png", "scale": 0.68, "x": 0.62, "y": 0.22 }
```
`scale` × chiều rộng máy chính, `x`, `y` là góc trên trái tính theo khung máy chính. Dùng chung kiểu khung (`frame` hoặc `frameless`; chưa hỗ trợ `mockup`). Kết hợp `deviceOffsetX` âm để đẩy máy chính sang trái.

## Devices (3 máy trở lên: quạt, lưới, hàng ngang)

```jsonc
"devices": [
  { "screenshot": "input/02.png", "x": 0.62, "y": 0.55, "w": 0.44, "rotate": 6 },   // x, y: tâm máy (tỉ lệ slide); w × chiều rộng ảnh
  { "x": 1.08, "y": 0.6, "w": 0.5, "z": "front" }                                   // không có screenshot = placeholder; z: "back" (mặc định) | "front"
]
```
- Thêm máy ngoài máy chính và `secondDevice`. Dùng chung kiểu khung của slide; `mockup` cần `screenshot`, thiếu thì dùng khung vector.
- `rotate` độ, chiều kim đồng hồ. `x` ngoài 0–1 để máy bị cắt bởi mép ảnh (L28).
- Slide chỉ có `devices` (không máy chính): `"device": { "style": "none" }`. Muốn các máy này vẫn dùng mockup (vd. máy nghiêng duy nhất): thêm `"style": "mockup"` vào từng máy (lấy `device.mockup` của spec).
- `secondDevice` có `rotate` riêng.

## Máy vắt qua mép (layout liền)

Máy chính, `secondDevice` hoặc `devices` vượt mép ảnh (`deviceOffsetX`, `x` ngoài 0–1, máy xoay lớn) được engine **tự nối sang ảnh kế**: phần nằm trên ảnh kế được chép vào ảnh đó, ngay trên nền và dưới chữ, nên ảnh kế có `background` riêng vẫn thấy đủ phần máy. Không cần khai báo gì thêm. Ảnh đầu vắt ra mép trái hoặc ảnh cuối vắt ra mép phải thì có cảnh báo "will be cut". Nội dung của ảnh kế phải tránh vùng máy đi vào. Không muốn nối (máy chỉ tràn mép cho đẹp, phần thừa bị nền ảnh kế che như cũ): thêm `"crossEdge": "clip"` vào slide.

## Chips (nhãn đặt tự do)

```jsonc
"chips": [ { "text": "Đặt phòng", "x": 0.07, "y": 0.3, "align": "left", "scale": 1.5, "fill": "#111318", "color": "#FFFFFF", "icon": "input/ic.png" } ]
```
`x`, `y`: điểm neo (tỉ lệ slide); `align` cho biết `x` là mép trái / giữa / mép phải của chip. Mặc định nền đen chữ trắng. Có `outline` như eyebrow.

## Arrows (mũi tên vẽ tay)

```jsonc
"arrows": [ { "from": [0.4, 0.31], "to": [0.6, 0.39], "bend": -0.45, "width": 0.01, "head": 0.045, "color": "#111318" } ]
```
`bend`: độ cong (tỉ lệ độ dài; dương cong về bên phải hướng đi, âm về bên trái). `width`, `head` × chiều rộng ảnh.

## Text xoay

```jsonc
"typography": { "rotate": -55, "rotateX": 0.3, "rotateY": 0.3 }
```
Xoay cả khối logo / eyebrow / headline / subheadline (độ, chiều kim đồng hồ) quanh tâm của nó; `rotateX`, `rotateY` (tuỳ chọn) đặt tâm khối chữ sau khi xoay. Dùng với `layout: "device-only"` để vị trí máy không phụ thuộc chữ (L27).

## Từ khoá accent

Viết từ khoá trong ngoặc vuông ở `headline` hoặc `subheadline`: `"Nơi mục tiêu gặp [tăng trưởng]"`. Ngoặc bị bỏ đi khi dựng. Từ khoá dùng `typography.accentColor` (hoặc `theme.accentColor`), thêm `typography.accentUnderline: true` để gạch chân. **Không dùng in nghiêng.**

## Grain

```jsonc
"grain": { "amount": 10, "opacity": 45 }   // ở cấp spec (panorama hoặc mọi slide) hoặc trong từng slide; true = mặc định
```
Một lớp nhiễu hạt đơn sắc ở chế độ Overlay, phủ lên nền.

## Press logos ("Featured in")

```jsonc
"pressLogos": { "title": "Được nhắc đến trên", "items": ["input/press-1.png", "input/press-2.png"], "height": 0.03, "color": "#FFFFFF", "opacity": 80, "maxWidth": 0.86 }
```
Logo tự xếp hàng, căn giữa, thu nhỏ nếu quá rộng. `color` tô một màu cho logo (logo đơn sắc). Không có `y` thì hàng logo nằm trong luồng text, ngay dưới headline, và máy tự dời xuống. Có `y` thì đặt cố định theo tâm. **Chỉ dùng khi app thật sự được báo chí nhắc tới.**

## Stats (cột số liệu)

```jsonc
"stats": { "items": [ { "value": "811K+", "label": "Người dùng" } ], "x": 0.93, "y": 0.5, "align": "right", "scale": 0.85, "valueColor": "#1C6FE8", "labelColor": "#3D4452", "gap": 0.75 }
```
`x` là mép trái (`align: left`), mép phải (`right`) hoặc tâm (`center`). **Chỉ dùng số liệu thật**, kèm `footnote` nếu cần chú thích.

## Cards (thẻ tính năng tự vẽ)

```jsonc
"cards": [ { "title": "Kiểm soát chi tiêu", "text": "Theo dõi chi tiêu…", "icon": "input/icon.png", "x": 0.07, "y": 0.52, "w": 0.86,
             "relativeTo": "slide", "fill": "#FFFFFF", "iconFill": "#EEE8FF", "iconShape": "square", "radius": 0.07, "scale": 1 } ]
```
Thẻ trắng có bóng, icon bên trái, tiêu đề và mô tả bên phải. Chiều cao tự tính theo nội dung.

## Footnote

```jsonc
"footnote": "*Hiệu suất quá khứ không đảm bảo kết quả tương lai."
"footnote": { "text": "…", "scale": 1.3, "color": "#EDE5FF", "align": "center", "bottom": 0.975 }
```
Chữ nhỏ ở đáy slide. Khi có footnote, text căn dưới tự chừa thêm khoảng trống.

## Logo

```jsonc
"logo": { "path": "input/logo.png", "text": "Vipay", "height": 0.07, "textScale": 0.62, "font": "SFPro-Bold", "color": "#FFFFFF" }
```
- `height`: chiều cao logo × chiều rộng ảnh. `text`: wordmark đặt bên phải icon (bỏ `path` nếu chỉ có chữ).
- Khai báo ở cấp spec rồi bật cho từng slide bằng `"logo": true`, hoặc khai báo object riêng trong slide.

## Eyebrow (pill tag)

```jsonc
"eyebrow": { "text": "Nutrition", "icon": "input/icon-food.png", "fill": "#FFFFFF", "opacity": 85, "color": "#1A1A1A", "scale": 1 }
```
Viết tắt: `"eyebrow": "Nutrition"`. Pill viền: `"outline": { "color": "#FFFFFF", "width": 0.1 }` kèm `"opacity": 0` để nền trong suốt. Pill nằm ngay trên headline, căn theo `typography.align`.

## Callouts (thẻ UI nổi)

Cắt một vùng trong ảnh, phóng to thành thẻ bo góc có bóng đổ, đặt đè lên máy hoặc tự do trên nền.

```jsonc
"callouts": [
  {
    "source": "screenshot",            // mặc định: screenshot của slide; hoặc đường dẫn ảnh khác
    "crop": { "x": 0.03, "y": 0.35, "w": 0.94, "h": 0.2 },   // vùng cắt, tỉ lệ theo ảnh nguồn
    "relativeTo": "device",            // "slide" (mặc định) hoặc "device": x, y, w tính theo khung máy
    "x": -0.12, "y": 0.52, "w": 0.82,  // góc trên trái và chiều rộng thẻ; chiều cao tự tính theo tỉ lệ vùng cắt
    "radius": 0.06,                    // bo góc × chiều rộng thẻ
    "shadow": { "opacity": 30, "size": 0.05, "distance": 0.015 },   // false để tắt
    "border": { "width": 0.02, "color": "#FFFFFF" }                  // viền tuỳ chọn
  }
]
```
- Xác định `crop`: mở screenshot, đo toạ độ vùng cần lấy rồi chia cho kích thước ảnh. Kiểm tra bằng `sips -g pixelWidth -g pixelHeight`.
- `x` âm hoặc `x + w > 1` khi `relativeTo: "device"` sẽ cho thẻ tràn ra ngoài mép máy (hiệu ứng nổi).
- Thẻ được vẽ đè lên máy, dưới text.

## Badge (social proof)

`badge` là một object, hoặc **mảng** nhiều badge (L25: 3 dòng đánh giá).

```jsonc
"badge": { "title": "4.8", "subtitle": "★★★★★", "x": 0.5, "y": 0.9, "scale": 1, "color": "#111318", "laurel": true, "laurelColor": "#111318" }
```
- `x`, `y`: tâm badge, tỉ lệ theo slide. `laurel: false` để bỏ vòng nguyệt quế.
- Ví dụ khác: `{ "title": "100,000+", "subtitle": "REVIEWS" }`.
- **Chỉ dùng số liệu thật do người dùng cung cấp.** Không bịa điểm đánh giá, số người dùng hay giải thưởng.

## Tài nguyên Adobe Stock

Mọi đường dẫn ảnh (`decorations`, `callouts.source`, `cards.icon`, `bullets.icon`, `pressLogos`, `device.mockup.psd`) có thể trỏ tới thư viện dùng chung: `"../_stock-library/3d/1146985365_piggy-bank.png"`. Xem `references/adobe-stock.md`.

## `decorations[]`

```jsonc
{ "type": "circle", "x": 0.7, "y": 0.55, "w": 0.65, "fill": "#FFFFFF", "opacity": 8 }
{ "type": "rect", "x": 0.1, "y": 0.4, "w": 0.8, "h": 0.2, "radius": 0.05, "fill": { "type": "gradient", "stops": ["#fff", "#eee"] } }
{ "type": "image", "path": "input/logo.png", "x": 0.06, "y": 0.03, "w": 0.15, "h": 0.05 }
{ "type": "polygon", "points": [[1, 0.32], [1, 1], [0, 1], [0, 0.86]], "fill": "#5B3DF5" }   // nền chia chéo (L22)
```
- Mọi loại có thể thêm `rotate` (độ, chiều kim đồng hồ), ví dụ sticker nghiêng (L16).
- `blur`: làm mờ Gaussian, bán kính = tỉ lệ × chiều rộng một ảnh (ví dụ `0.18`). Dùng cho vệt loang mềm (B03): **một** circle + blur thay cho nhiều vòng đồng tâm.
- `blend`: chế độ hoà trộn `"screen" | "overlay" | "softLight" | "multiply" | "lighten" | "color" | "normal"`.
- Lưu ý màu: vệt màu sáng (xanh chanh, vàng) để opacity thấp trên nền tối sẽ ngả màu xỉn / ô-liu. Trên nền tối, vệt loang nên dùng màu đậm (tím, xanh dương); màu sáng chỉ làm điểm nhấn nhỏ, opacity cao.
- `x`, `w` tính theo **chiều rộng một ảnh**, `y`, `h` theo **chiều cao ảnh**. Bỏ `h` thì h = w (hình tròn hoặc vuông).
- Ở cấp spec (panorama), `x = 1.5` nghĩa là giữa ảnh 2 và ảnh 3, dùng để tạo hình vắt qua mép nối.
- `opacity` là phần trăm 0–100.

## Kết quả

```
<outputDir>/
  psd/<target>.psd          // 1 PSD/target: N ảnh xếp cạnh nhau, mỗi ảnh là 1 group, screenshot là smart object
  <target>/01_<slug>.png    // PNG không alpha, sRGB, đúng kích thước
  <target>/_overview.jpg    // ảnh thu nhỏ cả dải để duyệt nhanh
```
Script in ra `OK {json}` với danh sách file và `warnings`, hoặc `ERROR: …` (exit code 1).

## Giới hạn hiện tại

- Chưa có đuôi nhọn cho bong bóng chat.
- Máy chỉ xoay phẳng, chưa có phối cảnh 3D.
- `secondDevice` chưa hỗ trợ mockup (dùng `devices` với `screenshot` nếu cần mockup).
- Chưa có kiểu khoanh tròn từ khoá (vẽ tay quanh chữ).
