# Danh mục layout gợi ý

Dùng ở **Bước 3a** (agent): sau khi hỏi làm rõ, agent gửi **các nhóm layout phân loại theo bố cục tổng thể** (không theo nội dung). Mọi khung chỉ có chữ giữ chỗ **Title** + **Subtitle 2 dòng**. Người dùng **tự chọn layout cho từng ảnh** theo mã (L01…L14).

Mọi layout trong file này **engine dựng được** bằng spec. Cột "Spec chính" ghi các trường cần dùng; chi tiết xem `spec-format.md`.

## 1. Layout cho từng ảnh

Sơ đồ khung dọc: `T` = headline, `s` = subheadline, `▯` = máy, `◇` = trang trí / thẻ / badge.

| Mã | Tên | Sơ đồ | Dùng khi | Spec chính | Mẫu |
|---|---|---|---|---|---|
| **L01** | Text trên, máy dưới | `T s / ▯▯▯` | Mặc định, an toàn, dễ đọc ở thumbnail | `layout: "text-top"` | finmate, paylix |
| **L02** | Máy trên, text dưới | `▯▯▯ / T s` | Phá nhịp giữa bộ; màn hình có phần đầu đắt giá | `layout: "text-bottom"` | finmate (ảnh 4) |
| **L03** | Sandwich | `s / ▯▯ / T` | Phong cách tạp chí, headline to ở đáy | `layout: "sandwich"` | moneta |
| **L04** | Máy tràn đáy | `T s / ▯▯▯` (máy bị cắt ở mép dưới) | Màn hình dài, muốn máy to, cảm giác gần | `device.bleed: true`, `scale` 0.8–0.95 | paylix (ảnh 2) |
| **L05** | Máy nghiêng | `T / ▱` | Năng động, fintech, hero | `device.rotate` ±10–15°, `bleed` | finmate, tandem |
| **L06** | Hai máy chồng | `T / ▯▯` lệch nhau | So sánh 2 màn hình, luồng 2 bước | `secondDevice` | bevel |
| **L07** | Máy + thẻ UI nổi | `T / ▯◇` | Nhấn 1 chi tiết UI (số dư, thông báo) | `callouts` | flooz, tandem |
| **L08** | Máy + bong bóng chat | `T / ▯ ▭▭` | App chat, AI assistant, hỗ trợ | `bubbles` | bevel |
| **L09** | Hero không máy: badge | `logo / ◇ badge / T / ◇` | Ảnh 1 khi có social proof **thật** | `device.style: "none"`, `badge`, `pressLogos` | paylix (ảnh 1) |
| **L10** | Danh sách lợi ích | `T / • • • •` | Gom nhiều tính năng nhỏ vào 1 ảnh | `device.style: "none"`, `bullets` | finmate (ảnh 2) |
| **L11** | Số liệu | `T / ▯ + 811K+ …` | Có số liệu thật để khoe | `stats` (+ máy lệch `deviceOffsetX`) | finmate (ảnh 3) |
| **L12** | Thẻ tính năng | `logo / T / ◇ card / tagline` | Ảnh kết, ảnh giới thiệu không cần màn hình | `device.style: "none"`, `cards`, `footnote` | paylix (ảnh 1) |
| **L13** | Watermark chữ lớn | `T / ▯` trên chữ khổng lồ mờ | Nhấn 1 từ khoá (AI, 0%, 24/7) | `watermark` | demo-features-2 |
| **L14** | Chỉ máy | `▯▯▯` | Màn hình tự nói được, ảnh cuối | `layout: "device-only"` | — |

### Layout bổ sung (L15–L28, phân tích từ mẫu tham khảo)

Engine: ✅ dựng được bằng spec hiện có · ⚠️ dựng được một phần / cần asset · 🔧 cần bổ sung engine trước khi dựng.

