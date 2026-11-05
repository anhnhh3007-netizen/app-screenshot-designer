# Định dạng `spec.json`

Mỗi dự án là một file `<projectsRoot>/<app-slug>/spec.json`, nằm ngoài folder tool (`projectsRoot` khai báo trong `config.json`). Tạo nhanh bằng `scripts/new-project.sh <app-slug>`. Đường dẫn tương đối trong spec được tính từ thư mục chứa spec. Ví dụ đầy đủ (trong `projectsRoot`): `_example/spec.json` (panorama, đa target) và `_demo-features/spec.json` (logo, pill tag, thẻ nổi, badge, sandwich, slide không có máy) và `_demo-features-2/spec.json` (hiệu ứng chữ, watermark, danh sách lợi ích, bong bóng chat, 2 máy).

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
  "subColor": "#DCD4FF"
}
```
`angle`: 0 = trái → phải, 90 = dưới → trên. Thêm `"radial": true` để có gradient tròn.

## `device`

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `style` | `frame` | `frame` (viền vector) · `frameless` (bo góc màn hình) · `mockup` (PSD smart object) · `none` (không có máy) |
| `scale` | 0.76 (0.80 iPad) | Chiều rộng máy / chiều rộng ảnh |
| `bleed` | false | true: máy được phép tràn khỏi mép ảnh, không bị thu nhỏ cho vừa |
| `bezel` | 0.035 | Độ dày viền / chiều rộng máy |
| `bezelColor` | `#111318` | Màu viền |
| `screenRadius` | 0.13 iOS · 0.09 Android · 0.045 iPad | Bo góc màn hình / chiều rộng màn hình |
| `island` | true | Vẽ Dynamic Island (chỉ iOS + frame) |
| `shadow` | true | true, false, hoặc `{ "opacity": 35, "size": 0.05, "distance": 0.02, "color": "#000" }` (size và distance tính theo chiều rộng ảnh) |
| `screenColor` | `#E9ECF2` | Màu màn hình placeholder |
| `mockup` | | Xem bên dưới |

### Mockup PSD của người dùng

```jsonc
"device": {
  "style": "mockup",
  "mockup": {
    "psd": "../../samples/iphone-clay.psd",   // file mockup
    "smartObject": "SCREEN",                   // tên smart object chứa màn hình
    "hideLayers": ["Background", "Shadow"]     // layer cần ẩn để PNG trong suốt
  }
}
```
Engine mở mockup, thay ảnh chụp màn hình vào smart object, xuất PNG trong suốt, rồi đặt vào ảnh như một khối máy. Ảnh chụp màn hình phải đúng tỉ lệ smart object.

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
  "scale": 1.1, "width": 1, "iconFill": "#FFFFFF", "iconOpacity": 20, "iconColor": "#FFFFFF", "color": "#E3EEFF"
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
Viết tắt: `"eyebrow": "Nutrition"`. Pill nằm ngay trên headline, căn theo `typography.align`.

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

```jsonc
"badge": { "title": "4.8", "subtitle": "★★★★★", "x": 0.5, "y": 0.9, "scale": 1, "color": "#111318", "laurel": true, "laurelColor": "#111318" }
```
- `x`, `y`: tâm badge, tỉ lệ theo slide. `laurel: false` để bỏ vòng nguyệt quế.
- Ví dụ khác: `{ "title": "100,000+", "subtitle": "REVIEWS" }`.
- **Chỉ dùng số liệu thật do người dùng cung cấp.** Không bịa điểm đánh giá, số người dùng hay giải thưởng.

## `decorations[]`

```jsonc
{ "type": "circle", "x": 0.7, "y": 0.55, "w": 0.65, "fill": "#FFFFFF", "opacity": 8 }
{ "type": "rect", "x": 0.1, "y": 0.4, "w": 0.8, "h": 0.2, "radius": 0.05, "fill": { "type": "gradient", "stops": ["#fff", "#eee"] } }
{ "type": "image", "path": "input/logo.png", "x": 0.06, "y": 0.03, "w": 0.15, "h": 0.05 }
```
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

- Chưa tô màu riêng **một vài từ trong cùng một dòng**. Tô theo dòng thì dùng headline nhiều phần với `color` riêng.
- Chưa có đuôi nhọn cho bong bóng chat.
- Chưa xoay hay nghiêng máy, chưa hỗ trợ 3 máy trở lên: dùng `style: "mockup"` hoặc script riêng (xem phần "Khi engine không đủ" trong file agent).
