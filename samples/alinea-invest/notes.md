# Alinea: đầu tư cho người mới (App Store, Finance)

**Phong cách:** táo bạo, Gen Z, "poster". Headline **condensed cực đậm IN HOA**, tím neon + đen trên nền xám nhạt, có vật thể 3D đất sét (clay) và ảnh người thật.

## Bố cục
- Ảnh dọc, nền **xám nhạt #E4E6EB** đồng nhất cho cả bộ.
- Ảnh 1 (hero):
  - **ảnh chụp người dùng** đóng khung bo góc ở trên,
  - **2 pill viền đen** ("500K+ INVESTORS", "SIPC INSURED"),
  - headline 3 dòng ở dưới, **dòng cuối màu tím**.
- Ảnh 2: headline 2 dòng ở trên (từ "ALINEA" màu tím), máy giữa, **ảnh 2 founder trong pill** kèm tên ở dưới.
- Ảnh 3: số liệu "10-15%*" màu tím + "WEALTH GROWTH", máy giữa, **chú thích nhỏ (footnote)** ở đáy: "*Past performance is not a reliable indicator…".
- Ảnh 4: headline 2 dòng ("BEGINNERS" màu tím), máy giữa.
- Máy **cắt ở đáy** (bleed), không có bóng.

## Khung thiết bị
- Viền **mảnh màu xám nhạt** (gần như frameless), góc bo lớn.

## Typography
- **Condensed Black IN HOA** (kiểu Druk, Obviously Condensed, Anton), leading rất chặt (~0.9), cỡ khoảng 12% chiều rộng.
- Đổi màu **theo dòng hoặc theo từ** (ALINEA, NO FEAR, BEGINNERS).
- Pill: chữ đậm IN HOA, viền đen 2px, nền trắng.

## Màu & nền
- Xám nhạt #E4E6EB, đen #111, tím #B04CF5.
- Vật thể 3D clay tím (đô la, robot, ghép hình, kỳ lân) xếp chồng lên mép máy.

## Kỹ thuật đặc trưng
1. **Typography poster**: condensed đậm, IN HOA, đổi màu từ khoá.
2. **Ảnh người thật** làm hero, tạo cảm giác gần gũi.
3. **Footnote pháp lý** cho số liệu tài chính. Đây là điểm tốt, nên làm theo khi có số liệu hiệu suất.
4. **Pill viền** cho social proof. **Chỉ dùng số liệu thật.**

## Đối chiếu với engine
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Nền đồng nhất, IN HOA, leading chặt | ✅ | `theme.background`, `typography.uppercase`, `leading` |
| Đổi màu theo dòng | ✅ | Headline nhiều phần |
| Máy tràn đáy, viền mảnh sáng | ✅ | `device.bleed`, `bezelColor`, `bezel` nhỏ, `shadow: false` |
| Ảnh người dùng bo góc | ✅ | `callouts` với `source` là ảnh riêng, `crop` toàn ảnh, `radius` |
| Vật thể 3D clay | ⚠️ | Decoration `image` (cần PNG) |
| Font condensed IN HOA | ⚠️ | Cần cài font (Anton, Bebas Neue, Oswald). Máy đã có `SFPro-CondensedBlack` và `AcuminConcept-ExtraCondensedBlack` |
| Đổi màu **một từ** trong dòng | ✅ | `[từ khoá]` |
| Pill viền (outline) | ✅ | `eyebrow.outline` |
| Footnote ở đáy | ✅ | `footnote` |
| Ảnh founder trong pill + tên | ❌ | Cần bổ sung (hoặc callout + text tách rời) |