| Mã | Tên | Mô tả bố cục | Engine | Nguồn |
|---|---|---|---|---|
| **L15** | Quạt màn hình | Title trên; 3–4 màn hình xoè hình quạt phía sau một máy nghiêng | ✅ `devices` | App editor, ảnh 1 |
| **L16** | Collage vật thể | Title trên; không máy; vật thể / sticker / nhãn giá rải khắp ảnh | ⚠️ cần PNG (`decorations` image + `rotate`) | App editor, ảnh 2 |
| **L17** | Máy + dải thumbnail | Title trên; máy; dải 3–5 thumbnail chạy ngang đè mép dưới máy | ✅ `decorations` image/rect | App editor, ảnh 5 |
| **L18** | Ảnh nền thật | Ảnh chụp thật tràn nền; máy ở nửa dưới; Title đặt trên màn hình máy | ✅ `decorations` image + `typography.top` | App editor, ảnh 6 |
| **L19** | Chip + mũi tên | Title căn trái; chip nhãn (icon + chữ) và mũi tên vẽ tay chỉ vào máy nghiêng | ✅ `chips`, `arrows` | App du lịch, ảnh 1 |
| **L20** | Cặp máy nghiêng + chip | Không Title; 2 máy nghiêng cùng góc chồng lệch; chip nhãn ở góc trên và dưới | ✅ `secondDevice.rotate`, `chips` | App du lịch, ảnh 2 |
| **L21** | Hero đôi vắt 2 ảnh | Một máy khổng lồ nghiêng ~40° vắt qua 2 ảnh; Title ở ảnh thứ hai. Dùng theo cặp, P2 | ✅ `rotate` + `scale` + `deviceOffsetX` | Bộ template, hàng 1 |
| **L22** | Nền chia chéo | Nền chia 2 mảng bằng đường chéo; máy nghiêng ở mảng sáng; Title trong mảng màu | ✅ `decorations` polygon | Bộ template, hàng 2–3 |
| **L23** | Chữ khổng lồ | Title cực lớn căn trái chiếm nửa trên; máy chỉ ló góc dưới | ✅ `headlineScale`, `align: left` | Bộ template, hàng 4 |
| **L24** | Lưới máy lặp | Nhiều máy nghiêng lặp thành hoạ tiết phủ ảnh; khung Title đè lên | ✅ `devices` | Bộ template, hàng 4 |
| **L25** | Đánh giá | Title trên; 3 dòng đánh giá, mỗi dòng có nguyệt quế 2 bên. Chỉ đánh giá thật | ✅ `badge` dạng mảng | Bộ template, hàng 4 |
| **L26** | Trích dẫn lớn | Thẻ trích dẫn lớn có dấu ngoặc kép, đuôi thoại; người nói ở dưới. **Không in nghiêng** | ✅ `decorations` rect + headline | Bộ template, hàng 4 |
| **L27** | Chữ xoay theo máy | Máy nghiêng; Title + Subtitle xoay cùng trục với máy | ✅ `typography.rotate` | Bộ template, hàng 5 |
| **L28** | Ba máy hàng ngang | Máy giữa đầy đủ, 2 máy hai bên bị cắt bởi mép ảnh; badge nhỏ ở đáy | ✅ `devices` | Bộ dark green, ảnh 6 |

Không thêm vào danh mục vì trùng layout đã có (chỉ khác trang trí): text trên + máy có thẻ UI (= L07), máy tràn đáy với từ khoá khoanh tròn (= L04 + accent), máy tràn đỉnh / đáy xen kẽ (= L02 / L04), 2 máy nghiêng ló góc (= L06 + `rotate`). Kiểu **khoanh tròn từ khoá** là accent chữ, ghi nhận để bổ sung engine sau.

Khung ngang (Feature Graphic, Showcase 16:9): dùng `landscapeLayout: "side"` (text một bên, máy một bên).

## 2. Kiểu nối giữa các ảnh

| Mã | Kiểu | Spec chính | Ghi chú |
|---|---|---|---|
| **P0** | Rời từng ảnh | `panorama: false` | Mỗi ảnh có nền riêng; dễ đổi thứ tự, dễ A/B test |
| **P1** | Nền nối liền | `panorama: true`, gradient chung | Lướt ngang thấy liền mạch, máy vẫn nằm gọn trong ảnh |
| **P2** | Máy vắt qua mép | `panorama: true` + `deviceOffsetX` ±0.3–0.5 | Mạnh nhất về thị giác; khó đổi thứ tự ảnh sau này |

## 3. Nhóm layout theo bố cục tổng thể

Ảnh có sẵn trong `references/layout-groups/` (vẽ từ `templates/layout-groups.json`). Không phụ thuộc nội dung app nên **gửi thẳng, không cần vẽ lại**:

| Ảnh | Nhóm | Layout |
|---|---|---|
| `nhom-01.png` | Text trên, máy dưới | L01 · L04 · L05 · L13 |
| `nhom-02.png` | Máy trên, text dưới | L02 · L03 · L14 |
| `nhom-03.png` | Máy + chi tiết nổi | L06 · L07 · L08 · L11 · L17 · L19 |
| `nhom-04.png` | Không máy | L09 · L10 · L12 · L16 · L25 · L26 |
| `nhom-05.png` | Nhiều máy | L15 · L20 · L21 · L24 · L28 (L20, L21, L24, L28 vẽ thành cặp 2 khung) |
| `nhom-06.png` | Nền & chữ làm chủ đạo | L18 · L22 · L23 · L27 |
| `chot-vi-du.png` | Ví dụ một bộ đã ghép | L05 · L01 · L08 · L07 · L12 |

