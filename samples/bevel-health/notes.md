# Bevel: Health & Performance (App Store, Health & Fitness)

**Phong cách:** cao cấp, điềm tĩnh, kiểu "Apple-like". Nhiều khoảng thở, UI thật được đẩy lên làm nhân vật chính.

## Bố cục
- Ảnh dọc, **text-top**, căn giữa. Máy nằm giữa và **tràn nhẹ mép dưới**.
- Ảnh 1 (hero) có cấu trúc riêng: logo + tên app → headline → máy → **badge xếp hạng 4.7+ có vòng nguyệt quế** ở đáy.
- Ảnh 5: **không có máy**, chỉ các thẻ UI (card) cắt từ app, xếp tầng trôi nổi.
- Ảnh 4: **2 máy chồng nhau**, máy sau to, máy trước nhỏ lệch phải.

## Khung thiết bị
- iPhone viền đen mảnh, có Dynamic Island, bóng đổ mềm và rộng.
- Ảnh chụp màn hình sạch: 9:41, dữ liệu mẫu đẹp.

## Typography
- Sans-serif **Medium/Semibold** (không quá đậm), chữ thường, 2 dòng cân bằng.
- **Pill tag (eyebrow) phía trên headline**: icon + tên tính năng ("Nutrition", "Sleep", "Strain"), nền trắng mờ, bo tròn hoàn toàn.
- Headline nhỏ hơn mẫu của engine: khoảng 6% chiều rộng ảnh.

## Màu & nền
- Gradient **xám bạc** sáng (ảnh 1 có ảnh nội thất làm mờ). Riêng ảnh Sleep dùng **nền tối navy** để khớp với UI tối của màn hình đó. Nền đổi theo tông của màn hình trong máy.
- Không dùng màu brand rực, để màu của UI tự nổi.

## Kỹ thuật đặc trưng
1. **Thẻ UI nổi (callout card)**: cắt một khối trong app (thẻ REM sleep, khung scan món ăn), phóng to, đặt **đè lên mép máy**, có bóng đổ. Đây là kỹ thuật tạo chiều sâu và nhấn đúng tính năng.
2. **Icon tile nổi** (ảnh 1): ô vuông bo góc kiểu kính mờ (glassmorphism) chứa icon, rải quanh máy.
3. **Social proof**: badge 4.7+ có vòng nguyệt quế. **Chỉ dùng khi có số liệu thật.**

## Đối chiếu với engine hiện tại
| Yếu tố | Engine | Ghi chú |
|---|---|---|
| Text-top, máy tràn đáy, gradient | ✅ | `layout: text-top`, `device.bleed: true` |
| Nền riêng theo ảnh (ảnh Sleep tối) | ✅ | `slides[].background` |
| Logo trên headline ảnh 1 | ✅ | `logo` |
| Pill tag trên headline | ✅ | `eyebrow` (icon tuỳ chọn) |
| Thẻ UI nổi đè máy | ✅ | `callouts` với `relativeTo: "device"` |
| Badge nguyệt quế | ✅ | `badge` (chỉ số liệu thật) |
| 2 máy chồng nhau | ✅ | `secondDevice` |
| Ảnh không có máy, chỉ thẻ | ✅ | `device.style: none` + `callouts` |
| Nền ảnh chụp làm mờ | ⚠️ | Decoration `image` full khung, chưa có blur |