Tất cả L01–L28 đều dựng được bằng engine (spec mẫu: `<PROJECTS>/_demo-layouts-2/spec.json`). L16 cần ảnh PNG vật thể. Layout mới sau này nếu chưa có trong engine thì đánh dấu 🔧 và báo người dùng trước khi dựng.

Mọi khung dùng chữ giữ chỗ: **Title** (đậm) + **Subtitle dòng 1 / dòng 2**. Không đưa headline hay keyword thật vào bước này.

Chỉ vẽ lại nhóm khi đổi kích thước target (ví dụ iPad, ảnh ngang) hoặc khi engine có layout mới:
```bash
python3 scripts/wireframe.py templates/layout-groups.json references/layout-groups        # bản mặc định iPhone
python3 scripts/wireframe.py <PROJECTS>/<app>/wireframes.json                              # bản riêng của dự án
```

Lưu ý khi người dùng chọn:
- **Ảnh 1–2 quyết định lượt tải**: nên có máy to (L04, L05) hoặc hero (L09, L12). Không nên L10/L14 ở ảnh 1.
- L09, L11 chỉ khi có **số liệu / giải thưởng thật**.
- Google Play cấm call-to-action kiểu "Tải ngay": không dùng nút CTA ở bất kỳ layout nào.

## 4. Định dạng `wireframes.json` (bộ đã chọn của dự án)

```jsonc
{
  "aspect": [1290, 2796],               // kích thước target chính; ảnh ngang → tự dùng layout SIDE
  "selection": {
    "id": "v1",                          // sửa lần sau: v2, v3…
    "picks": ["L05", "L01", "L08", "L07", "L12"],          // theo thứ tự ảnh
    // hoặc kèm tuỳ chọn: { "layout": "L05", "rotate": -10 }, { "layout": "L02", "offsetX": 0.5 }
    "connect": "P1",
    "why": "...", "tradeoff": "..."
  }
}
```
Kết quả: `<PROJECTS>/<app>/wireframes/chot-<id>.png`. Tuỳ chọn mỗi ảnh: `rotate` (độ), `offsetX` (× chiều rộng ảnh, máy vắt mép khi P2), `bleed`, `scale`, `watermark`, `sub: false`. Script vẫn hỗ trợ `groups`, `screens`, `directions` nếu cần.

**Dự phòng** khi máy thiếu Pillow (`pip3 install --user pillow`): vẽ khung ASCII trong khối code theo thư viện khung dưới đây.

```
 L01        L02        L03        L04        L05        L06        L07
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ TTTT │  │┌────┐│  │  ss  │  │ TTTT │  │ TTTT │  │ TTTT │  │ TTTT │
│  ss  │  ││ ▯  ││  │┌────┐│  │┌────┐│  │  ╱▔▔╲│  │┌──┐┌┐│  │┌───┐ │
│┌────┐│  ││    ││  ││ ▯  ││  ││ ▯  ││  │ ╱ ▯ ╱│  ││▯ ││││  ││ ▯ ◇◇│
││ ▯  ││  │└────┘│  │└────┘│  ││    ││  │╱   ╱ │  ││  │└┘│  ││   │ │
││    ││  │ TTTT │  │ TTTT │  ││    ││  │╲__╱  │  ││  │  │  ││   │ │
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘

 L08        L09        L10        L11        L12        L13        L14
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ TTTT │  │ logo │  │ TTTT │  │ TTTT │  │ logo │  │ TTTT │  │┌────┐│
│┌───┐ │  │ ◇◇◇◇ │  │      │  │┌──┐  │  │ TTTT │  │░░░░░░│  ││    ││
││ ▯ ▭▭│  │ TTTT │  │ • ── │  ││▯ │99│  │      │  │░┌──┐░│  ││ ▯  ││
│▭▭  │ │  │  ss  │  │ • ── │  ││  │99│  │ ◇◇◇◇ │  │░│▯ │░│  ││    ││
││   │ │  │ ◇  ◇ │  │ • ── │  ││  │99│  │  ss  │  │░│  │░│  │└────┘│
└──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘
```
`TTTT` headline · `ss` subheadline · `▯` máy · `◇` thẻ / badge · `▭▭` bong bóng chat · `•` bullet · `99` số liệu · `░` watermark.

## 5. Người dùng chọn layout cho từng ảnh

Người dùng trả lời theo thứ tự ảnh, ví dụ `L05, L01, L08, L07, L12` (khung nhận của layout liền ghi `NEXT`, ví dụ `L21, NEXT, L01`), hoặc bằng lời ("ảnh 1 máy nghiêng, ảnh 2–4 text trên máy dưới, ảnh cuối thẻ tính năng"). Agent:

1. Ghi `selection.picks` và `connect` vào `<PROJECTS>/<app>/wireframes.json`.
2. Kiểm tra trước khi vẽ, báo rõ nếu có vấn đề kèm cách xử lý; **vẫn làm theo nếu người dùng giữ ý**:

| Vấn đề | Cách xử lý |
|---|---|
| > 3 loại layout trong bộ | Nhắc giữ cùng cỡ Title, vị trí và kích thước máy để đồng bộ |
| Ảnh 1 là L10 / L14 | Nhắc ảnh 1 nên có máy to hoặc hero |
| P2 nhưng các ảnh kề nhau không có máy để vắt mép | Đề xuất P1, bỏ `offsetX` |
| 2 ảnh liền nhau cùng layout lạ (L05, L13…) | Đề xuất đổi 1 ảnh để tránh lặp |
| Chọn L09 / L11 nhưng không có số liệu thật | Đề xuất L12 hoặc L04 |
| Layout liền nhưng khung sau nó có nội dung ở mép trái, hoặc layout liền là ảnh cuối | Đề xuất `NEXT` làm khung nhận, hoặc thêm khung nhận ở cuối (mục 6) |

3. Vẽ `chot-<id>.png`, gửi. Người dùng muốn đổi ảnh nào thì sửa, vẽ lại (`id` mới), gửi lại tới khi chốt.

## 6. Lưu ý cho layout liền (nối qua mép ảnh)

**Layout liền** là layout có phần tử vắt qua mép sang ảnh kế bên: kiểu nối **P2**, và các layout **L20, L21, L22, L24, L28** khi dùng ở chế độ panorama. Nền nối liền **P1** cũng áp dụng các lưu ý về mép và thứ tự.

| Mã | Phần vắt qua mép | Ghi chú |
|---|---|---|
| L20 | Máy thứ hai nghiêng vắt sang ảnh kế | Chip nhãn phải nằm gọn trong một ảnh |
| L21 | Máy khổng lồ chiếm 2 ảnh | **Luôn dùng theo cặp**; Title đặt ở ảnh thứ hai |
| L22 | Đường chéo nền chạy tiếp sang ảnh kế | Dùng `decorations` polygon ở **cấp spec** (toạ độ x = 0…N), không đặt trong từng slide |
| L24 | Lưới máy lặp phủ nhiều ảnh | Máy ở mép phải khớp vị trí với ảnh kế |
| L28 | Hai máy bên bị cắt có thể là máy giữa của ảnh kế | Máy bị cắt ở mép phải và mép trái ảnh kế phải là **cùng một máy** |

### Khung tiếp theo nhận phần còn lại, không cắt

- Chọn một layout liền thì **khung ngay sau nó là khung nhận**: phần máy vắt qua mép phải **hiện đủ** ở mép trái khung nhận, không bị cắt, không bị nền của khung nhận che.
- Ảnh nhóm vẽ các layout liền thành **cặp 2 khung** (`liền, 2 khung`): khung layout + khung nhận. Mã khung nhận là **`NEXT`**: chỉ có Title + Subtitle đặt xa phần máy đi vào (mặc định ở đáy; L21 ở trên).
- Khung nhận có thể là `NEXT` hoặc một layout khác, miễn là nội dung của nó **tránh vùng mép trái** nơi phần máy đi vào. Ví dụ: `L21, NEXT, L01…` hoặc `L28, L02…`.
- Layout liền **không được là ảnh cuối** (không có khung nhận); L28 có máy vắt cả hai mép thì **ảnh trước nó** cũng là khung nhận.
- Engine tự làm phần này: máy vắt mép được gom nhóm, phần nằm trên khung kế được chép sang khung kế, đặt **ngay trên nền** và **dưới chữ** của khung đó, nên khung kế có nền màu riêng vẫn thấy đủ. Không có khung kế thì engine cảnh báo "will be cut". Demo: `<PROJECTS>/_demo-connected/`.

### Lưu ý khi thiết kế

1. **Mỗi ảnh vẫn phải đứng riêng được.** Store có thể chỉ hiện 1–3 ảnh đầu (kết quả tìm kiếm, quảng cáo, chia sẻ), nên từng ảnh phải đọc hiểu được thông điệp khi tách khỏi bộ.
2. **Không đặt chữ, chip, badge, mặt người hay chi tiết UI quan trọng vắt qua mép.** App Store và Google Play hiển thị các ảnh có **khoảng hở và bo góc** giữa chúng, phần nằm trên mép sẽ bị cắt hoặc lệch.
3. **Vùng an toàn**: giữ nội dung quan trọng cách mép trái / phải ≥ 4% chiều rộng ảnh, trừ phần cố ý vắt qua. Màn hình app trên máy vắt mép: phần đè lên mép chỉ nên là vùng UI không quan trọng.
4. **Khóa thứ tự.** Bộ liền không đổi thứ tự hay bớt ảnh lẻ được. Khi A/B test (Product Page Optimization của Apple, Store listing experiments của Google Play), phải test **cả cụm liền** hoặc chỉ test ảnh không liền (thường là ảnh 1).
5. **Mỗi kích thước target dựng riêng.** Tỉ lệ iPhone 6.9", 6.5", iPad và Google Play khác nhau nên vị trí phần vắt mép phải kiểm tra lại cho từng target. Engine dựng mỗi target thành một dải liền rồi cắt, nhưng các toạ độ `deviceOffsetX`, polygon cần soát lại bằng mắt.
6. **Ảnh đầu của dải** (ảnh 1) nên tự đứng, không cụt một nửa máy ở mép trái. **Ảnh cuối** không nên có phần vắt ra mép phải (không có ảnh nào nhận).
7. **Khi bản địa hoá** (nhiều ngôn ngữ), độ dài chữ đổi nhưng phần liền không đổi: giữ chữ xa vùng nối để không phải sửa lại bố cục.
8. **Kiểm tra cuối**: mở `_overview.jpg` để xem cả dải, **và** mở từng PNG riêng để xem mỗi ảnh khi bị tách ra.

## 7. Kiểu nền (B01–B11)

Ảnh: `references/layout-groups/nen-01.png`, `nen-02.png` (vẽ từ `templates/background-styles.json`). Ảnh trắng đen chỉ minh hoạ **kiểu nền**; màu thật chốt ở Bước 3b. Agent **luôn hỏi người dùng phần nền** sau khi chốt layout, trước khi làm concept.

| Mã | Kiểu nền | Spec engine | Lưu ý |
|---|---|---|---|
| B01 | Đơn sắc | `background: "#hex"` | Gọn, hợp mọi app |
| B02 | Gradient dọc | `background: { type: "gradient", angle: 90, stops: [...] }` | Chuyển sắc nhẹ 2 màu cùng tông dễ đẹp hơn 2 màu tương phản |
| B03 | Gradient loang | nền + `decorations` circle có `blur` (~0.15–0.2) | Trên nền tối dùng màu đậm cho vệt loang; màu sáng dễ ngả xỉn |
| B04 | Nền tối | `background` tối + chữ trắng | Máy trắng, hoặc máy đen + `nativeShadow: false` |
| B05 | Nhiễu hạt | `grain: { amount, opacity }` | Kết hợp được với B01–B03 |
| B06 | Chia khối | `decorations` polygon / rect | Chữ đặt gọn trong một mảng, đủ tương phản |
| B07 | Hoạ tiết trang trí | `decorations` circle / image (+ `rotate`) | Vật thể 3D / sticker cần PNG trong `_stock-library` |
| B08 | Hoạ tiết lặp | `decorations` (nhiều circle / rect nhỏ) | Giữ thật nhạt để không tranh với máy |
| B09 | Ảnh thật | `decorations` image tràn ảnh (`fit: "cover"`) | Chỉ ảnh người dùng có quyền dùng; thêm lớp tối / sáng để chữ đọc được |
| B10 | Mỗi ảnh một màu | `background` riêng cho từng slide | Màu gắn với tính năng hoặc xen kẽ sáng / đậm; giữ cùng độ sáng để bộ đồng đều |
| B11 | Nền liền cả bộ | `panorama: true` + `theme.background` (+ `decorations` cấp spec) | Theo lưu ý layout liền (mục 6) |

Trong `wireframes.json`, mỗi ảnh ghi `"bg": "B02"` (B10: thêm `"tone": 120–240` khác nhau mỗi ảnh; B11: dùng `"connect": "P1"`).

